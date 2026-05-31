const authService = require("../services/auth.service");
const userService = require("../services/user.service");

const {
  sendSuccess,
  sendUnauthorized,
  sendServerError,
} = require("../utils/response");
const { cookieOptions } = require("../middleware/security");

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    res.cookie("token", result.token, {
      ...cookieOptions,
    });

    res.cookie("role", result.user.role, {
      ...cookieOptions,
    });

    return sendSuccess(res, "Login successful", {
      user: result.user,
    });
  } catch (error) {
    if (
      error.message === "Invalid email or password" ||
      error.message === "Please verify your email first" ||
      error.message === "Your account is inactive" ||
      error.message === "Your account has been suspended" ||
      error.message === "Company account not found" ||
error.message === "Company account has been suspended" ||
error.message === "Company account is inactive" ||
error.message === "Company free trial has expired" ||
error.message === "Company trial has expired"

    ) {
      return sendUnauthorized(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const logout = async (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.clearCookie("role", cookieOptions);

  return sendSuccess(res, "Logout successful");
};

const me = async (req, res) => {
  try {
    const user = await userService.getUserById(
      req.user.tenantId,
      req.user.userId
    );

    return sendSuccess(res, "Current user fetched successfully", user);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

module.exports = {
  login,
  logout,
  me,
};
