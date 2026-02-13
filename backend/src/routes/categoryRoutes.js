const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRole');

router.get('/', categoryController.getAllCategories);
router.get('/active', categoryController.getActiveCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.post('/', authMiddleware, requireRole('admin'), categoryController.createCategory);
router.put('/:id', authMiddleware, requireRole('admin'), categoryController.updateCategory);
router.delete('/:id', authMiddleware, requireRole('admin'), categoryController.deleteCategory);

module.exports = router;
