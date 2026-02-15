require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('./config/cloudinary');
const Category = require('./models/Category');
const Product = require('./models/Product');

const hasCloudinaryCredentials =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

const SEED_CATEGORIES = [
  { name: 'Quần áo', description: 'Quần áo cho bé từ sơ sinh đến 5 tuổi' },
  { name: 'Bình sữa', description: 'Bình sữa và phụ kiện cho bé bú' },
  { name: 'Đồ chơi', description: 'Đồ chơi an toàn phát triển trí tuệ' },
  { name: 'Xe đẩy', description: 'Xe đẩy và ghế ngồi ô tô cho bé' },
  { name: 'Tã & Bỉm', description: 'Tã bỉm cao cấp cho bé' },
  { name: 'Phụ kiện', description: 'Ti giả, yếm, và phụ kiện cho bé' },
];

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/3933027/pexels-photo-3933027.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1257110/pexels-photo-1257110.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop',
];

const SEED_PRODUCTS = [
  {
    name: 'Bộ quần áo Cotton Organic cho bé sơ sinh',
    price: 299000,
    quantity: 50,
    categoryName: 'Quần áo',
    imageIdx: 0,
  },
  {
    name: 'Bình sữa chống đầy hơi Pigeon',
    price: 189000,
    quantity: 100,
    categoryName: 'Bình sữa',
    imageIdx: 1,
  },
  {
    name: 'Gấu bông Teddy Bear siêu mềm mại',
    price: 159000,
    quantity: 80,
    categoryName: 'Đồ chơi',
    imageIdx: 2,
  },
  {
    name: 'Tã dán cao cấp Bobby Extra Soft',
    price: 249000,
    quantity: 200,
    categoryName: 'Tã & Bỉm',
    imageIdx: 3,
  },
  {
    name: 'Xe đẩy gấp gọn đa năng',
    price: 2490000,
    quantity: 15,
    categoryName: 'Xe đẩy',
    imageIdx: 4,
  },
  {
    name: 'Nôi điện tự động ru ngủ',
    price: 1890000,
    quantity: 20,
    categoryName: 'Phụ kiện',
    imageIdx: 5,
  },
  {
    name: 'Bộ chăm sóc da cho bé Johnson',
    price: 329000,
    quantity: 60,
    categoryName: 'Phụ kiện',
    imageIdx: 6,
  },
  {
    name: 'Giày tập đi mềm chống trơn',
    price: 199000,
    quantity: 75,
    categoryName: 'Quần áo',
    imageIdx: 7,
  },
  {
    name: 'Ti giả silicon mềm cho bé',
    price: 89000,
    quantity: 150,
    categoryName: 'Phụ kiện',
    imageIdx: 1,
  },
  {
    name: 'Lục lạc đồ chơi phát triển giác quan',
    price: 129000,
    quantity: 90,
    categoryName: 'Đồ chơi',
    imageIdx: 2,
  },
  {
    name: 'Bột ăn dặm Gerber organic',
    price: 175000,
    quantity: 120,
    categoryName: 'Phụ kiện',
    imageIdx: 6,
  },
  {
    name: 'Áo khoác giữ ấm lông cừu',
    price: 450000,
    quantity: 35,
    categoryName: 'Quần áo',
    imageIdx: 0,
  },
  {
    name: 'Bình sữa thủy tinh cao cấp Comotomo',
    price: 320000,
    quantity: 55,
    categoryName: 'Bình sữa',
    imageIdx: 1,
  },
  {
    name: 'Thú nhồi bông hình thỏ dễ thương',
    price: 189000,
    quantity: 65,
    categoryName: 'Đồ chơi',
    imageIdx: 2,
  },
  {
    name: 'Tã quần Huggies Dry Pants',
    price: 289000,
    quantity: 180,
    categoryName: 'Tã & Bỉm',
    imageIdx: 3,
  },
  {
    name: 'Xe đẩy siêu nhẹ travel system',
    price: 3200000,
    quantity: 10,
    categoryName: 'Xe đẩy',
    imageIdx: 4,
  },
];

const createPublicId = (productName) =>
  `seed-${productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)}-${Date.now()}`;

async function uploadImageFromUrl(imageUrl, productName) {
  if (!hasCloudinaryCredentials) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'products',
      resource_type: 'image',
      public_id: createPublicId(productName),
    });

    return result.secure_url;
  } catch (error) {
    console.warn(`Image upload failed for "${productName}": ${error.message}`);
    return null;
  }
}

async function seedCategories() {
  const categoryMap = {};

  for (const categoryData of SEED_CATEGORIES) {
    let category = await Category.findOne({ name: categoryData.name });

    if (!category) {
      category = await new Category(categoryData).save();
      console.log(`Created category: ${categoryData.name}`);
    } else {
      console.log(`Category exists: ${categoryData.name}`);
    }

    categoryMap[categoryData.name] = category._id;
  }

  return categoryMap;
}

async function seedProducts(categoryMap) {
  for (const productData of SEED_PRODUCTS) {
    const existing = await Product.findOne({ name: productData.name });

    if (existing) {
      if (existing.images?.length) {
        console.log(`Product exists: ${productData.name}`);
        continue;
      }

      const imageUrl = await uploadImageFromUrl(
        PLACEHOLDER_IMAGES[productData.imageIdx],
        productData.name
      );

      if (imageUrl) {
        existing.images = [imageUrl];
        await existing.save();
        console.log(`Updated product image: ${productData.name}`);
        continue;
      }

      console.log(`Product exists: ${productData.name}`);
      continue;
    }

    const categoryId = categoryMap[productData.categoryName];
    if (!categoryId) {
      console.warn(`Category not found for product: ${productData.name}`);
      continue;
    }

    const imageUrl = await uploadImageFromUrl(
      PLACEHOLDER_IMAGES[productData.imageIdx],
      productData.name
    );

    const product = new Product({
      name: productData.name,
      price: productData.price,
      quantity: productData.quantity,
      category: categoryId,
      description: `${productData.name} - Sản phẩm chất lượng cao cho bé yêu`,
      images: imageUrl ? [imageUrl] : [],
      isActive: true,
    });

    await product.save();
    console.log(
      `Created product: ${productData.name}${imageUrl ? ' (with image)' : ' (no image)'}`
    );
  }
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const categoryMap = await seedCategories();
    await seedProducts(categoryMap);

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
