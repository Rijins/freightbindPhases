// Shared JWT verification + user loading.
//
// This is the single authentication path used by BOTH the Express `protect`
// middleware and the Socket.IO handshake middleware, so socket connections
// are authenticated exactly like HTTP requests — no duplicated logic.
//
// Error messages/status codes intentionally match what the Express error
// handler produces for the same failures.

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createAuthError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const verifyAndLoadUser = async (token) => {
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw createAuthError("Token expired", 401);
        }
        throw createAuthError("Invalid token", 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
        throw createAuthError("Not authorized, user no longer exists", 401);
    }
    if (user.status !== "active") {
        throw createAuthError("Account is not active", 403);
    }

    return user;
};

module.exports = { verifyAndLoadUser };
