const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || error.status || 500;
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500 ? "Internal server error" : error.message || "Internal server error",
  });
};

module.exports = errorHandler;
