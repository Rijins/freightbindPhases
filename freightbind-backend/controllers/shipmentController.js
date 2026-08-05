const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../helpers/apiResponse");
const shipmentService = require("../services/shipmentService");
const timelineService = require("../services/timelineService");

const createShipment = asyncHandler(async (req, res) => {
    const shipment = await shipmentService.createShipment(req.body, req.user);
    await timelineService.createTimelineEvent({
        shipment: shipment._id,
        eventType: "Shipment Created",
        description: `Shipment ${shipment.shipmentId} created`,
        statusAfter: shipment.status,
        performedBy: req.user._id,
    });
    return success(res, {
        statusCode: 201,
        message: "Shipment created successfully",
        data: { shipment },
    });
});

const getShipments = asyncHandler(async (req, res) => {
    const { shipments, pagination } = await shipmentService.getShipments(req.query);
    return success(res, {
        message: "Shipments fetched successfully",
        data: { shipments, pagination },
    });
});

const getShipmentById = asyncHandler(async (req, res) => {
    const shipment = await shipmentService.getShipmentById(req.params.id);
    return success(res, {
        message: "Shipment fetched successfully",
        data: { shipment },
    });
});

const updateShipment = asyncHandler(async (req, res) => {
    const shipment = await shipmentService.updateShipment(req.params.id, req.body, req.user);
    return success(res, {
        message: "Shipment updated successfully",
        data: { shipment },
    });
});

const deleteShipment = asyncHandler(async (req, res) => {
    await shipmentService.deleteShipment(req.params.id);
    return success(res, {
        message: "Shipment deleted successfully",
        data: {},
    });
});

module.exports = { createShipment, getShipments, getShipmentById, updateShipment, deleteShipment };
