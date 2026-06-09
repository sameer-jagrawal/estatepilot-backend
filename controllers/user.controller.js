const userService = require("../services/user.service");

const {
  sendSuccess,
  sendCreated,
  sendUpdate,
  sendDelete,
  sendBadRequest,
  sendConflict,
  sendForbidden,
  sendNotFound,
  sendTooManyRequests,
  sendServerError,
} = require("../utils/response");

const createUser = async (req, res) => {
  try {
    if (req.user.role !== "owner" && req.user.role !== "manager") {
      return sendForbidden(res, "You are not allowed to create users");
    }

    const user = await userService.createUser({
      ...req.body,
      tenantId: req.user.tenantId,
    });

    return sendCreated(res, "User created successfully", user);
  } catch (error) {
    if (error.message === "Tenant not found") {
      return sendNotFound(res, error.message);
    }

    if (
      error.message === "User already exists" ||
      error.message === "User limit reached"
    ) {
      return sendConflict(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getUsersByTenant = async (req, res) => {
  try {
    const users = await userService.getUsersByTenant(
      req.user.tenantId,
      req.query
    );

    return sendSuccess(res, "Users fetched successfully", users);
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(
      req.user.tenantId,
      req.params.userId
    );

    return sendSuccess(res, "User fetched successfully", user);
  } catch (error) {
    if (error.message === "User not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const isSelfUpdate = String(req.user.userId) === String(req.params.userId);

    if (!isSelfUpdate && req.user.role !== "owner" && req.user.role !== "manager") {
      return sendForbidden(res, "You are not allowed to update users");
    }

    const payload = { ...req.body };

    if (isSelfUpdate && req.user.role !== "owner" && req.user.role !== "manager") {
      Object.keys(payload).forEach((key) => {
        if (!["name", "phone", "profileImage"].includes(key)) {
          delete payload[key];
        }
      });
    }

    const user = await userService.updateUser(
      req.user.tenantId,
      req.params.userId,
      payload
    );

    return sendUpdate(res, "User updated successfully", user);
  } catch (error) {
    if (error.message === "User not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const deactivateUser = async (req, res) => {
  try {
    if (req.user.role !== "owner" && req.user.role !== "manager") {
      return sendForbidden(res, "You are not allowed to deactivate users");
    }

    if (req.user.userId === req.params.userId) {
      return sendForbidden(res, "You cannot deactivate your own account");
    }

    const user = await userService.deactivateUser(
      req.user.tenantId,
      req.params.userId
    );

    return sendUpdate(res, "User deactivated successfully", user);
  } catch (error) {
    if (error.message === "User not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const activateUser = async (req, res) => {
  try {
    if (req.user.role !== "owner" && req.user.role !== "manager") {
      return sendForbidden(res, "You are not allowed to activate users");
    }

    const user = await userService.activateUser(
      req.user.tenantId,
      req.params.userId
    );

    return sendUpdate(res, "User activated successfully", user);
  } catch (error) {
    if (error.message === "User not found") {
      return sendNotFound(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const isSelfChange = String(req.user.userId) === String(req.params.userId);
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!isSelfChange && req.user.role !== "owner") {
      return sendForbidden(res, "Only owner can change other user passwords");
    }

    if (!newPassword || newPassword.length < 6) {
      return sendForbidden(res, "Password must be at least 6 characters");
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return sendForbidden(res, "Passwords do not match");
    }

    if (isSelfChange && !currentPassword) {
      return sendForbidden(res, "Current password is required");
    }

    const user = await userService.changeUserPassword(
      req.user.tenantId,
      req.params.userId,
      newPassword,
      {
        actorId: req.user.userId,
        currentPassword: isSelfChange ? currentPassword : "",
        requireCurrentPassword: isSelfChange,
      }
    );

    return sendUpdate(res, "Password changed successfully", user);
  } catch (error) {
    if (error.message === "User not found") {
      return sendNotFound(res, error.message);
    }

    if (error.message === "Current password is incorrect") {
      return sendForbidden(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const sendVerificationOtp = async (req, res) => {
  try {
    if (req.user.role !== "owner" && req.user.role !== "manager") {
      return sendForbidden(res, "You are not allowed to verify users");
    }

    const user = await userService.createAndSendVerificationOtp({
      tenantId: req.user.tenantId,
      userId: req.params.userId,
    });

    return sendSuccess(res, "Verification OTP sent successfully", {
      _id: user._id,
      email: user.email,
      isVerified: user.isVerified,
    });
  } catch (error) {
    if (error.message === "User not found") {
      return sendNotFound(res, error.message);
    }

    if (error.message === "User already verified") {
      return sendBadRequest(res, error.message);
    }

    if (error.message === "Please wait before requesting another OTP") {
      return sendTooManyRequests(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const verifyUserOtp = async (req, res) => {
  try {
    if (req.user.role !== "owner" && req.user.role !== "manager") {
      return sendForbidden(res, "You are not allowed to verify users");
    }

    const user = await userService.verifyUserOtp({
      tenantId: req.user.tenantId,
      userId: req.params.userId,
      otp: req.body.otp,
      actorId: req.user.userId,
    });

    return sendUpdate(res, "User email verified successfully", user);
  } catch (error) {
    if (error.message === "User not found") {
      return sendNotFound(res, error.message);
    }

    if (
      error.message === "OTP not found or expired" ||
      error.message === "OTP expired. Please request a new OTP." ||
      error.message === "Too many attempts. Please request a new OTP." ||
      error.message === "Invalid OTP"
    ) {
      return sendBadRequest(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};


const suspendUser = async (
  req,
  res
) => {
  try {
    if (
      req.user.role !== "owner" &&
      req.user.role !== "manager"
    ) {
      return sendForbidden(
        res,
        "You are not allowed to suspend users"
      );
    }

    if (
      req.user.userId ===
      req.params.userId
    ) {
      return sendForbidden(
        res,
        "You cannot suspend yourself"
      );
    }

    const user =
      await userService.suspendUser(
        req.user.tenantId,
        req.params.userId,
        req.user.userId,
        req.body?.suspensionReason
      );

    return sendUpdate(
      res,
      "User suspended successfully",
      user
    );
  } catch (error) {
    if (
      error.message ===
      "User not found"
    ) {
      return sendNotFound(
        res,
        error.message
      );
    }

    return sendServerError(
      res,
      error.message
    );
  }
};

const unsuspendUser = async (
  req,
  res
) => {
  try {
    if (
      req.user.role !== "owner" &&
      req.user.role !== "manager"
    ) {
      return sendForbidden(
        res,
        "You are not allowed to activate users"
      );
    }

    const user =
      await userService.unsuspendUser(
        req.user.tenantId,
        req.params.userId
      );

    return sendUpdate(
      res,
      "User activated successfully",
      user
    );
  } catch (error) {
    if (
      error.message ===
      "User not found"
    ) {
      return sendNotFound(
        res,
        error.message
      );
    }

    return sendServerError(
      res,
      error.message
    );
  }
};


module.exports = {
  createUser,
  sendVerificationOtp,
  verifyUserOtp,
  getUsersByTenant,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  changeUserPassword,
  suspendUser,
  unsuspendUser,
};
