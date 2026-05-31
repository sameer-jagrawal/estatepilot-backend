const protect = require("./auth");
const tenantAccess = require("./tenantAccess");

const tenantAuth = [protect, tenantAccess];

module.exports = tenantAuth;
