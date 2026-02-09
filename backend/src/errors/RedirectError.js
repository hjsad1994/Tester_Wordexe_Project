const AppError = require('./AppError');

class RedirectError extends AppError {
  constructor(message = 'Redirect', statusCode = 301, redirectUrl = '/') {
    super(message, statusCode);
    this.redirectUrl = redirectUrl;
  }
}

module.exports = { RedirectError };
