const bcrypt = require("bcryptjs");

const TenantModel = require("../models/TenantModel");
const UserModel = require("../models/UserModel");
const RegistrationOtpModel = require("../models/RegistrationModel");
const sendOtpMail = require("../utils/sendOtpMail");
const activityLogService = require("./activityLog.service");

const safeCreateActivityLog = async (logData) => {
  try {
    await activityLogService.createActivityLog(logData);
  } catch (error) {
    console.log("Activity log failed:", error.message);
  }
};

const generateSlug = (value = "") => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const generateOtp = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};

// register tenant
const register = async (data) => {
  const {
    companyName,
    ownerName,
    ownerEmail,
    ownerPhone,
    password,
  } = data;
  const slug = generateSlug(companyName);

  const existingTenant =
    await TenantModel.findOne({
      $or: [
        { slug },
        { ownerEmail },
        { ownerPhone },
      ],
    });

  if (existingTenant) {
    throw new Error(
      "Company already exists"
    );
  }

  const existingUser =
    await UserModel.findOne({
      $or: [
        { email: ownerEmail },
        { phone: ownerPhone },
      ],
    });

  if (existingUser) {
    throw new Error(
      "Owner already exists"
    );
  }

  // hash password here
  const hashedPassword =
    await bcrypt.hash(password, 10);

  const otp = generateOtp();

  // remove previous otp
  await RegistrationOtpModel
    .findOneAndDelete({
      ownerEmail,
    });

  await RegistrationOtpModel.create({
    companyName,
    slug,
    ownerName,
    ownerEmail,
    ownerPhone,
    password: hashedPassword,
    otp,
    expiresAt: new Date(
      Date.now() + 10 * 60 * 1000
    ),
  });

  await sendOtpMail(
    ownerEmail,
    otp
  );

  return {
    email: ownerEmail,
  };
};


// verify otp
const verifyOtp = async (data) => {
  const { email, otp } = data;

  const pendingRegistration =
    await RegistrationOtpModel.findOne({
      ownerEmail: email,
    });

  if (!pendingRegistration) {
    throw new Error(
      "Registration request not found or expired"
    );
  }

  if (pendingRegistration.expiresAt < new Date()) {
    await RegistrationOtpModel.findByIdAndDelete(
      pendingRegistration._id
    );

    throw new Error(
      "OTP expired. Please register again."
    );
  }

  if (pendingRegistration.attempts >= 5) {
    await RegistrationOtpModel.findByIdAndDelete(
      pendingRegistration._id
    );

    throw new Error(
      "Too many attempts. Please register again."
    );
  }

  if (pendingRegistration.otp !== otp) {
    pendingRegistration.attempts += 1;
    await pendingRegistration.save();

    throw new Error("Invalid OTP");
  }

  const tenant = await TenantModel.create({
    name: pendingRegistration.companyName,
    slug: pendingRegistration.slug,
    ownerName: pendingRegistration.ownerName,
    ownerEmail: pendingRegistration.ownerEmail,
    ownerPhone: pendingRegistration.ownerPhone,
    trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  });

  const user = await UserModel.create({
    tenantId: tenant._id,
    name: pendingRegistration.ownerName,
    email: pendingRegistration.ownerEmail,
    phone: pendingRegistration.ownerPhone,
    password: pendingRegistration.password,
    role: "owner",
    isVerified: true,
  });

  await RegistrationOtpModel.findByIdAndDelete(
    pendingRegistration._id
  );

  await safeCreateActivityLog({
    tenantId: tenant._id,
    userId: user._id,
    module: "tenant",
    action: "tenant_created",
    description: `Tenant created: ${tenant.name}`,
    entityType: "tenant",
    entityId: tenant._id,
    metadata: {
      companyName: tenant.name,
      slug: tenant.slug,
      ownerName: tenant.ownerName,
      ownerEmail: tenant.ownerEmail,
      plan: tenant.plan,
      status: tenant.status,
    },
  });

  return {
    tenant,
    user,
  };
};

const getTenantProfile = async (tenantId) => {
  const tenant = await TenantModel.findById(tenantId);

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  return tenant;
};

const updateTenantProfile = async (tenantId, data) => {
  const allowedFields = [
    "name",
    "businessType",
    "city",
    "address",
    "logo",
    "settings",
  ];

  const payload = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      payload[field] = data[field];
    }
  });

  if (data.companyName !== undefined) {
    payload.name = data.companyName;
    payload.slug = generateSlug(data.companyName);
  }

  if (payload.slug) {
    const existingTenant = await TenantModel.findOne({
      _id: { $ne: tenantId },
      slug: payload.slug,
    });

    if (existingTenant) {
      throw new Error("Company already exists");
    }
  }

  const tenant = await TenantModel.findByIdAndUpdate(
    tenantId,
    payload,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  return tenant;
};




module.exports = {
  register,
  verifyOtp,
  getTenantProfile,
  updateTenantProfile,
};
