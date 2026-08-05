// Socket.IO handshake authentication.
//
// Reuses utils/verifyToken.js — the exact same JWT verification and user
// lookup used by the Express `protect` middleware. Rejected connections are
// surfaced to the client as a `connect_error` with a stable error code and
// logged server-side; the server never crashes on bad credentials.

const { verifyAndLoadUser } = require("../utils/verifyToken");

const AUTH_ERROR_CODES = Object.freeze({
    MISSING_TOKEN: "MISSING_TOKEN",
    INVALID_TOKEN: "INVALID_TOKEN",
    EXPIRED_TOKEN: "EXPIRED_TOKEN",
    ACCOUNT_INACTIVE: "ACCOUNT_INACTIVE",
});

const toErrorCode = (error) => {
    if (error.message === "Token expired") return AUTH_ERROR_CODES.EXPIRED_TOKEN;
    if (error.statusCode === 403) return AUTH_ERROR_CODES.ACCOUNT_INACTIVE;
    return AUTH_ERROR_CODES.INVALID_TOKEN;
};

const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth && socket.handshake.auth.token;
        if (!token || typeof token !== "string") {
            const error = new Error("Not authorized, no token provided");
            error.code = AUTH_ERROR_CODES.MISSING_TOKEN;
            error.data = { code: error.code };
            return next(error);
        }

        const user = await verifyAndLoadUser(token);

        // Minimal, safe user snapshot attached to the socket. Password is
        // excluded by the model's toJSON; only identity/role fields are kept.
        socket.user = {
            id: String(user._id),
            _id: user._id,
            role: user.role,
            fullName: user.fullName,
            email: user.email,
            status: user.status,
        };

        next();
    } catch (error) {
        if (!error.code) {
            error.code = toErrorCode(error);
            error.data = { code: error.code };
        }
        console.warn(`[socket] connection rejected (${error.code}): ${error.message}`);
        next(error);
    }
};

module.exports = { socketAuth, AUTH_ERROR_CODES };
