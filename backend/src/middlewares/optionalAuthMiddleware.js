const jwt = require('jsonwebtoken');

module.exports = (req, _res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    req.userRole = payload.role === 'admin' ? 'admin' : 'user';
  } catch {
    // Invalid token — continue as unauthenticated
  }

  return next();
};
