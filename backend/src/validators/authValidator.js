const { body, validationResult } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Vui lòng nhập họ và tên'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Vui lòng nhập email')
    .bail()
    .isEmail()
    .withMessage('Email không hợp lệ'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Vui lòng nhập số điện thoại')
    .bail()
    .matches(/^(0|\+84)\d{9,10}$/)
    .withMessage('Số điện thoại không hợp lệ'),
  body('password')
    .notEmpty()
    .withMessage('Vui lòng nhập mật khẩu')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Mật khẩu phải có ít nhất 8 ký tự'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Vui lòng nhập email')
    .bail()
    .isEmail()
    .withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    status: 'fail',
    errors: errors.array().map(({ path, msg }) => ({
      field: path,
      message: msg,
    })),
  });
};

module.exports = { registerRules, loginRules, validate };
