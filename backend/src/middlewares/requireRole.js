const { ForbiddenError } = require('../errors');

const requireRole = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      throw new ForbiddenError('Bạn không có quyền thực hiện hành động này');
    }

    return next();
  };
};

module.exports = requireRole;
