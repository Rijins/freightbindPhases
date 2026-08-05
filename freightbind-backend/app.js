const express = require("express");
const cors =require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const timelineRoutes = require("./routes/timelineRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// ---------- Core Middleware ----------
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
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
app.use("/api/v1/shipments", shipmentRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/notifications", notificationRoutes);

// ---------- Error Handling ----------
app.use(notFound);
app.use(errorHandler);

module.exports = app;