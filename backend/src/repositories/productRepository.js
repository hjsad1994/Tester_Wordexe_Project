const Product = require('../models/Product');

class ProductRepository {
  async findAll(options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find()
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments()
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id) {
    return Product.findById(id).populate('category', 'name slug');
  }

  async findBySlug(slug) {
    return Product.findOne({ slug }).populate('category', 'name slug');
  }

  async findByCategory(categoryId, options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ category: categoryId })
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments({ category: categoryId })
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findActive(options = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ isActive: true })
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments({ isActive: true })
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async search(query, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(query, 'i');
    const filter = {
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { sku: searchRegex }
      ]
    };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async create(data) {
    const product = new Product(data);
    await product.save();
    return product.populate('category', 'name slug');
  }

  async update(id, data) {
    return Product.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('category', 'name slug');
  }

  async delete(id) {
    return Product.findByIdAndDelete(id);
  }

  async existsBySku(sku, excludeId = null) {
    const query = { sku };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return Product.exists(query);
  }

  async countByCategory(categoryId) {
    return Product.countDocuments({ category: categoryId });
  }
}

module.exports = new ProductRepository();
