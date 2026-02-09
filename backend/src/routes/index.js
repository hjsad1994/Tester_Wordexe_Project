const express = require('express');
const router = express.Router();
const testCaseRoutes = require('./testCaseRoutes');

router.use('/test-cases', testCaseRoutes);

module.exports = router;
