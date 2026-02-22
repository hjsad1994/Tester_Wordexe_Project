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

    const normalizedCode = String(data.code).trim().toUpperCase();
    const exists = await Coupon.findOne({ code: normalizedCode });
    if (exists) {
      throw new ValidationError(`Coupon with code '${normalizedCode}' already exists`);
    }

    return Coupon.create({
      ...data,
      code: normalizedCode,
    });
  }

  async getAllCoupons() {
    return Coupon.find().sort('-createdAt').lean();
  }

  async getCouponById(id) {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      throw new NotFoundError(`Coupon with id ${id} not found`);
    }
    return coupon;
  }

  async updateCoupon(id, data) {
    if (data.code) {
      data.code = String(data.code).trim().toUpperCase();
      const existing = await Coupon.findOne({ code: data.code, _id: { $ne: id } });
      if (existing) {
        throw new ValidationError(`Coupon with code '${data.code}' already exists`);
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(id, data, {
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
      const userUsageCount = coupon.usedBy.filter(
        (uid) => String(uid) === String(userId)
      ).length;
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

    const coupon = await Coupon.findOneAndUpdate(
      {
        _id: couponId,
        isActive: true,
        $or: [
          { usageLimit: null },
          { $expr: { $lt: ['$usageCount', '$usageLimit'] } },
        ],
      },
      update,
      { new: true }
    );

    if (!coupon) {
      throw new ValidationError('Mã khuyến mãi đã hết lượt sử dụng');
    }

    return coupon;
  }

  async getAvailableCoupons() {
    const now = new Date();
    return Coupon.find({
      isActive: true,
      $and: [
        { $or: [{ validFrom: null }, { validFrom: { $lte: now } }] },
        { $or: [{ validUntil: null }, { validUntil: { $gte: now } }] },
        {
          $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usageCount', '$usageLimit'] } },
          ],
        },
      ],
    })
      .sort('-createdAt')
      .lean();
  }
}

module.exports = new CouponService();
