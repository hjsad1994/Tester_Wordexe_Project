const Category = require('../models/Category');

class CategoryRepository {
  async findAll() {
    return Category.find().sort({ createdAt: -1 });
  }

  async findById(id) {
    return Category.findById(id);
  }

  async findBySlug(slug) {
    return Category.findOne({ slug });
  }

  async findActive() {
    return Category.find({ isActive: true }).sort({ name: 1 });
  }

  async create(data) {
    const category = new Category(data);
    return category.save();
  }

  async update(id, data) {
    return Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return Category.findByIdAndDelete(id);
  }

  async existsByName(name, excludeId = null) {
    const query = { name: { $regex: new RegExp(`^${name}$`, 'i') } };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return Category.exists(query);
  }
}

module.exports = new CategoryRepository();
