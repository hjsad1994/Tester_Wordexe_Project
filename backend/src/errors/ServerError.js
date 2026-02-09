const AppError = require('./AppError');

class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = 'Service Unavailable') {
    super(message, 503);
  }
}

module.exports = {
  InternalServerError,
  ServiceUnavailableError,
};
