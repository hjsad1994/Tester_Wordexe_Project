const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const { NotFoundError, ValidationError } = require('../errors');

class CouponService {
  async createCoupon(data) {
    if (!data.code) {
      throw new ValidationError('Coupon code is required');
    }
    if (!data.name) {
      throw new ValidationError('Coupon name is required');
    }
    if (!data.discountType) {
      throw new ValidationError('Discount type is required');
    }
    if (data.discountType === 'percentage' && data.discountValue > 100) {
      throw new ValidationError('Percentage discount cannot exceed 100%');
    }

    const normalizedCode = String(data.code).trim().toUpperCase();
    const exists = await Coupon.findOne({ code: normalizedCode });
    if (exists) {
      throw new ValidationError(`Coupon with code '${normalizedCode}' already exists`);
    }

    const allowedFields = [
      'code',
      'name',
      'description',
      'discountType',
      'discountValue',
      'maximumDiscount',
      'minimumOrderAmount',
      'usageLimit',
      'perUserLimit',
      'isActive',
      'validFrom',
      'validUntil',
      'createdBy',
    ];
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowedFields.includes(k))
    );

    return Coupon.create({
      ...filtered,
      code: normalizedCode,
    });
  }

  async getAllCoupons() {
    return Coupon.find().sort('-createdAt');
  }

  async getCouponById(id) {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      throw new NotFoundError(`Coupon with id ${id} not found`);
    }
    return coupon;
  }

  async updateCoupon(id, data) {
    const allowedFields = [
      'code',
      'name',
      'description',
      'discountType',
      'discountValue',
      'maximumDiscount',
      'minimumOrderAmount',
      'usageLimit',
      'perUserLimit',
      'isActive',
      'validFrom',
      'validUntil',
    ];
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowedFields.includes(k))
    );

    if (filtered.code) {
      filtered.code = String(filtered.code).trim().toUpperCase();
      const existing = await Coupon.findOne({ code: filtered.code, _id: { $ne: id } });
      if (existing) {
        throw new ValidationError(`Coupon with code '${filtered.code}' already exists`);
      }
    }
    if (filtered.discountType === 'percentage' && filtered.discountValue > 100) {
      throw new ValidationError('Percentage discount cannot exceed 100%');
    }

    const coupon = await Coupon.findByIdAndUpdate(id, filtered, {
      new: true,
      runValidators: true,
    });
    if (!coupon) {
      throw new NotFoundError(`Coupon with id ${id} not found`);
    }
    return coupon;
  }

  async deleteCoupon(id) {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      throw new NotFoundError(`Coupon with id ${id} not found`);
    }
    if (coupon.usageCount > 0) {
      throw new ValidationError(
        'Cannot delete a coupon that has been used. Deactivate it instead.'
      );
    }
    await Coupon.findByIdAndDelete(id);
    return coupon;
  }

  async validateCoupon(code, subtotal, userId) {
    if (!code) {
      throw new ValidationError('Coupon code is required');
    }

    const normalizedCode = String(code).trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalizedCode });

    if (!coupon) {
      throw new ValidationError('Mã khuyến mãi không tồn tại');
    }

    if (!coupon.isActive) {
      throw new ValidationError('Mã khuyến mãi đã bị vô hiệu hóa');
    }

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      throw new ValidationError('Mã khuyến mãi chưa có hiệu lực');
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      throw new ValidationError('Mã khuyến mãi đã hết hạn');
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      throw new ValidationError('Mã khuyến mãi đã hết lượt sử dụng');
    }

    if (userId && coupon.perUserLimit) {
      const userUsageCount = coupon.usedBy.filter((uid) => String(uid) === String(userId)).length;
      if (userUsageCount >= coupon.perUserLimit) {
        throw new ValidationError('Bạn đã sử dụng mã khuyến mãi này');
      }
    }

    if (coupon.minimumOrderAmount > 0 && subtotal < coupon.minimumOrderAmount) {
      throw new ValidationError(
        `Đơn hàng tối thiểu ${coupon.minimumOrderAmount.toLocaleString('vi-VN')}đ để sử dụng mã này`
      );
    }

    const discountAmount = this._calculateDiscount(coupon, subtotal);

    return {
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maximumDiscount: coupon.maximumDiscount,
      },
      discountAmount,
    };
  }

  _calculateDiscount(coupon, subtotal) {
    if (coupon.discountType === 'free_shipping') {
      return 0;
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maximumDiscount !== null && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else if (coupon.discountType === 'fixed_amount') {
      discount = coupon.discountValue;
    }

    if (discount > subtotal) {
      discount = subtotal;
    }

    return discount;
  }

  async redeemCoupon(couponId, userId) {
    const update = {
      $inc: { usageCount: 1 },
    };
    if (userId) {
      update.$push = { usedBy: userId };
    }

    const filter = {
      _id: couponId,
      isActive: true,
      $and: [
        {
          $or: [{ usageLimit: null }, { $expr: { $lt: ['$usageCount', '$usageLimit'] } }],
        },
      ],
    };

    // Atomic per-user limit check to prevent race condition
    if (userId) {
      const userObjectId = new mongoose.Types.ObjectId(String(userId));
      filter.$and.push({
        $or: [
          { perUserLimit: null },
          { perUserLimit: 0 },
          {
            $expr: {
              $lt: [
                {
                  $size: {
                    $filter: {
                      input: '$usedBy',
                      as: 'uid',
                      cond: { $eq: ['$$uid', userObjectId] },
                    },
                  },
                },
                '$perUserLimit',
              ],
            },
          },
        ],
      });
    }

    const coupon = await Coupon.findOneAndUpdate(filter, update, { new: true });

    if (!coupon) {
      throw new ValidationError('Mã khuyến mãi đã hết lượt sử dụng');
    }

    return coupon;
  }

  async unredeemCoupon(couponId, userId) {
    const update = { $inc: { usageCount: -1 } };
    if (userId) {
      update.$pull = { usedBy: userId };
    }
    await Coupon.findByIdAndUpdate(couponId, update);
  }

  async getAvailableCoupons() {
    const now = new Date();
    return Coupon.find({
      isActive: true,
      $and: [
        { $or: [{ validFrom: null }, { validFrom: { $lte: now } }] },
        { $or: [{ validUntil: null }, { validUntil: { $gte: now } }] },
        {
          $or: [{ usageLimit: null }, { $expr: { $lt: ['$usageCount', '$usageLimit'] } }],
        },
      ],
    }).sort('-createdAt');
  }
}

module.exports = new CouponService();
