const testCaseRepository = require('../repositories/testCaseRepository');
const { NotFoundError, ValidationError } = require('../errors');

class TestCaseService {
  async getAllTestCases() {
    return testCaseRepository.findAll();
  }

  async getTestCaseById(id) {
    const testCase = await testCaseRepository.findById(id);
    if (!testCase) {
      throw new NotFoundError(`TestCase with id ${id} not found`);
    }
    return testCase;
  }

  async createTestCase(data) {
    if (!data.title) {
      throw new ValidationError('Title is required');
    }
    return testCaseRepository.create(data);
  }

  async updateTestCase(id, data) {
    const testCase = await testCaseRepository.update(id, data);
    if (!testCase) {
      throw new NotFoundError(`TestCase with id ${id} not found`);
    }
    return testCase;
  }

  async deleteTestCase(id) {
    const testCase = await testCaseRepository.delete(id);
    if (!testCase) {
      throw new NotFoundError(`TestCase with id ${id} not found`);
    }
    return testCase;
  }

  async getTestCasesByStatus(status) {
    const validStatuses = ['pending', 'running', 'passed', 'failed'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    return testCaseRepository.findByStatus(status);
  }

  async getTestCasesByAssignee(assignee) {
    return testCaseRepository.findByAssignee(assignee);
  }
}

module.exports = new TestCaseService();
