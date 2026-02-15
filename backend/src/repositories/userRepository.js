const User = require('../models/User');

const normalizeEmail = (email) => email.trim().toLowerCase();

const findByEmail = (email, options = {}) => {
  const query = User.findOne({ email: normalizeEmail(email) });
  if (options.withPassword) {
    query.select('+password');
  }
  return query.exec();
};

const existsByEmail = (email) => User.exists({ email: normalizeEmail(email) });

const createUser = (data) =>
  User.create({
    ...data,
    email: normalizeEmail(data.email),
  });

const findById = (id) => User.findById(id).exec();

const updateById = (id, data) =>
  User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).exec();

module.exports = {
  findByEmail,
  existsByEmail,
  createUser,
  findById,
  updateById,
};
