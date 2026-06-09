const superAdminService = require("../services/superAdmin.service");

const {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendConflict,
  sendUnauthorized,
  sendServerError,
} = require("../utils/response");
const { cookieOptions } = require("../middleware/security");

const createSuperAdmin = async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    if (!name || !email || !password || !secretKey) {
      return sendBadRequest(res, "All fields are required");
    }

    if (!process.env.ADMIN_SETUP_SECRET || secretKey !== process.env.ADMIN_SETUP_SECRET) {
      return sendUnauthorized(res, "Invalid super admin secret key");
    }

    const admin = await superAdminService.createSuperAdmin({
      name,
      email,
      password,
    });

    return sendCreated(res, "Super admin created successfully", admin);
  } catch (error) {
    if (error.message === "Super admin already exists") {
      return sendConflict(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const loginSuperAdmin = async (req, res) => {
  try {
    const result = await superAdminService.loginSuperAdmin(req.body);

    res.cookie("admin_token", result.token, {
      ...cookieOptions,
    });

    res.cookie("admin_role", result.admin.role, {
      ...cookieOptions,
    });

    return sendSuccess(res, "Super admin login successful", {
      admin: result.admin,
    });
  } catch (error) {
    if (
      error.message === "Invalid email or password" ||
      error.message === "Super admin account is inactive"
    ) {
      return sendUnauthorized(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const logoutSuperAdmin = async (req, res) => {
  res.clearCookie("admin_token", cookieOptions);
  res.clearCookie("admin_role", cookieOptions);

  return sendSuccess(res, "Super admin logout successful");
};

const me = async (req, res) => {
  try {
    const admin = await superAdminService.getSuperAdminById(req.admin.adminId);
    return sendSuccess(res, "Current super admin fetched successfully", admin);
  } catch (error) {
    return sendUnauthorized(res, error.message);
  }
};

module.exports = {
  createSuperAdmin,
  loginSuperAdmin,
  logoutSuperAdmin,
  me,
};
