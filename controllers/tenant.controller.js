const tenantService = require("../services/tenant.service");

const {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendConflict,
  sendServerError,
} = require("../utils/response");

// register tenant/company
const registerCompany = async (req, res) => {
  try {
    const {
      companyName,
      ownerName,
      ownerEmail,
      ownerPhone,
      password,
    } = req.body;

    if (
      !companyName ||
      !ownerName ||
      !ownerEmail ||
      !ownerPhone ||
      !password
    ) {
      return sendBadRequest(res, "All fields are required");
    }

    if (password.length < 6) {
      return sendBadRequest(
        res,
        "Password must be at least 6 characters"
      );
    }

    const result = await tenantService.register(req.body);

    return sendSuccess(
      res,
      "OTP sent successfully. Please verify your email.",
      result
    );
  } catch (error) {
    if (
      error.message === "Company already exists" ||
      error.message === "Owner already exists"
    ) {
      return sendConflict(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

// verify company otp
const verifyCompanyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendBadRequest(res, "Email and OTP are required");
    }

    if (otp.length !== 6) {
      return sendBadRequest(res, "OTP must be 6 digits");
    }

    const result = await tenantService.verifyOtp(req.body);

    return sendCreated(
      res,
      "Company registered successfully",
      result
    );
  } catch (error) {
    if (
      error.message === "Registration request not found or expired" ||
      error.message === "OTP expired. Please register again." ||
      error.message === "Too many attempts. Please register again." ||
      error.message === "Invalid OTP"
    ) {
      return sendBadRequest(res, error.message);
    }

    if (
      error.message === "Company already exists" ||
      error.message === "Owner already exists"
    ) {
      return sendConflict(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

const getTenantProfile = async (req, res) => {
  try {
    const tenant = await tenantService.getTenantProfile(
      req.user.tenantId
    );

    return sendSuccess(
      res,
      "Company profile fetched successfully",
      tenant
    );
  } catch (error) {
    return sendServerError(res, error.message);
  }
};

const updateTenantProfile = async (req, res) => {
  try {
    const tenant = await tenantService.updateTenantProfile(
      req.user.tenantId,
      req.body
    );

    return sendSuccess(
      res,
      "Company profile updated successfully",
      tenant
    );
  } catch (error) {
    if (error.message === "Company already exists") {
      return sendConflict(res, error.message);
    }

    return sendServerError(res, error.message);
  }
};

module.exports = {
  registerCompany,
  verifyCompanyOtp,
  getTenantProfile,
  updateTenantProfile,
};
