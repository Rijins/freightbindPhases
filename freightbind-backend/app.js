const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const timelineRoutes = require("./routes/timelineRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const aiRoutes = require("./routes/aiRoutes");
const hubRoutes = require("./routes/hubRoutes");
const chatRoutes = require("./routes/chatRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const openapiSpec = require("./docs/openapi");

const app = express();

// ---------- CORS Origin Resolution ----------
// Validate CLIENT_URL so a malformed/stale env value (e.g. a value
// accidentally concatenated with another variable) can never produce
// an invalid Access-Control-Allow-Origin header.
const DEFAULT_CLIENT_URL = "http://localhost:3000";
const rawClientUrl = (process.env.CLIENT_URL || "").trim();
const isValidHttpUrl = (value) => {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
};
const ALLOWED_ORIGINS = [DEFAULT_CLIENT_URL];
if (isValidHttpUrl(rawClientUrl)) {
    ALLOWED_ORIGINS.push(rawClientUrl);
}

// ---------- Core Middleware ----------
app.use(
    cors({
        origin(origin, callback) {
            // Allow requests with no Origin (server-to-server, curl, etc.)
            if (!origin) return callback(null, true);
            if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
            callback(new Error(`CORS: origin ${origin} is not allowed`));
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// ---------- Health Check ----------
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "FreightBind AI API is running",
        data: {
            uptime: process.uptime(),
        },
    });
});

// ---------- Routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/v1/shipments", shipmentRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/hubs", hubRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/analytics", analyticsRoutes);

// ---------- API Documentation ----------
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

// ---------- Error Handling ----------
app.use(notFound);
app.use(errorHandler);

module.exports = app;