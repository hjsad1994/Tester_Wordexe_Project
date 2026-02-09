const AppError = require('./AppError');
const {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} = require('./ClientError');
const { InternalServerError, ServiceUnavailableError } = require('./ServerError');
const { RedirectError } = require('./RedirectError');
const errorHandler = require('./errorHandler');

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  InternalServerError,
  ServiceUnavailableError,
  RedirectError,
  errorHandler,
};
