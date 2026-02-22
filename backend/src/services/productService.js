const productRepository = require("../repositories/productRepository");
const categoryRepository = require("../repositories/categoryRepository");
const cloudinary = require("../config/cloudinary");
const { NotFoundError, ValidationError } = require("../errors");

class ProductService {
	normalizeQuantity(value, { required = false } = {}) {
		if (value === undefined || value === null || value === "") {
			if (required) {
				throw new ValidationError("Quantity is required");
			}
			return undefined;
		}

		const parsedQuantity = Number(value);
		if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
			throw new ValidationError("Quantity must be a non-negative integer");
		}

		return parsedQuantity;
	}

	async getAllProducts(options = {}) {
		return productRepository.findAll(options);
	}

	async getProductById(id) {
		const product = await productRepository.findById(id);
		if (!product) {
			throw new NotFoundError(`Product with id ${id} not found`);
		}
		return product;
	}

	async getProductBySlug(slug) {
		const product = await productRepository.findBySlug(slug);
		if (!product) {
			throw new NotFoundError(`Product with slug '${slug}' not found`);
		}
		return product;
	}

	async getProductsByCategory(categoryId, options = {}) {
		const category = await categoryRepository.findById(categoryId);
		if (!category) {
			throw new NotFoundError(`Category with id ${categoryId} not found`);
		}
		return productRepository.findByCategory(categoryId, options);
	}

	async getActiveProducts(options = {}) {
		return productRepository.findActive(options);
	}

	async searchProducts(query, options = {}) {
		if (!query || query.trim().length < 2) {
			throw new ValidationError("Search query must be at least 2 characters");
		}
		return productRepository.search(query.trim(), options);
	}

	async createProduct(data) {
		if (!data.name) {
			throw new ValidationError("Product name is required");
		}
		if (data.price === undefined || data.price === null) {
			throw new ValidationError("Price is required");
		}
		const normalizedData = { ...data };

		const createPriceValue = Number.parseFloat(data.price);
		if (!Number.isFinite(createPriceValue) || createPriceValue < 0) {
			throw new ValidationError("Price must be a non-negative number");
		}
		normalizedData.price = createPriceValue;
		if (!data.category) {
			throw new ValidationError("Category is required");
		}

		const category = await categoryRepository.findById(data.category);
		if (!category) {
			throw new NotFoundError(`Category with id ${data.category} not found`);
		}

		if (normalizedData.sku) {
			const exists = await productRepository.existsBySku(normalizedData.sku);
			if (exists) {
				throw new ValidationError(
					`Product with SKU '${normalizedData.sku}' already exists`,
				);
			}
		}
		const normalizedQuantity = this.normalizeQuantity(data.quantity);
		normalizedData.quantity = normalizedQuantity ?? 0;

		return productRepository.create(normalizedData);
	}

	async updateProduct(id, data) {
		const normalizedData = { ...data };

		if (Object.hasOwn(data, "quantity")) {
			normalizedData.quantity = this.normalizeQuantity(data.quantity, {
				required: true,
			});
		}

		if (data.category) {
			const category = await categoryRepository.findById(data.category);
			if (!category) {
				throw new NotFoundError(`Category with id ${data.category} not found`);
			}
		}

		if (data.sku) {
			const exists = await productRepository.existsBySku(data.sku, id);
			if (exists) {
				throw new ValidationError(
					`Product with SKU '${data.sku}' already exists`,
				);
			}
		}

		if (Object.hasOwn(data, "price")) {
			const updatePriceValue = Number.parseFloat(data.price);
			if (!Number.isFinite(updatePriceValue) || updatePriceValue < 0) {
				throw new ValidationError("Price must be a non-negative number");
			}
			normalizedData.price = updatePriceValue;
		}

		const product = await productRepository.update(id, normalizedData);
		if (!product) {
			throw new NotFoundError(`Product with id ${id} not found`);
		}
		return product;
	}

	async uploadImage(productId, fileBuffer) {
		const product = await productRepository.findById(productId);
		if (!product) {
			throw new NotFoundError(`Product with id ${productId} not found`);
		}

		const result = await new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: "products",
					resource_type: "image",
					allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
				},
				(error, uploadResult) => {
					if (error) {
						reject(error);
						return;
					}

					resolve(uploadResult);
				},
			);

			uploadStream.end(fileBuffer);
		});

		return productRepository.addImage(productId, result.secure_url);
	}

	async uploadImages(productId, files) {
		const product = await productRepository.findById(productId);
		if (!product) {
			throw new NotFoundError(`Product with id ${productId} not found`);
		}

		const currentCount = product.images ? product.images.length : 0;
		if (currentCount + files.length > 4) {
			throw new ValidationError(
				`Sản phẩm chỉ được có tối đa 4 ảnh. Hiện tại: ${currentCount}, thêm: ${files.length}`,
			);
		}

		const uploadedImages = [];
		for (const file of files) {
			try {
				const result = await new Promise((resolve, reject) => {
					const uploadStream = cloudinary.uploader.upload_stream(
						{
							folder: "products",
							resource_type: "image",
							allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
						},
						(error, uploadResult) => {
							if (error) {
								reject(error);
								return;
							}
							resolve(uploadResult);
						},
					);
					uploadStream.end(file.buffer);
				});

				uploadedImages.push({
					publicId: result.public_id,
					url: result.secure_url,
				});
			} catch {
				// Rollback: delete already uploaded images
				for (const uploaded of uploadedImages) {
					try {
						await cloudinary.uploader.destroy(uploaded.publicId);
					} catch {
						console.error(
							`Failed to cleanup Cloudinary image: ${uploaded.publicId}`,
						);
					}
				}
				throw new ValidationError("Tải ảnh lên thất bại. Vui lòng thử lại.");
			}
		}

		// Add all URLs to product atomically
		const imageUrls = uploadedImages.map((img) => img.url);
		const updatedProduct = await productRepository.addImages(
			productId,
			imageUrls,
		);

		return updatedProduct;
	}

	async deleteImage(productId, imageUrl) {
		const product = await productRepository.findById(productId);
		if (!product) {
			throw new NotFoundError(`Product with id ${productId} not found`);
		}

		if (!product.images || !product.images.includes(imageUrl)) {
			throw new NotFoundError("Không tìm thấy ảnh trong sản phẩm");
		}

		// Extract public_id from Cloudinary URL
		// Handles both versioned (upload/v123/folder/file.jpg) and
		// non-versioned (upload/folder/file.jpg) URL formats
		const urlParts = imageUrl.split("/");
		const uploadIndex = urlParts.indexOf("upload");
		if (uploadIndex !== -1) {
			// Check if next segment is a version (starts with 'v' followed by digits)
			const nextSegment = urlParts[uploadIndex + 1];
			const isVersioned = nextSegment && /^v\d+$/.test(nextSegment);
			const startIndex = isVersioned ? uploadIndex + 2 : uploadIndex + 1;
			const pathAfterUpload = urlParts.slice(startIndex).join("/");
			const publicId = pathAfterUpload.replace(/\.[^.]+$/, "");

			await cloudinary.uploader.destroy(publicId);
		}

		return productRepository.removeImage(productId, imageUrl);
	}

	async deleteProduct(id) {
		const product = await productRepository.delete(id);
		if (!product) {
			throw new NotFoundError(`Product with id ${id} not found`);
		}
		return product;
	}
}

module.exports = new ProductService();
