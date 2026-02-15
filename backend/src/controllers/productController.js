const productService = require('../services/productService');
const { ValidationError } = require('../errors');
const { sendSuccess, sendCreated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');

exports.getAllProducts = asyncHandler(async (req, res) => {
  const { page, limit, sort } = req.query;
  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || '-createdAt',
  };
  const result = await productService.getAllProducts(options);
  sendSuccess(res, result, 'Products retrieved successfully');
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  sendSuccess(res, product, 'Product retrieved successfully');
});

exports.getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);
  sendSuccess(res, product, 'Product retrieved successfully');
});

exports.getProductsByCategory = asyncHandler(async (req, res) => {
  const { page, limit, sort } = req.query;
  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || '-createdAt',
  };
  const result = await productService.getProductsByCategory(req.params.categoryId, options);
  sendSuccess(res, result, 'Products retrieved successfully');
});

exports.getActiveProducts = asyncHandler(async (req, res) => {
  const { page, limit, sort } = req.query;
  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: sort || '-createdAt',
  };
  const result = await productService.getActiveProducts(options);
  sendSuccess(res, result, 'Active products retrieved successfully');
});

exports.searchProducts = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query;
  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
  };
  const result = await productService.searchProducts(q, options);
  sendSuccess(res, result, 'Search results retrieved successfully');
});

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  sendCreated(res, product, 'Product created successfully');
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  sendSuccess(res, product, 'Product updated successfully');
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  sendSuccess(res, null, 'Product deleted successfully');
});

exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ValidationError('Image file is required');
  }

  const product = await productService.uploadImage(req.params.id, req.file.buffer);
  sendSuccess(res, product, 'Image uploaded successfully');
});
