const userService = require("../services/user.service");

const {
  sendSuccess,
  sendCreated,
  sendUpdate,
  sendDelete,
  sendConflict,
  sendForbidden,
  sendNotFound,
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
    if (req.user.role !== "owner" && req.user.role !== "manager") {
      return sendForbidden(res, "You are not allowed to update users");
    }

    const user = await userService.updateUser(
      req.user.tenantId,
      req.params.userId,
      req.body
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
    if (req.user.role !== "owner") {
      return sendForbidden(res, "Only owner can change user passwords");
    }

    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return sendForbidden(res, "Password must be at least 6 characters");
    }

    const user = await userService.changeUserPassword(
      req.user.tenantId,
      req.params.userId,
      newPassword
    );

    return sendUpdate(res, "Password changed successfully", user);
  } catch (error) {
    if (error.message === "User not found") {
      return sendNotFound(res, error.message);
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
  getUsersByTenant,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  changeUserPassword,
  suspendUser,
  unsuspendUser,
};
