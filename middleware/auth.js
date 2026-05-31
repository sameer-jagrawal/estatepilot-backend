const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const {
  sendUnauthorized,
  sendForbidden,
} = require("../utils/response");

const protect = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];


    if (!token) {
      return sendUnauthorized(res, "Authentication token missing");
    }

    const jwtSecret = process.env.JWT_SECRET || process.env.JWT_SECRETE;

    if (!jwtSecret) {
      return sendUnauthorized(res, "JWT secret is not configured");
    }

    const decoded = jwt.verify(token, jwtSecret);

    const user = await UserModel.findById(decoded.userId).select(
      "tenantId role isActive isSuspended isVerified"
    );

    if (!user) {
      return sendUnauthorized(res, "Invalid user account");
    }

    if (!user.isVerified) {
      return sendForbidden(res, "Please verify your email first");
    }

    if (!user.isActive || user.isSuspended) {
      return sendForbidden(res, "Your account is inactive or suspended");
    }
    

    req.user = {
      userId: user._id,
      tenantId: user.tenantId,
      role: user.role,
    };
    

    next();
  } catch (error) {
    return sendUnauthorized(res, "Invalid or expired token");
  }
};

module.exports = protect;
