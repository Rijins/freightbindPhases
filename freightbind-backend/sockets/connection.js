// Socket connection lifecycle: presence tracking, automatic room
// membership, client-requested shipment room joins, and disconnect cleanup.
//
// Presence model: one user may hold several sockets (multi-tab / reconnect).
// `user:online` is broadcast only when the user's FIRST socket connects and
// `user:offline` only when their LAST socket disconnects, so duplicate
// connections never produce duplicate presence events.
//
// The userSockets map is also the backing store socketService uses to emit
// to a user's sockets and to join/leave rooms for a user.

const { SOCKET_EVENTS } = require("../constants/socketEvents");
const { ROLES } = require("../constants/roles");
const {
    GLOBAL_ADMIN_ROOM,
    buildUserRoom,
    buildRoleRoom,
    isShipmentRoom,
} = require("../helpers/socketRooms");

const userSockets = new Map();

const registerSocket = (socket) => {
    const userId = socket.user.id;
    let sockets = userSockets.get(userId);
    if (!sockets) {
        sockets = new Set();
        userSockets.set(userId, sockets);
    }
    sockets.add(socket.id);
};

const unregisterSocket = (socket) => {
    const userId = socket.user && socket.user.id;
    if (!userId) return false;

    const sockets = userSockets.get(userId);
    if (!sockets) return false;

    sockets.delete(socket.id);
    if (sockets.size === 0) {
        userSockets.delete(userId);
        return true;
    }
    return false;
};

const getUserSocketIds = (userId) => userSockets.get(String(userId));

const isUserOnline = (userId) => {
    const sockets = getUserSocketIds(userId);
    return Boolean(sockets && sockets.size > 0);
};

const joinServerManagedRooms = (socket) => {
    socket.join(buildUserRoom(socket.user.id));
    socket.join(buildRoleRoom(socket.user.role));
    if (socket.user.role === ROLES.ADMIN) {
        socket.join(GLOBAL_ADMIN_ROOM);
    }
};

const handleRoomJoin = (socket, room) => {
    if (!isShipmentRoom(room)) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
            message: "Only shipment rooms can be joined from the client",
        });
        return;
    }
    socket.join(room);
};

const handleRoomLeave = (socket, room) => {
    if (!isShipmentRoom(room)) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
            message: "Only shipment rooms can be left from the client",
        });
        return;
    }
    socket.leave(room);
};

const handleDisconnect = (io, socket, reason) => {
    try {
        const user = socket.user;
        if (!user) return;

        const wasLastSocket = unregisterSocket(socket);

        if (wasLastSocket) {
            // Presence payload is deliberately minimal (no names/emails) so
            // online/offline events never leak data across roles.
            io.emit(SOCKET_EVENTS.USER_OFFLINE, { userId: user.id, role: user.role });
        }

        // Socket.IO removes the socket from all rooms automatically on
        // disconnect, so there is nothing else to clean up here.
    } catch (error) {
        console.error(`[socket] disconnect handler error: ${error.message}`);
    }
};

const handleConnection = (io, socket) => {
    try {
        registerSocket(socket);
        joinServerManagedRooms(socket);

        const isFirstSocket = userSockets.get(socket.user.id).size === 1;
        if (isFirstSocket) {
            io.emit(SOCKET_EVENTS.USER_ONLINE, { userId: socket.user.id, role: socket.user.role });
        }

        socket.on(SOCKET_EVENTS.ROOM_JOIN, (room) => handleRoomJoin(socket, room));
        socket.on(SOCKET_EVENTS.ROOM_LEAVE, (room) => handleRoomLeave(socket, room));
        socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => handleDisconnect(io, socket, reason));

        socket.on("error", (error) => {
            console.error(`[socket] client socket error: ${error.message}`);
        });
    } catch (error) {
        console.error(`[socket] connection handler error: ${error.message}`);
        socket.emit(SOCKET_EVENTS.AUTH_ERROR, { message: "Connection could not be established" });
        socket.disconnect(true);
    }
};

module.exports = {
    handleConnection,
    getUserSocketIds,
    isUserOnline,
};
