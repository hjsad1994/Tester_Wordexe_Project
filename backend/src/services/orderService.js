const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { NotFoundError, ValidationError } = require('../errors');

const DEFAULT_SHIPPING_FEE = 30000;
const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_METHODS = ['cod', 'momo'];

const STATUS_TRANSITIONS = {
  pending: ['paid', 'processing', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const requireObjectId = (value, fieldName) => {
  if (!isObjectId(value)) {
    throw new ValidationError(`${fieldName} is invalid`);
  }
};

const ensureRequiredText = (value, fieldName) => {
  if (!value || !String(value).trim()) {
    throw new ValidationError(`${fieldName} is required`);
  }
};

const normalizeCustomerInfo = (customerInfo = {}) => {
  ensureRequiredText(customerInfo.fullName, 'fullName');
  ensureRequiredText(customerInfo.phone, 'phone');
  ensureRequiredText(customerInfo.province, 'province');
  ensureRequiredText(customerInfo.district, 'district');
  ensureRequiredText(customerInfo.ward, 'ward');
  ensureRequiredText(customerInfo.address, 'address');

  return {
    fullName: String(customerInfo.fullName).trim(),
    phone: String(customerInfo.phone).trim(),
    province: String(customerInfo.province).trim(),
    district: String(customerInfo.district).trim(),
    ward: String(customerInfo.ward).trim(),
    address: String(customerInfo.address).trim(),
    notes: customerInfo.notes ? String(customerInfo.notes).trim() : '',
  };
};

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `BB-${timestamp}-${suffix}`;
};

const generatePublicAccessToken = () => crypto.randomBytes(16).toString('hex');

class OrderService {
  async createOrder(payload = {}, context = {}) {
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new ValidationError('Order must contain at least one item');
    }

    const paymentMethod = payload.paymentMethod || 'cod';
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      throw new ValidationError('Payment method is invalid');
    }

    const productIds = payload.items.map((item) => item.productId || item.id);
    if (productIds.some((id) => !isObjectId(id))) {
      throw new ValidationError('One or more product IDs are invalid');
    }

    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productById = new Map(products.map((product) => [String(product._id), product]));

    const orderItems = payload.items.map((inputItem) => {
      const productId = String(inputItem.productId || inputItem.id || '');
      const product = productById.get(productId);

      if (!product) {
        throw new NotFoundError(`Product with id ${productId} not found`);
      }

      const quantity = Number(inputItem.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new ValidationError(`Invalid quantity for product ${productId}`);
      }

      return {
        product: product._id,
        productName: product.name,
        productPrice: Number(product.price),
        quantity,
        image: product.images?.[0] || '',
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
    const shippingFee =
      payload.shippingFee === undefined ? DEFAULT_SHIPPING_FEE : Number(payload.shippingFee);
    if (!Number.isFinite(shippingFee) || shippingFee < 0) {
      throw new ValidationError('Shipping fee is invalid');
    }

    const status = paymentMethod === 'momo' ? 'paid' : 'pending';
    const customerInfo = normalizeCustomerInfo(payload.customerInfo);

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      publicAccessToken: generatePublicAccessToken(),
      user: isObjectId(context.userId) ? context.userId : null,
      items: orderItems,
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      customerInfo,
      paymentMethod,
      status,
      statusHistory: [
        {
          from: null,
          to: status,
          changedBy: isObjectId(context.userId) ? context.userId : null,
          note: 'Order created',
        },
      ],
    });

    return this.getOrderById(order._id);
  }

  async getOrderById(id, options = {}) {
    requireObjectId(id, 'orderId');

    const { includeDeleted = false, accessToken = '' } = options;
    const query = includeDeleted ? { _id: id } : { _id: id, deletedAt: null };
    if (accessToken) {
      query.publicAccessToken = accessToken;
    }

    const order = await Order.findOne(query)
      .populate('items.product', 'name slug')
      .populate('user', 'name email')
      .lean();

    if (!order) {
      throw new NotFoundError(`Order with id ${id} not found`);
    }

    return order;
  }

  async listOrders(options = {}) {
    const page = Number(options.page) > 0 ? Number(options.page) : 1;
    const limit = Number(options.limit) > 0 ? Math.min(Number(options.limit), 100) : 20;
    const includeDeleted = options.includeDeleted === true;
    const skip = (page - 1) * limit;

    const filter = includeDeleted ? {} : { deletedAt: null };
    if (options.status) {
      if (!ORDER_STATUSES.includes(options.status)) {
        throw new ValidationError('Status filter is invalid');
      }
      filter.status = options.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email')
        .lean(),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateOrderStatus(id, nextStatus, context = {}) {
    requireObjectId(id, 'orderId');

    if (!ORDER_STATUSES.includes(nextStatus)) {
      throw new ValidationError('Order status is invalid');
    }

    const order = await Order.findOne({ _id: id, deletedAt: null });
    if (!order) {
      throw new NotFoundError(`Order with id ${id} not found`);
    }

    if (order.status === 'delivered') {
      throw new ValidationError('Delivered orders are locked and cannot change status');
    }

    const allowedTransitions = STATUS_TRANSITIONS[order.status] || [];
    if (!allowedTransitions.includes(nextStatus)) {
      throw new ValidationError(`Invalid status transition from ${order.status} to ${nextStatus}`);
    }

    const previousStatus = order.status;
    order.status = nextStatus;
    order.statusHistory.push({
      from: previousStatus,
      to: nextStatus,
      changedBy: isObjectId(context.userId) ? context.userId : null,
      note: 'Admin status update',
    });

    await order.save();
    return this.getOrderById(order._id);
  }

  async softDeleteOrder(id, context = {}) {
    requireObjectId(id, 'orderId');

    const reason = String(context.reason || '').trim();
    if (!reason) {
      throw new ValidationError('Delete reason is required');
    }

    const order = await Order.findOne({ _id: id, deletedAt: null });
    if (!order) {
      throw new NotFoundError(`Order with id ${id} not found`);
    }

    order.deletedAt = new Date();
    order.deletedBy = isObjectId(context.userId) ? context.userId : null;
    order.deleteReason = reason;

    await order.save();
    return this.getOrderById(order._id, { includeDeleted: true });
  }
}

module.exports = new OrderService();
