const express = require("express");
const router = express.Router();

const tenantAuth = require("../middleware/tenantAuth");
const authorizeRoles = require("../middleware/authorizeRoles");
const validate = require("../middleware/validate");

const userController = require("../controllers/user.controller");

router.post(
  "/create",
  tenantAuth,
  authorizeRoles("owner", "manager"),
  validate.userCreate,
  userController.createUser
);

router.get(
  "/",
  tenantAuth,
  userController.getUsersByTenant
);

router.get(
  "/:userId",
  tenantAuth,
  validate.objectId("userId"),
  userController.getUserById
);

router.post(
  "/:userId/send-verification-otp",
  tenantAuth,
  authorizeRoles("owner", "manager"),
  validate.objectId("userId"),
  userController.sendVerificationOtp
);

router.post(
  "/:userId/verify-otp",
  tenantAuth,
  authorizeRoles("owner", "manager"),
  validate.userVerifyOtp,
  userController.verifyUserOtp
);

router.patch(
  "/:userId",
  tenantAuth,
  authorizeRoles("owner", "manager"),
  validate.userUpdate,
  userController.updateUser
);

router.patch(
  "/:userId/deactivate",
  tenantAuth,
  authorizeRoles("owner", "manager"),
  validate.objectId("userId"),
  userController.deactivateUser
);

router.patch(
  "/:userId/activate",
  tenantAuth,
  authorizeRoles("owner", "manager"),
  validate.objectId("userId"),
  userController.activateUser
);

router.patch(
  "/:userId/change-password",
  tenantAuth,
  validate.objectId("userId"),
  userController.changeUserPassword
);


router.patch(
  "/:userId/suspend",
  tenantAuth,
  authorizeRoles("owner", "manager"),
  validate.objectId("userId"),
  userController.suspendUser
);

// router.patch(
//   "/:userId/unsuspend",
//   protect,
//   userController.unsuspendUser
// );
module.exports = router;
