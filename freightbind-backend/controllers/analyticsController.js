const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../helpers/apiResponse");
const analyticsService = require("../services/analyticsService");

const getDashboardAnalytics = asyncHandler(async (req, res) => {
    const data = await analyticsService.getDashboardAnalytics(req.user);
    return success(res, {
        message: "Dashboard analytics fetched successfully",
        data,
    });
});

module.exports = { getDashboardAnalytics };