const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../errors');

module.exports = (req, _res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    throw new UnauthorizedError('Bạn chưa đăng nhập');
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    return next();
  } catch {
    throw new UnauthorizedError('Phiên đăng nhập không hợp lệ');
  }
};
