const mongoose = require('mongoose');

const DISCOUNT_TYPES = ['percentage', 'fixed_amount', 'free_shipping'];

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [30, 'Coupon code cannot exceed 30 characters'],
      match: [/^[A-Z0-9]+$/, 'Coupon code must contain only letters and numbers'],
    },
    name: {
      type: String,
      required: [true, 'Coupon name is required'],
      trim: true,
      maxlength: [100, 'Coupon name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
    discountType: {
      type: String,
      required: [true, 'Discount type is required'],
      enum: {
        values: DISCOUNT_TYPES,
        message: 'Discount type must be percentage, fixed_amount, or free_shipping',
      },
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    maximumDiscount: {
      type: Number,
      default: null,
      min: [0, 'Maximum discount cannot be negative'],
    },
    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount cannot be negative'],
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'Usage limit must be at least 1'],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, 'Usage count cannot be negative'],
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: [1, 'Per-user limit must be at least 1'],
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: {
      type: Date,
      default: null,
    },
    validUntil: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.virtual('isCurrentlyValid').get(function () {
  if (!this.isActive) return false;
  const now = new Date();
  if (this.validFrom && now < this.validFrom) return false;
  if (this.validUntil && now > this.validUntil) return false;
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) return false;
  return true;
});

couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
