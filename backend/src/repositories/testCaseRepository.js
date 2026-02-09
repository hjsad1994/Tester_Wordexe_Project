const TestCase = require('../models/TestCase');

class TestCaseRepository {
  async findAll() {
    return TestCase.find().sort({ createdAt: -1 });
  }

  async findById(id) {
    return TestCase.findById(id);
  }

  async create(data) {
    const testCase = new TestCase(data);
    return testCase.save();
  }

  async update(id, data) {
    return TestCase.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return TestCase.findByIdAndDelete(id);
  }

  async findByStatus(status) {
    return TestCase.find({ status }).sort({ createdAt: -1 });
  }

  async findByAssignee(assignee) {
    return TestCase.find({ assignee }).sort({ createdAt: -1 });
  }
}

module.exports = new TestCaseRepository();
