const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const config = require('../config');

const protect = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;

    if (!token) {
      throw new ApiError(401, 'Not authorized, no token');
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Get user from token
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'Not authorized, user not found');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Not authorized, invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Not authorized, token expired'));
    } else {
      next(error);
    }
  }
};

module.exports = { protect };
