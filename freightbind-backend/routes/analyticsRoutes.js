const express = require("express");
const router = express.Router();

const analyticsController = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");

// Dashboard analytics are available to every Command Center role (the
// service scopes each result to the caller — fleets/trends for dispatchers
// are their assigned shipments only; hub network analytics are never
// returned to Hub Operators or Dispatchers).
router.get(
    "/dashboard",
    protect,
    authorize(ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR, ROLES.CARRIER_DISPATCHER, ROLES.HUB_OPERATOR),
    analyticsController.getDashboardAnalytics
);

module.exports = router;