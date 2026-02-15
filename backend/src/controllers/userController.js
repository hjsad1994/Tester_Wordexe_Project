const userService = require('../services/userService');
const { ValidationError } = require('../errors');
const { sendSuccess } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');

exports.getMe = asyncHandler(async (req, res) => {
  const user = await userService.getMe(req.userId);
  sendSuccess(res, user, 'Lấy thông tin hồ sơ thành công');
});

exports.updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMe(req.userId, req.body || {});
  sendSuccess(res, user, 'Cập nhật hồ sơ thành công');
});

exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ValidationError('Avatar file is required');
  }

  const user = await userService.uploadAvatar(req.userId, req.file.buffer);
  sendSuccess(res, user, 'Cập nhật ảnh đại diện thành công');
});
