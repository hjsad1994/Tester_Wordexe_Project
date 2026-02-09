const testCaseService = require('../services/testCaseService');
const { sendSuccess, sendCreated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');

exports.getAllTestCases = asyncHandler(async (req, res) => {
  const testCases = await testCaseService.getAllTestCases();
  sendSuccess(res, testCases, 'Test cases retrieved successfully');
});

exports.getTestCaseById = asyncHandler(async (req, res) => {
  const testCase = await testCaseService.getTestCaseById(req.params.id);
  sendSuccess(res, testCase, 'Test case retrieved successfully');
});

exports.createTestCase = asyncHandler(async (req, res) => {
  const testCase = await testCaseService.createTestCase(req.body);
  sendCreated(res, testCase, 'Test case created successfully');
});

exports.updateTestCase = asyncHandler(async (req, res) => {
  const testCase = await testCaseService.updateTestCase(req.params.id, req.body);
  sendSuccess(res, testCase, 'Test case updated successfully');
});

exports.deleteTestCase = asyncHandler(async (req, res) => {
  await testCaseService.deleteTestCase(req.params.id);
  sendSuccess(res, null, 'Test case deleted successfully');
});

exports.getTestCasesByStatus = asyncHandler(async (req, res) => {
  const testCases = await testCaseService.getTestCasesByStatus(req.params.status);
  sendSuccess(res, testCases, `Test cases with status '${req.params.status}' retrieved successfully`);
});
