const jwt = require("jsonwebtoken");
const SuperAdminModel = require("../models/SuperAdminModel");
const { sendUnauthorized } = require("../utils/response");

const adminAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.admin_token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return sendUnauthorized(res, "Admin authentication required");
    }

    if (!process.env.ADMIN_JWT_SECRET) {
      return sendUnauthorized(res, "Admin JWT secret is not configured");
    }

    const decoded = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET
    );

    const admin = await SuperAdminModel.findById(
      decoded.adminId
    ).select("-password");

    if (!admin || !admin.isActive) {
      return sendUnauthorized(res, "Invalid admin account");
    }

    req.admin = {
      adminId: admin._id,
      role: admin.role,
      email: admin.email,
    };

    next();
  } catch (error) {
    return sendUnauthorized(res, "Invalid or expired admin token");
  }
};

module.exports = adminAuth;
