const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const orderRoutes = require('./orderRoutes');
const productRoutes = require('./productRoutes');
const userRoutes = require('./userRoutes');

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/products', productRoutes);
router.use('/users', userRoutes);

module.exports = router;
