const http = require("http");
const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
const { initSocket, closeSocketServer } = require("./sockets");

const PORT = process.env.PORT || 5000;
const SHUTDOWN_TIMEOUT_MS = 10000;

let server = null;

const startServer = async () => {
    await connectDB();

    // One shared HTTP server for Express and Socket.IO — the Express
    // architecture in app.js is untouched.
    server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
        console.log(`FreightBind AI backend running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
        console.log("Socket.IO server attached and listening");
    });
};

startServer().catch((error) => {
    console.error(`Server failed to start: ${error.message}`);
    process.exit(1);
});

const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);

    if (!server) {
        process.exit(0);
    }

    const forceExit = setTimeout(() => {
        console.error("Forced shutdown after timeout");
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    await closeSocketServer();

    server.close(() => {
        mongoose.disconnect().finally(() => {
            console.log("HTTP server closed");
            process.exit(0);
        });
    });
    if (typeof server.closeIdleConnections === "function") {
        server.closeIdleConnections();
    }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (error) => {
    console.error(`Unhandled Rejection: ${error.message}`);
    process.exit(1);
});
