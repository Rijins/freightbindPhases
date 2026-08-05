// Socket.IO bootstrap. Attaches ONE server instance to the shared HTTP
// server (created in server.js), wires the handshake auth middleware and
// the connection handler, and exposes the instance to the rest of the
// backend. The singleton guard makes a second init impossible, which also
// prevents duplicate `connection` listeners.
//
// The rest of the backend must never touch Socket.IO directly — it uses
// services/socketService.js instead.

const { Server } = require("socket.io");

const { socketAuth } = require("./auth");
const { handleConnection } = require("./connection");
const { SOCKET_EVENTS } = require("../constants/socketEvents");

let io = null;

const buildSocketConfig = () => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    return {
        cors: {
            origin: clientUrl,
            methods: ["GET", "POST"],
            credentials: true,
        },
        pingInterval: 25000,
        pingTimeout: 20000,
    };
};

const initSocket = (httpServer) => {
    if (io) return io;

    io = new Server(httpServer, buildSocketConfig());

    io.use(socketAuth);

    io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
        handleConnection(io, socket);
    });

    // Transport-level failures (bad handshake, aborted requests) are logged
    // and never crash the server.
    io.engine.on("connection_error", (error) => {
        console.warn(`[socket] engine connection error: ${error.message}`);
    });

    return io;
};

const isInitialized = () => io !== null;

const getSocketServer = () => io;

const closeSocketServer = async () => {
    if (!io) return;
    const current = io;
    io = null;
    try {
        await current.close();
    } catch (error) {
        console.error(`[socket] close error: ${error.message}`);
    }
};

module.exports = { initSocket, isInitialized, getSocketServer, closeSocketServer };
