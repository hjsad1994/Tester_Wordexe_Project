const authService = require('../services/authService');
const { sendSuccess, sendCreated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
};

exports.register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.cookie('accessToken', token, getCookieOptions());
  sendCreated(res, user, 'Đăng ký thành công');
});

exports.login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.cookie('accessToken', token, getCookieOptions());
  sendSuccess(res, user, 'Đăng nhập thành công');
});

exports.me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.userId);
  sendSuccess(res, user, 'Lấy thông tin người dùng thành công');
});

exports.logout = asyncHandler(async (_req, res) => {
  res.clearCookie('accessToken', getCookieOptions());
  sendSuccess(res, null, 'Đăng xuất thành công');
});
