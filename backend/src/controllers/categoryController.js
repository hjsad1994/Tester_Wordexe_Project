const categoryService = require('../services/categoryService');
const { sendSuccess, sendCreated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');

exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  sendSuccess(res, categories, 'Categories retrieved successfully');
});

exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  sendSuccess(res, category, 'Category retrieved successfully');
});

exports.getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  sendSuccess(res, category, 'Category retrieved successfully');
});

exports.getActiveCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getActiveCategories();
  sendSuccess(res, categories, 'Active categories retrieved successfully');
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  sendCreated(res, category, 'Category created successfully');
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  sendSuccess(res, category, 'Category updated successfully');
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  sendSuccess(res, null, 'Category deleted successfully');
});
