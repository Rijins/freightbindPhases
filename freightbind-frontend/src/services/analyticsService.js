import axiosInstance from "../api/axiosInstance";

// Real dashboard analytics API (role-scoped by the backend).
// Never call axios directly from components — go through this service.

const getDashboardAnalytics = async () => {
  const { data } = await axiosInstance.get("/analytics/dashboard");
  return data.data; // { fleet, hubs, volumeTrend, system }
};

const analyticsService = {
  getDashboardAnalytics,
};

export default analyticsService;