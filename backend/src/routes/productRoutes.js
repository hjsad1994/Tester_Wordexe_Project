const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRole');
const uploadProductImage = require('../middlewares/uploadMiddleware');
const reviewController = require('../controllers/reviewController');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const { uploadReviewImages } = require('../middlewares/uploadMiddleware');

router.get('/', productController.getAllProducts);
router.get('/active', productController.getActiveProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/slug/:slug', productController.getProductBySlug);
// Product reviews (nested under /products/:productId)
router.get('/:productId/reviews', optionalAuthMiddleware, reviewController.getReviews);
router.post(
  '/:productId/reviews',
  authMiddleware,
  uploadReviewImages,
  reviewController.createReview
);
router.get('/:id', productController.getProductById);
router.post('/', authMiddleware, requireRole('admin'), productController.createProduct);
router.post(
  '/:id/images',
  authMiddleware,
  requireRole('admin'),
  uploadProductImage,
  productController.uploadImage
);
router.put('/:id', authMiddleware, requireRole('admin'), productController.updateProduct);
router.delete('/:id', authMiddleware, requireRole('admin'), productController.deleteProduct);

module.exports = router;
