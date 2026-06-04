const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routers/auth.router");
const leadRoutes = require("./routers/lead.router");
const followUpRoutes = require("./routers/followup.router");
const propertyRoutes = require("./routers/property.router");
const activityRoutes = require("./routers/activity.router");
const whatsappMessageRoutes = require("./routers/whatsappMessage.router");
const whatsAppAccountRoutes = require("./routers/whatsappAccount.router");
const whatsappTemplateRoutes = require("./routers/whatsappTemplate.router");
const siteVisitRoutes = require("./routers/siteVisit.router");
const dealRoutes = require("./routers/deal.router");
const noteRoutes = require("./routers/note.router");
const dashboardRoutes = require("./routers/dashboard.router");
const whatsappSendRoutes = require("./routers/whatsappSend.router");
const whatsappWebhookRoutes =
  require(
    "./routers/whatsappWebhook.router"
  );
  const superAdminRoutes = require("./routers/superAdmin.router");
  const adminDashboardRoutes = require("./routers/adminDashboard.router");
  const adminTenantRoutes = require("./routers/adminTenant.router");
  const adminPlanRoutes = require("./routers/adminPlan.router");
  const activityLogRoutes = require("./routers/activityLog.router");



  const sanitize = (req, res, next) => {
    if (req.body) {
      mongoSanitize.sanitize(req.body, {
        replaceWith: "_",
        allowDots: true,
      });
    }
  
    if (req.params) {
      mongoSanitize.sanitize(req.params, {
        replaceWith: "_",
        allowDots: true,
      });
    }
  
    // Do NOT sanitize req.query directly
    next();
  };
// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(sanitize);
app.use("/api/tenant",require("../server/routers/tenant.router"))
app.use("/api/auth", authRoutes);
const userRoutes = require("../server/routers/user.router");
app.use("/api/user", userRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/followups", followUpRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/whatsapp-messages", whatsappMessageRoutes);
app.use("/api/whatsapp-account", whatsAppAccountRoutes);
app.use("/api/whatsapp-templates", whatsappTemplateRoutes);
app.use("/api/site-visits", siteVisitRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/whatsapp", whatsappSendRoutes);
app.use("/api/webhooks",whatsappWebhookRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/tenants", adminTenantRoutes);
app.use("/api/admin/plans", adminPlanRoutes);
app.use("/api/activity-logs", activityLogRoutes);

app.use(errorHandler);


// Database connection
mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => {
    console.log("Database connected");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.log("Database not connected");
    console.log(error);
  });
