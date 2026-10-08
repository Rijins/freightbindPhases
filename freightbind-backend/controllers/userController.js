const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../helpers/apiResponse");
const userService = require("../services/userService");

const listUsers = asyncHandler(async (req, res) => {
    const { users, pagination } = await userService.listUsers(req.query);
    return success(res, {
        message: "Users fetched successfully",
        data: { users, pagination },
    });
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    return success(res, {
        message: "User fetched successfully",
        data: { user },
    });
});

const createUser = asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);
    return success(res, {
        statusCode: 201,
        message: "User created successfully",
        data: { user },
    });
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body, req.user);
    return success(res, {
        message: "User updated successfully",
        data: { user },
    });
});

const updateUserStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const user = await userService.setUserStatus(req.params.id, status, req.user);
    return success(res, {
        message: `User ${status === "active" ? "activated" : "deactivated"} successfully`,
        data: { user },
    });
});

const listDispatchers = asyncHandler(async (req, res) => {
    const { users, pagination } = await userService.listActiveDispatchers(req.query);
    return success(res, {
        message: "Dispatchers fetched successfully",
        data: { users, pagination },
    });
});

const listHubOperators = asyncHandler(async (req, res) => {
    const { users, pagination } = await userService.listActiveHubOperators(req.query);
    return success(res, {
        message: "Hub operators fetched successfully",
        data: { users, pagination },
    });
});

module.exports = {
    listUsers,
    getUserById,
    createUser,
    updateUser,
    updateUserStatus,
    listDispatchers,
    listHubOperators,
};
