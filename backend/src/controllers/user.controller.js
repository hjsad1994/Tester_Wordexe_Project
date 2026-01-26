const catchAsync = require('../utils/catchAsync');
const userService = require('../services/user.service');

const getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers();
  res.json({
    success: true,
    data: { users },
  });
});

const getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json({
    success: true,
    data: { user },
  });
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user },
  });
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
