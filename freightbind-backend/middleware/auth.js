

const asyncHandler = require("../utils/asyncHandler");
const { verifyAndLoadUser } = require("../utils/verifyToken");

const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        const error = new Error("Not authorized, no token provided");
        error.statusCode = 401;
        throw error;
    }

    // Shared with the socket handshake (utils/verifyToken.js) — HTTP and
    // realtime connections authenticate through the exact same path.
    req.user = await verifyAndLoadUser(token);
    next();
});

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            const error = new Error("Not authorized");
            error.statusCode = 401;
            return next(error);
        }
        if (!allowedRoles.includes(req.user.role)) {
            const error = new Error("Forbidden: insufficient role permissions");
            error.statusCode = 403;
            return next(error);
        }
        next();
    };
};

module.exports = { protect, authorize };