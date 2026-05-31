const bcrypt = require("bcryptjs");
const SuperAdminModel = require("../models/SuperAdminModel");
const {generateAdminToken} = require("../utils/jwt");

const createSuperAdmin = async (data) => {
  const existingAdmin = await SuperAdminModel.findOne({
    email: data.email,
  });

  if (existingAdmin) {
    throw new Error("Super admin already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await SuperAdminModel.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });
};

const loginSuperAdmin = async (data) => {
  const admin = await SuperAdminModel.findOne({
    email: data.email,
  }).select("+password");

  if (!admin) {
    throw new Error("Invalid email or password");
  }

  if (!admin.isActive) {
    throw new Error("Super admin account is inactive");
  }

  const isPasswordMatch = await bcrypt.compare(
    data.password,
    admin.password
  );

  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = generateAdminToken(admin);

  admin.password = undefined;

  return {
    token,
    admin,
  };
};

module.exports = {
  createSuperAdmin,
  loginSuperAdmin,
};