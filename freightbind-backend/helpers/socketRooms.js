// Room name builders for Socket.IO. Pure helpers — no database, no Express.
//
// Supported room types:
//   user:<userId>          - private room for one user (all of their sockets)
//   role:<role>            - one room per role (see constants/roles.js)
//   shipment:<shipmentId>  - room per shipment, populated by interested users
//   admin:global           - global room for all Admins
//
// User, role and global-admin rooms are managed exclusively by the server.
// Clients may only request shipment rooms (see sockets/connection.js).

const { ROLES_LIST } = require("../constants/roles");

const ROOM_PREFIXES = Object.freeze({
    USER: "user",
    ROLE: "role",
    SHIPMENT: "shipment",
    GLOBAL_ADMIN: "admin",
});

const GLOBAL_ADMIN_ROOM = `${ROOM_PREFIXES.GLOBAL_ADMIN}:global`;

const MONGO_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

const toRoomId = (value) => String(value);

const isValidMongoId = (value) => MONGO_ID_PATTERN.test(toRoomId(value));

const buildUserRoom = (userId) => {
    if (!isValidMongoId(userId)) {
        const error = new Error("Invalid user id for socket room");
        error.statusCode = 400;
        throw error;
    }
    return `${ROOM_PREFIXES.USER}:${toRoomId(userId)}`;
};

const buildRoleRoom = (role) => {
    if (!ROLES_LIST.includes(role)) {
        const error = new Error(`Unknown role for socket room: ${role}`);
        error.statusCode = 400;
        throw error;
    }
    return `${ROOM_PREFIXES.ROLE}:${role}`;
};

const buildShipmentRoom = (shipmentId) => {
    if (!isValidMongoId(shipmentId)) {
        const error = new Error("Invalid shipment id for socket room");
        error.statusCode = 400;
        throw error;
    }
    return `${ROOM_PREFIXES.SHIPMENT}:${toRoomId(shipmentId)}`;
};

const isShipmentRoom = (room) =>
    typeof room === "string" &&
    room.startsWith(`${ROOM_PREFIXES.SHIPMENT}:`) &&
    isValidMongoId(room.slice(ROOM_PREFIXES.SHIPMENT.length + 1));

module.exports = {
    ROOM_PREFIXES,
    GLOBAL_ADMIN_ROOM,
    isValidMongoId,
    buildUserRoom,
    buildRoleRoom,
    buildShipmentRoom,
    isShipmentRoom,
};
