const couponService = require('../services/couponService');
const { sendSuccess, sendCreated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');

exports.getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await couponService.getAllCoupons();
  sendSuccess(res, coupons, 'Coupons retrieved successfully');
});

exports.getCouponById = asyncHandler(async (req, res) => {
  const coupon = await couponService.getCouponById(req.params.id);
  sendSuccess(res, coupon, 'Coupon retrieved successfully');
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon({
    ...req.body,
    createdBy: req.userId || null,
  });
  sendCreated(res, coupon, 'Coupon created successfully');
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body);
  sendSuccess(res, coupon, 'Coupon updated successfully');
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  await couponService.deleteCoupon(req.params.id);
  sendSuccess(res, null, 'Coupon deleted successfully');
});

exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const result = await couponService.validateCoupon(code, subtotal, req.userId);
  sendSuccess(res, result, 'Coupon validated successfully');
});

exports.getAvailableCoupons = asyncHandler(async (req, res) => {
  const coupons = await couponService.getAvailableCoupons();
  sendSuccess(res, coupons, 'Available coupons retrieved successfully');
});
