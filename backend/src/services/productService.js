const productRepository = require('../repositories/productRepository');
const categoryRepository = require('../repositories/categoryRepository');
const cloudinary = require('../config/cloudinary');
const { NotFoundError, ValidationError } = require('../errors');

class ProductService {
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
			throw new ValidationError('Search query must be at least 2 characters');
		}
		return productRepository.search(query.trim(), options);
	}

	async createProduct(data) {
		if (!data.name) {
			throw new ValidationError('Product name is required');
		}
		if (data.price === undefined || data.price === null) {
			throw new ValidationError('Price is required');
		}
		if (!data.category) {
			throw new ValidationError('Category is required');
		}

		const category = await categoryRepository.findById(data.category);
		if (!category) {
			throw new NotFoundError(`Category with id ${data.category} not found`);
		}

		if (data.sku) {
			const exists = await productRepository.existsBySku(data.sku);
			if (exists) {
				throw new ValidationError(
					`Product with SKU '${data.sku}' already exists`,
				);
			}
		}

		return productRepository.create(data);
	}

	async updateProduct(id, data) {
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

		const product = await productRepository.update(id, data);
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
					folder: 'products',
					resource_type: 'image',
					allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
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

	async deleteProduct(id) {
		const product = await productRepository.delete(id);
		if (!product) {
			throw new NotFoundError(`Product with id ${id} not found`);
		}
		return product;
	}
}

module.exports = new ProductService();
