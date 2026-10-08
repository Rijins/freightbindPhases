import axiosInstance from "../api/axiosInstance";
import { buildQueryString } from "../utils/helpers";

// Shipment-scoped operational chat API (Carrier Dispatcher <-> Hub Operator).
// Access control lives in the backend chatService — every call can 403.

// Chat header data: shipment reference + participants.
const getChatContext = async (shipmentId) => {
  const { data } = await axiosInstance.get(`/chat/shipments/${shipmentId}`);
  return data.data; // { shipment, dispatcher, hubOperators }
};

const listMessages = async (shipmentId, params = {}) => {
  const query = buildQueryString(params);
  const { data } = await axiosInstance.get(`/chat/shipments/${shipmentId}/messages${query}`);
  return data.data; // { messages, pagination }
};

const sendMessage = async (shipmentId, message) => {
  const { data } = await axiosInstance.post(`/chat/shipments/${shipmentId}/messages`, { message });
  return data.data.message;
};

const chatService = { getChatContext, listMessages, sendMessage };

export default chatService;
