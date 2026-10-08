const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../helpers/apiResponse");
const timelineService = require("../services/timelineService");

const getTimeline = asyncHandler(async (req, res) => {
  const timeline = await timelineService.getTimeline(req.params.shipmentId, req.user);
  return success(res, {
    message: "Timeline fetched successfully",
    data: { timeline },
  });
});

const getLatestTimelineEvent = asyncHandler(async (req, res) => {
  const event = await timelineService.getLatestTimelineEvent(req.params.shipmentId, req.user);
  return success(res, {
    message: "Latest timeline event fetched successfully",
    data: { event },
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { shipmentId, status, note } = req.body;
  const { shipment, event } = await timelineService.updateShipmentStatus(shipmentId, status, req.user, note);
  return success(res, {
    message: "Shipment status updated successfully",
    data: { shipment, event },
  });
});

const updateLocation = asyncHandler(async (req, res) => {
  const { shipmentId, location } = req.body;
  const { shipment, event } = await timelineService.updateShipmentLocation(shipmentId, location, req.user);
  return success(res, {
    message: "Shipment location updated successfully",
    data: { shipment, event },
  });
});

const assignDispatcher = asyncHandler(async (req, res) => {
  const { shipmentId, dispatcherId } = req.body;
  const { shipment, event } = await timelineService.assignDispatcher(shipmentId, dispatcherId, req.user);
  return success(res, {
    message: "Dispatcher assigned successfully",
    data: { shipment, event },
  });
});

const addNote = asyncHandler(async (req, res) => {
  const { shipmentId, note } = req.body;
  const { event } = await timelineService.addNote(shipmentId, note, req.user);
  return success(res, {
    statusCode: 201,
    message: "Note added successfully",
    data: { event },
  });
});

module.exports = {
  getTimeline,
  getLatestTimelineEvent,
  updateStatus,
  updateLocation,
  assignDispatcher,
  addNote,
};
