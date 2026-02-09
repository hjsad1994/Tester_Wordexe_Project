const HTTP_STATUS = require('../constants/httpStatus');

const sendResponse = (res, { statusCode = HTTP_STATUS.OK, status = 'success', message = '', data = null }) => {
  const response = {
    status,
    message,
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

const sendSuccess = (res, data, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  return sendResponse(res, { statusCode, status: 'success', message, data });
};

const sendCreated = (res, data, message = 'Created successfully') => {
  return sendResponse(res, { statusCode: HTTP_STATUS.CREATED, status: 'success', message, data });
};

const sendNoContent = (res) => {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendCreated,
  sendNoContent,
};
