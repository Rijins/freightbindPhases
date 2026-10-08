import axiosInstance from "../api/axiosInstance";
import { buildQueryString } from "../utils/helpers";

// Admin-only user management API. Never call axios directly from components
// — go through this service.

const listUsers = async (params = {}) => {
  const query = buildQueryString(params);
  const { data } = await axiosInstance.get(`/users${query}`);
  return data.data; // { users, pagination }
};

const getUser = async (id) => {
  const { data } = await axiosInstance.get(`/users/${id}`);
  return data.data.user;
};

const createUser = async (payload) => {
  const { data } = await axiosInstance.post("/users", payload);
  return data.data.user;
};

const updateUser = async (id, payload) => {
  const { data } = await axiosInstance.put(`/users/${id}`, payload);
  return data.data.user;
};

const setUserStatus = async (id, status) => {
  const { data } = await axiosInstance.patch(`/users/${id}/status`, { status });
  return data.data.user;
};

// Active Carrier Dispatcher candidates for the shipment assignment selector.
// Backend hard-filters role + status; only search/page/limit are accepted.
const listDispatcherCandidates = async (params = {}) => {
  const query = buildQueryString(params);
  const { data } = await axiosInstance.get(`/users/dispatchers${query}`);
  return data.data; // { users, pagination }
};

// Active Hub Operator candidates for hub assignment selectors. Backend
// hard-filters role + status; only search/page/limit are accepted.
const listHubOperatorCandidates = async (params = {}) => {
  const query = buildQueryString(params);
  const { data } = await axiosInstance.get(`/users/hub-operators${query}`);
  return data.data; // { users, pagination }
};

const userService = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  setUserStatus,
  listDispatcherCandidates,
  listHubOperatorCandidates,
};

export default userService;
