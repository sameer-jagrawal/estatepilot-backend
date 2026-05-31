const TenantModel = require("../models/TenantModel");
const UserModel = require("../models/UserModel");
const LeadModel = require("../models/LeadModel");
const PropertyModel = require("../models/PropertyModel");
const DealModel = require("../models/DealModel");

const getAdminDashboardStats = async () => {
  const [
    totalTenants,
    activeTenants,
    trialTenants,
    suspendedTenants,
    totalUsers,
    totalLeads,
    totalProperties,
    totalDeals,
    revenueData,
    recentTenants,
  ] = await Promise.all([
    TenantModel.countDocuments(),

    TenantModel.countDocuments({
      status: "active",
    }),

    TenantModel.countDocuments({
      status: "trial",
    }),

    TenantModel.countDocuments({
      status: "suspended",
    }),

    UserModel.countDocuments(),

    LeadModel.countDocuments({
      isActive: true,
    }),

    PropertyModel.countDocuments({
      isActive: true,
    }),

    DealModel.countDocuments({
      isActive: true,
    }),

    DealModel.aggregate([
      {
        $match: {
          isActive: true,
          dealStatus: "closed",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$dealAmount",
          },
          totalCommission: {
            $sum: "$commissionAmount",
          },
        },
      },
    ]),

    TenantModel.find()
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  return {
    totalTenants,
    activeTenants,
    trialTenants,
    suspendedTenants,
    totalUsers,
    totalLeads,
    totalProperties,
    totalDeals,
    totalRevenue: revenueData[0]?.totalRevenue || 0,
    totalCommission: revenueData[0]?.totalCommission || 0,
    recentTenants,
  };
};

module.exports = {
  getAdminDashboardStats,
};