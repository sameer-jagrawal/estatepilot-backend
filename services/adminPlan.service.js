const PlanModel = require("../models/PlanModel");

const createPlan = async (data) => {
  const existingPlan = await PlanModel.findOne({
    name: data.name,
  });

  if (existingPlan) {
    throw new Error("Plan already exists");
  }

  return await PlanModel.create(data);
};

const getPlans = async (query = {}) => {
  const filter = {};

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  return await PlanModel.find(filter).sort({
    price: 1,
  });
};

const getPlanById = async (planId) => {
  const plan = await PlanModel.findById(planId);

  if (!plan) {
    throw new Error("Plan not found");
  }

  return plan;
};

const updatePlan = async (planId, data) => {
  delete data.name;

  const plan = await PlanModel.findByIdAndUpdate(
    planId,
    data,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!plan) {
    throw new Error("Plan not found");
  }

  return plan;
};

const deletePlan = async (planId) => {
  const plan = await PlanModel.findByIdAndUpdate(
    planId,
    {
      isActive: false,
    },
    {
      new: true,
    }
  );

  if (!plan) {
    throw new Error("Plan not found");
  }

  return plan;
};

module.exports = {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
};