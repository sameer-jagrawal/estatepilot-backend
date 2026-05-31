const { sendForbidden } = require("../utils/response");

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return sendForbidden(res, "You are not allowed to perform this action");
    }

    return next();
  };
};

module.exports = authorizeRoles;
