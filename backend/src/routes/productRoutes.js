const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/active', productController.getActiveProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.get('/slug/:slug', productController.getProductBySlug);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
