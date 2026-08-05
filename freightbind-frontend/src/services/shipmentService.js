import axiosInstance from "../api/axiosInstance";
import { buildQueryString } from "../utils/helpers";

// Reusable functions wrapping the existing backend shipment endpoints.
// Never call axios directly from components — go through this service.

const getShipments = async (params = {}) => {
  const query = buildQueryString(params);
  const { data } = await axiosInstance.get(`/v1/shipments${query}`);
  return data.data; // { shipments, pagination }
};

const getShipment = async (id) => {
  const { data } = await axiosInstance.get(`/v1/shipments/${id}`);
  return data.data.shipment;
};

const createShipment = async (payload) => {
  const { data } = await axiosInstance.post("/v1/shipments", payload);
  return data.data.shipment;
};

const updateShipment = async (id, payload) => {
  const { data } = await axiosInstance.put(`/v1/shipments/${id}`, payload);
  return data.data.shipment;
};

const deleteShipment = async (id) => {
  const { data } = await axiosInstance.delete(`/v1/shipments/${id}`);
  return data.data;
};

const shipmentService = {
  getShipments,
  getShipment,
  createShipment,
  updateShipment,
  deleteShipment,
};

export default shipmentService;
