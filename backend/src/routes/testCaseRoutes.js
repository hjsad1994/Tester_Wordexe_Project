const express = require('express');
const router = express.Router();
const testCaseController = require('../controllers/testCaseController');

router.get('/', testCaseController.getAllTestCases);
router.get('/:id', testCaseController.getTestCaseById);
router.post('/', testCaseController.createTestCase);
router.put('/:id', testCaseController.updateTestCase);
router.delete('/:id', testCaseController.deleteTestCase);
router.get('/status/:status', testCaseController.getTestCasesByStatus);

module.exports = router;
