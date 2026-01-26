const catchAsync = require('../utils/catchAsync');
const authService = require('../services/auth.service');
const config = require('../config');

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const register = catchAsync(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  
  res.cookie('token', token, cookieOptions);
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user },
  });
});

const login = catchAsync(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  
  res.cookie('token', token, cookieOptions);
  res.json({
    success: true,
    message: 'Login successful',
    data: { user },
  });
});

const logout = catchAsync(async (req, res) => {
  res.cookie('token', '', { ...cookieOptions, maxAge: 0 });
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

const getMe = catchAsync(async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});

module.exports = { register, login, logout, getMe };
