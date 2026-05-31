// success response
const sendSuccess = (
  res,
  message = "Success",
  data = {},
  meta = {}
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta,
  });
};

// created response
const sendCreated = (
  res,
  message = "Created successfully",
  data = {}
) => {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
};

// update response
const sendUpdate = (
  res,
  message = "Updated successfully",
  data = {},
  meta = {}
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta,
  });
};

// delete response
const sendDelete = (
  res,
  message = "Deleted successfully"
) => {
  return res.status(200).json({
    success: true,
    message,
  });
};

// bad request
const sendBadRequest = (
  res,
  message = "Bad request",
  errors = null
) => {
  return res.status(400).json({
    success: false,
    message,
    errors,
  });
};

// unauthorized (login/token issues)
const sendUnauthorized = (
  res,
  message = "Unauthorized"
) => {
  return res.status(401).json({
    success: false,
    message,
  });
};

// forbidden (permission issues)
const sendForbidden = (
  res,
  message = "Forbidden"
) => {
  return res.status(403).json({
    success: false,
    message,
  });
};

// not found
const sendNotFound = (
  res,
  message = "Not found"
) => {
  return res.status(404).json({
    success: false,
    message,
  });
};

// conflict (duplicate data)
const sendConflict = (
  res,
  message = "Data already exists"
) => {
  return res.status(409).json({
    success: false,
    message,
  });
};

// validation error
const sendValidationError = (
  res,
  message = "Validation failed",
  errors = []
) => {
  return res.status(422).json({
    success: false,
    message,
    errors,
  });
};

// too many requests (rate limit)
const sendTooManyRequests = (
  res,
  message = "Too many requests"
) => {
  return res.status(429).json({
    success: false,
    message,
  });
};

// internal server error
const sendServerError = (
  res,
  message = "Internal server error"
) => {
  return res.status(500).json({
    success: false,
    message,
  });
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendUpdate,
  sendDelete,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendValidationError,
  sendTooManyRequests,
  sendServerError,
};