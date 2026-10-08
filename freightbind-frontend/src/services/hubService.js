import axiosInstance from "../api/axiosInstance";
import { buildQueryString } from "../utils/helpers";

// Admin-only hub management API. Never call axios directly from components
// — go through this service.

const listHubs = async (params = {}) => {
  const query = buildQueryString(params);
  const { data } = await axiosInstance.get(`/hubs${query}`);
  return data.data; // { hubs, pagination }
};

const getHub = async (id) => {
  const { data } = await axiosInstance.get(`/hubs/${id}`);
  return data.data.hub;
};

const createHub = async (payload) => {
  const { data } = await axiosInstance.post("/hubs", payload);
  return data.data.hub;
};

const updateHub = async (id, payload) => {
  const { data } = await axiosInstance.put(`/hubs/${id}`, payload);
  return data.data.hub;
};

const setHubStatus = async (id, status) => {
  const { data } = await axiosInstance.patch(`/hubs/${id}/status`, { status });
  return data.data.hub;
};

// Hub Operators assigned to a hub (Admin hub detail view).
const listHubOperators = async (id) => {
  const { data } = await axiosInstance.get(`/hubs/${id}/operators`);
  return data.data; // { hub, operators }
};

// The acting user's own hub (Hub Operators only; 404 for other roles).
const getMyHub = async () => {
  const { data } = await axiosInstance.get("/hubs/my");
  return data.data.hub;
};

const hubService = {
  listHubs,
  getHub,
  createHub,
  updateHub,
  setHubStatus,
  listHubOperators,
  getMyHub,
};

export default hubService;
