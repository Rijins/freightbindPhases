import axiosInstance from "../api/axiosInstance";
import { buildQueryString } from "../utils/helpers";

// System announcements API. Users only ever receive active, in-window
// announcements from the backend; management calls are Admin-gated server-side.
// Never call axios directly from components — go through this service.

const listAnnouncements = async (params = {}) => {
  const query = buildQueryString(params);
  const { data } = await axiosInstance.get(`/announcements${query}`);
  return data.data; // { announcements, pagination }
};

const getAnnouncementById = async (id) => {
  const { data } = await axiosInstance.get(`/announcements/${id}`);
  return data.data.announcement;
};

const createAnnouncement = async (payload) => {
  const { data } = await axiosInstance.post("/announcements", payload);
  return data.data.announcement;
};

const updateAnnouncement = async (id, payload) => {
  const { data } = await axiosInstance.put(`/announcements/${id}`, payload);
  return data.data.announcement;
};

const setAnnouncementStatus = async (id, status) => {
  const { data } = await axiosInstance.patch(`/announcements/${id}/status`, { status });
  return data.data.announcement;
};

const deleteAnnouncement = async (id) => {
  const { data } = await axiosInstance.delete(`/announcements/${id}`);
  return data.data;
};

const announcementService = {
  listAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  setAnnouncementStatus,
  deleteAnnouncement,
};

export default announcementService;
