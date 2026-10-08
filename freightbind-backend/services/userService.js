const User = require("../models/User");
const Hub = require("../models/Hub");
const { ROLES } = require("../constants/roles");

// Admin-only user management. Safe fields only — password and auth internals
// are never selected, returned or updated through this service.

const USER_SAFE_FIELDS = "fullName email phone role status profileImage hub createdAt updatedAt";

const USER_EDITABLE_FIELDS = ["fullName", "email", "phone", "role", "status", "hub"];
const USER_SORT_FIELDS = ["createdAt", "updatedAt", "fullName", "email", "role", "status"];

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const listUsers = async (filters) => {
    const {
        search,
        role,
        status,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc",
    } = filters;

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchExpression = new RegExp(escapedSearch, "i");
        query.$or = [
            { fullName: searchExpression },
            { email: searchExpression },
        ];
    }

    const sortField = USER_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const sort = { [sortField]: order === "asc" ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [users, totalItems] = await Promise.all([
        User.find(query).select(USER_SAFE_FIELDS).sort(sort).skip(skip).limit(limit),
        User.countDocuments(query),
    ]);

    return {
        users,
        pagination: {
            totalItems,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
        },
    };
};

const getUserById = async (userId) => {
    const user = await User.findById(userId).select(USER_SAFE_FIELDS);
    if (!user) {
        throw createError("User not found", 404);
    }
    return user;
};

// ------------------------------------------------------------------
// Hub assignment rules (Phase 9 Part 8)
// ------------------------------------------------------------------
// A hub may only be assigned to Hub Operators, and only while the hub is
// active. The user itself must be active to become an operational Hub
// Operator (guaranteed by createUser defaulting to "active"; updateUser
// refuses to assign a hub to an inactive/suspended account).
const validateHubForAssignment = async (hub, role, userStatus = "active") => {
    if (hub === undefined || hub === null || hub === "") return;

    if (role !== ROLES.HUB_OPERATOR) {
        throw createError("Only Hub Operators can be assigned to a hub", 422);
    }
    if (userStatus !== "active") {
        throw createError("Inactive users cannot be assigned as operational Hub Operators", 422);
    }

    const hubDoc = await Hub.findById(hub);
    if (!hubDoc) {
        throw createError("Hub not found", 404);
    }
    if (hubDoc.status !== "active") {
        throw createError("Cannot assign users to an inactive hub", 422);
    }
};

const createUser = async ({ fullName, email, password, phone, role, hub }) => {
    const existing = await User.findOne({ email });
    if (existing) {
        throw createError("Email already registered", 409);
    }

    await validateHubForAssignment(hub, role);

    const user = await User.create({
        fullName,
        email,
        password,
        phone: phone || null,
        role,
        status: "active",
        hub: hub || null,
    });

    return user;
};

const assertNotSelfPrivilegeChange = (userId, actor, updates) => {
    const isSelf = String(userId) === String(actor._id);
    if (!isSelf) return;

    if (updates.role !== undefined && updates.role !== actor.role) {
        throw createError("You cannot change your own role", 422);
    }
    if (updates.status !== undefined && updates.status !== "active") {
        throw createError("You cannot deactivate your own account", 422);
    }
};

const updateUser = async (userId, updates, actor) => {
    const payload = {};
    USER_EDITABLE_FIELDS.forEach((field) => {
        if (updates[field] !== undefined) payload[field] = updates[field];
    });

    if (!Object.keys(payload).length) {
        throw createError("No valid user fields were provided for update", 422);
    }

    assertNotSelfPrivilegeChange(userId, actor, payload);

    if (payload.email !== undefined) {
        const existing = await User.findOne({ email: payload.email, _id: { $ne: userId } });
        if (existing) {
            throw createError("Email already registered", 409);
        }
    }

    const currentUser = await User.findById(userId).select("role status hub");
    if (!currentUser) {
        throw createError("User not found", 404);
    }

    // Hub rules: only Hub Operators may carry a hub; changing a role away
    // from Hub Operator clears any existing hub so stale assignments can
    // never survive a role change.
    const finalRole = payload.role !== undefined ? payload.role : currentUser.role;
    if (finalRole !== ROLES.HUB_OPERATOR) {
        if (payload.hub !== undefined) {
            throw createError("Only Hub Operators can be assigned to a hub", 422);
        }
        if (payload.role !== undefined) {
            payload.hub = null;
        }
    } else {
        const finalStatus = payload.status !== undefined ? payload.status : currentUser.status;
        await validateHubForAssignment(payload.hub, finalRole, finalStatus);
    }

    const user = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });
    if (!user) {
        throw createError("User not found", 404);
    }
    return user;
};

const setUserStatus = async (userId, status, actor) => {
    assertNotSelfPrivilegeChange(userId, actor, { status });

    const user = await User.findByIdAndUpdate(
        userId,
        { status },
        { new: true, runValidators: true }
    );
    if (!user) {
        throw createError("User not found", 404);
    }
    return user;
};

// Returns active Carrier Dispatchers — the selector source for shipment
// assignment. Role and status are enforced here, never by the client, so
// non-dispatcher or inactive users can never be returned. Supports the same
// search/pagination shape as listUsers.
const listActiveDispatchers = async ({ search, page = 1, limit = 50 } = {}) => {
    const query = { role: ROLES.CARRIER_DISPATCHER, status: "active" };

    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchExpression = new RegExp(escapedSearch, "i");
        query.$or = [
            { fullName: searchExpression },
            { email: searchExpression },
        ];
    }

    const skip = (page - 1) * limit;

    const [users, totalItems] = await Promise.all([
        User.find(query).select(USER_SAFE_FIELDS).sort({ fullName: 1 }).skip(skip).limit(limit),
        User.countDocuments(query),
    ]);

    return {
        users,
        pagination: {
            totalItems,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
        },
    };
};

// Active Hub Operator candidates for hub assignment selectors. Same
// guarantees as listActiveDispatchers: role + status are enforced here, never
// by the client, so non-operators or inactive users are never returned.
const listActiveHubOperators = async ({ search, page = 1, limit = 50 } = {}) => {
    const query = { role: ROLES.HUB_OPERATOR, status: "active" };

    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchExpression = new RegExp(escapedSearch, "i");
        query.$or = [
            { fullName: searchExpression },
            { email: searchExpression },
        ];
    }

    const skip = (page - 1) * limit;

    const [users, totalItems] = await Promise.all([
        User.find(query).select(USER_SAFE_FIELDS).sort({ fullName: 1 }).skip(skip).limit(limit),
        User.countDocuments(query),
    ]);

    return {
        users,
        pagination: {
            totalItems,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
        },
    };
};

module.exports = {
    listUsers,
    getUserById,
    createUser,
    updateUser,
    setUserStatus,
    listActiveDispatchers,
    listActiveHubOperators,
};
