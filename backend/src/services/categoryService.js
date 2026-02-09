const categoryRepository = require('../repositories/categoryRepository');
const { NotFoundError, ValidationError } = require('../errors');

class CategoryService {
  async getAllCategories() {
    return categoryRepository.findAll();
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError(`Category with id ${id} not found`);
    }
    return category;
  }

  async getCategoryBySlug(slug) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundError(`Category with slug '${slug}' not found`);
    }
    return category;
  }

  async getActiveCategories() {
    return categoryRepository.findActive();
  }

  async createCategory(data) {
    if (!data.name) {
      throw new ValidationError('Category name is required');
    }

    const exists = await categoryRepository.existsByName(data.name);
    if (exists) {
      throw new ValidationError(`Category with name '${data.name}' already exists`);
    }

    return categoryRepository.create(data);
  }

  async updateCategory(id, data) {
    if (data.name) {
      const exists = await categoryRepository.existsByName(data.name, id);
      if (exists) {
        throw new ValidationError(`Category with name '${data.name}' already exists`);
      }
    }

    const category = await categoryRepository.update(id, data);
    if (!category) {
      throw new NotFoundError(`Category with id ${id} not found`);
    }
    return category;
  }

  async deleteCategory(id) {
    const category = await categoryRepository.delete(id);
    if (!category) {
      throw new NotFoundError(`Category with id ${id} not found`);
    }
    return category;
  }
}

module.exports = new CategoryService();
