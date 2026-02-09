const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getAllCategories);
router.get('/active', categoryController.getActiveCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
