const mongoose = require("mongoose");
const LeadModel = require("../models/LeadModel");
const PropertyModel = require("../models/PropertyModel");
const FollowUpModel = require("../models/FollowUpModel");
const DealModel = require("../models/DealModel");
const ActivityModel = require("../models/ActivityModel");
const UserModel = require("../models/UserModel");

const toObjectId = (id) => {
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }

  return new mongoose.Types.ObjectId(id);
};

const getDashboardStats = async (tenantId) => {
  const tenantObjectId = toObjectId(tenantId);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    totalLeads,
    totalUsers,
    totalProperties,
    availableProperties,
    todayFollowUps,
    overdueFollowUps,
    totalDeals,
    closedDeals,
    revenueData,
    recentActivities,
  ] = await Promise.all([
    LeadModel.countDocuments({
      tenantId,
      isActive: true,
    }),

    UserModel.countDocuments({
      tenantId,
      isActive: true,
    }),

    PropertyModel.countDocuments({
      tenantId,
      isActive: true,
    }),

    PropertyModel.countDocuments({
      tenantId,
      isActive: true,
      status: "available",
    }),

    FollowUpModel.countDocuments({
      tenantId,
      status: "pending",
      dueAt: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    }),

    FollowUpModel.countDocuments({
      tenantId,
      status: "pending",
      dueAt: {
        $lt: new Date(),
      },
    }),

    DealModel.countDocuments({
      tenantId,
      isActive: true,
    }),

    DealModel.countDocuments({
      tenantId,
      isActive: true,
      dealStatus: "closed",
    }),

    DealModel.aggregate([
      {
        $match: {
          tenantId: tenantObjectId,
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

    ActivityModel.find({
      tenantId,
    })
      .populate("leadId", "name phone status")
      .populate("userId", "name role")
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  return {
    totalLeads,
    totalUsers,
    totalProperties,
    availableProperties,
    todayFollowUps,
    overdueFollowUps,
    totalDeals,
    closedDeals,
    totalRevenue: revenueData[0]?.totalRevenue || 0,
    totalCommission: revenueData[0]?.totalCommission || 0,
    recentActivities,
  };
};

const getLeadStats = async (tenantId) => {
  const tenantObjectId = toObjectId(tenantId);
  const leadStatusStats = await LeadModel.aggregate([
    {
      $match: {
        tenantId: tenantObjectId,
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  return leadStatusStats;
};

const getDealStats = async (tenantId) => {
  const tenantObjectId = toObjectId(tenantId);
  const dealStats = await DealModel.aggregate([
    {
      $match: {
        tenantId: tenantObjectId,
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$dealStatus",
        count: {
          $sum: 1,
        },
        totalAmount: {
          $sum: "$dealAmount",
        },
      },
    },
  ]);

  return dealStats;
};

module.exports = {
  getDashboardStats,
  getLeadStats,
  getDealStats,
};
