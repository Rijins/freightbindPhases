// Socket service — the ONLY entry point the rest of the backend uses for
// realtime communication. No controller, service, or route may import
// Socket.IO directly; everything goes through here so event names, room
// names, and RBAC-safe targeting stay consistent.
//
// All emit/join/leave operations are no-ops (with a one-time warning) when
// Socket.IO has not been initialized, e.g. before server.js attaches it —
// they never throw and never crash the server.

const { ROLES, ROLES_LIST } = require("../constants/roles");
const {
    GLOBAL_ADMIN_ROOM,
    buildUserRoom,
    buildRoleRoom,
    buildShipmentRoom,
} = require("../helpers/socketRooms");
const { isInitialized, getSocketServer } = require("../sockets");
const { getUserSocketIds } = require("../sockets/connection");

let notInitializedWarned = false;

const requireSocketServer = () => {
    if (isInitialized()) return getSocketServer();
    if (!notInitializedWarned) {
        console.warn("[socket] Socket.IO is not initialized — realtime calls are no-ops");
        notInitializedWarned = true;
    }
    return null;
};

const normalizePayload = (payload) => (payload === undefined ? {} : payload);

const emitToUser = (userId, eventName, payload) => {
    const io = requireSocketServer();
    if (!io) return false;
    io.to(buildUserRoom(userId)).emit(eventName, normalizePayload(payload));
    return true;
};

const emitToUsers = (userIds, eventName, payload) => {
    if (!Array.isArray(userIds) || userIds.length === 0) return false;
    const io = requireSocketServer();
    if (!io) return false;
    io.to(userIds.map(buildUserRoom)).emit(eventName, normalizePayload(payload));
    return true;
};

const emitToRole = (role, eventName, payload) => {
    if (!ROLES_LIST.includes(role)) {
        console.warn(`[socket] emitToRole skipped for unknown role: ${role}`);
        return false;
    }
    const io = requireSocketServer();
    if (!io) return false;
    io.to(buildRoleRoom(role)).emit(eventName, normalizePayload(payload));
    return true;
};

const emitToRoles = (roles, eventName, payload) => {
    if (!Array.isArray(roles) || roles.length === 0) return false;
    const validRoles = roles.filter((role) => ROLES_LIST.includes(role));
    if (validRoles.length === 0) return false;
    const io = requireSocketServer();
    if (!io) return false;
    io.to(validRoles.map(buildRoleRoom)).emit(eventName, normalizePayload(payload));
    return true;
};

const emitToShipment = (shipmentId, eventName, payload) => {
    const io = requireSocketServer();
    if (!io) return false;
    io.to(buildShipmentRoom(shipmentId)).emit(eventName, normalizePayload(payload));
    return true;
};

const broadcast = (eventName, payload) => {
    const io = requireSocketServer();
    if (!io) return false;
    io.emit(eventName, normalizePayload(payload));
    return true;
};

const forEachSocketOfUser = (io, userId, callback) => {
    const socketIds = getUserSocketIds(userId);
    if (!socketIds) return 0;

    let visited = 0;
    for (const socketId of socketIds) {
        const socket = io.sockets.sockets.get(socketId);
        if (!socket) continue;
        callback(socket);
        visited += 1;
    }
    return visited;
};

const joinRoom = (userId, room) => {
    const io = requireSocketServer();
    if (!io) return false;
    return forEachSocketOfUser(io, userId, (socket) => socket.join(room)) > 0;
};

const leaveRoom = (userId, room) => {
    const io = requireSocketServer();
    if (!io) return false;
    return forEachSocketOfUser(io, userId, (socket) => socket.leave(room)) > 0;
};

const joinRooms = (userId, rooms) => {
    if (!Array.isArray(rooms) || rooms.length === 0) return false;
    const io = requireSocketServer();
    if (!io) return false;
    return forEachSocketOfUser(io, userId, (socket) => rooms.forEach((room) => socket.join(room))) > 0;
};

const isBaseRoom = (socket, room) => {
    if (room === socket.id) return true;
    if (room === buildUserRoom(socket.user.id)) return true;
    if (room === buildRoleRoom(socket.user.role)) return true;
    if (socket.user.role === ROLES.ADMIN && room === GLOBAL_ADMIN_ROOM) return true;
    return false;
};

// Leaves every room a user joined EXCEPT the server-managed base rooms
// (user, role, global admin) — those are re-joined automatically on the
// next connection and are not user-controlled.
const leaveAllRooms = (userId) => {
    const io = requireSocketServer();
    if (!io) return false;
    return (
        forEachSocketOfUser(io, userId, (socket) => {
            for (const room of socket.rooms) {
                if (!isBaseRoom(socket, room)) socket.leave(room);
            }
        }) > 0
    );
};

const isUserOnline = (userId) => getUserSocketIds(userId) !== undefined;

module.exports = {
    emitToUser,
    emitToUsers,
    emitToRole,
    emitToRoles,
    emitToShipment,
    broadcast,
    joinRoom,
    leaveRoom,
    joinRooms,
    leaveAllRooms,
    isUserOnline,
};
