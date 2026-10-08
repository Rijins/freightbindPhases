const Hub = require("../models/Hub");
const User = require("../models/User");
const { ROLES } = require("../constants/roles");

// Hub management service. Every exported function is called only from routes
// that are already gated to Admin — this service enforces data rules, never
// role rules (RBAC lives in routes/middleware).

const HUB_SORT_FIELDS = ["createdAt", "updatedAt", "name", "type", "status", "location"];

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const listHubs = async (filters) => {
    const {
        search,
        type,
        status,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc",
    } = filters;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchExpression = new RegExp(escapedSearch, "i");
        query.$or = [{ name: searchExpression }, { location: searchExpression }];
    }

    const sortField = HUB_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const sort = { [sortField]: order === "asc" ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [hubs, totalItems] = await Promise.all([
        Hub.find(query).sort(sort).skip(skip).limit(limit),
        Hub.countDocuments(query),
    ]);

    return {
        hubs,
        pagination: {
            totalItems,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
        },
    };
};

const getHubById = async (hubId) => {
    const hub = await Hub.findById(hubId);
    if (!hub) {
        throw createError("Hub not found", 404);
    }
    return hub;
};

const createHub = async ({ name, location, type, status, capacity }) => {
    const existing = await Hub.findOne({ name });
    if (existing) {
        throw createError("A hub with this name already exists", 409);
    }

    const hub = await Hub.create({
        name,
        location,
        type,
        status: status || "active",
        ...(capacity !== undefined && capacity !== null && { capacity }),
    });

    return hub;
};

const updateHub = async (hubId, updates) => {
    const hub = await getHubById(hubId);

    if (updates.name !== undefined && updates.name !== hub.name) {
        const existing = await Hub.findOne({ name: updates.name, _id: { $ne: hubId } });
        if (existing) {
            throw createError("A hub with this name already exists", 409);
        }
    }

    const editable = {};
    ["name", "location", "type", "status", "capacity"].forEach((field) => {
        if (updates[field] !== undefined) editable[field] = updates[field];
    });

    if (!Object.keys(editable).length) {
        throw createError("No valid hub fields were provided for update", 422);
    }

    hub.set(editable);
    await hub.save();
    return hub;
};

const setHubStatus = async (hubId, status) => {
    const hub = await getHubById(hubId);
    hub.status = status;
    await hub.save();
    return hub;
};

// Active Hub Operators assigned to this hub — the human-readable source for
// "View assigned Hub Operators" in the Admin hub UI.
const listHubOperators = async (hubId) => {
    const hub = await getHubById(hubId);
    const operators = await User.find({ role: ROLES.HUB_OPERATOR, hub: hubId })
        .select("fullName email phone role status profileImage hub createdAt updatedAt")
        .sort({ fullName: 1 });
    return { hub, operators };
};

// The acting user's own hub. Only Hub Operators have an operational hub;
// every other role gets a 404 so the field is never exposed to them.
const getMyHub = async (user) => {
    if (user.role !== ROLES.HUB_OPERATOR || !user.hub) {
        throw createError("No hub is assigned to your account", 404);
    }
    const hub = await Hub.findById(user.hub);
    if (!hub) {
        throw createError("Your assigned hub no longer exists", 404);
    }
    return hub;
};

module.exports = {
    listHubs,
    getHubById,
    createHub,
    updateHub,
    setHubStatus,
    listHubOperators,
    getMyHub,
};
