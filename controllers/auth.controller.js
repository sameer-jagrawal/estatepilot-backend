const authService = require("../services/auth.service");
const userService = require("../services/user.service");

const {
  sendSuccess,
  sendUnauthorized,
  sendBadRequest,
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

const forgotPassword = async (req, res) => {
  try {
    await authService.requestPasswordReset(req.body, process.env.CLIENT_URL);

    return sendSuccess(
      res,
      "If an account exists for this email, a password reset link has been sent"
    );
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return sendBadRequest(res, "Passwords do not match");
    }

    await authService.resetPassword(req.body);

    res.clearCookie("token", cookieOptions);
    res.clearCookie("role", cookieOptions);

    return sendSuccess(res, "Password reset successfully");
  } catch (error) {
    if (error.message === "Invalid or expired reset link") {
      return sendUnauthorized(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

module.exports = {
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
};
