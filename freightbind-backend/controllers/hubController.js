const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../helpers/apiResponse");
const hubService = require("../services/hubService");

const listHubs = asyncHandler(async (req, res) => {
    const { hubs, pagination } = await hubService.listHubs(req.query);
    return success(res, {
        message: "Hubs fetched successfully",
        data: { hubs, pagination },
    });
});

const getHubById = asyncHandler(async (req, res) => {
    const hub = await hubService.getHubById(req.params.id);
    return success(res, {
        message: "Hub fetched successfully",
        data: { hub },
    });
});

const createHub = asyncHandler(async (req, res) => {
    const hub = await hubService.createHub(req.body);
    return success(res, {
        statusCode: 201,
        message: "Hub created successfully",
        data: { hub },
    });
});

const updateHub = asyncHandler(async (req, res) => {
    const hub = await hubService.updateHub(req.params.id, req.body);
    return success(res, {
        message: "Hub updated successfully",
        data: { hub },
    });
});

const setHubStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const hub = await hubService.setHubStatus(req.params.id, status);
    return success(res, {
        message: `Hub ${status === "active" ? "activated" : "deactivated"} successfully`,
        data: { hub },
    });
});

const listHubOperators = asyncHandler(async (req, res) => {
    const { hub, operators } = await hubService.listHubOperators(req.params.id);
    return success(res, {
        message: "Hub operators fetched successfully",
        data: { hub, operators },
    });
});

const getMyHub = asyncHandler(async (req, res) => {
    const hub = await hubService.getMyHub(req.user);
    return success(res, {
        message: "Your hub fetched successfully",
        data: { hub },
    });
});

module.exports = {
    listHubs,
    getHubById,
    createHub,
    updateHub,
    setHubStatus,
    listHubOperators,
    getMyHub,
};
