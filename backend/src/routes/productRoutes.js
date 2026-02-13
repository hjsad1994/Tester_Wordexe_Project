const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRole');

router.get('/', productController.getAllProducts);
router.get('/active', productController.getActiveProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.get('/slug/:slug', productController.getProductBySlug);
router.post(
	'/',
	authMiddleware,
	requireRole('admin'),
	productController.createProduct,
);
router.put(
	'/:id',
	authMiddleware,
	requireRole('admin'),
	productController.updateProduct,
);
router.delete(
	'/:id',
	authMiddleware,
	requireRole('admin'),
	productController.deleteProduct,
);

module.exports = router;
