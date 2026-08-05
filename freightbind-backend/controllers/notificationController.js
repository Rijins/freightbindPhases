const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../helpers/apiResponse");
const notificationService = require("../services/notificationService");

const createNotification = asyncHandler(async (req, res) => {
    const notification = await notificationService.createNotification(req.body, req.user);
    return success(res, {
        statusCode: 201,
        message: "Notification created successfully",
        data: { notification },
    });
});

const getNotifications = asyncHandler(async (req, res) => {
    const { notifications, pagination } = await notificationService.getNotifications(req.query, req.user);
    return success(res, {
        message: "Notifications fetched successfully",
        data: { notifications, pagination },
    });
});

const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await notificationService.countUnread(req.user);
    return success(res, {
        message: "Unread notification count fetched successfully",
        data: { count },
    });
});

const getNotification = asyncHandler(async (req, res) => {
    const notification = await notificationService.getNotification(req.params.id, req.user);
    return success(res, {
        message: "Notification fetched successfully",
        data: { notification },
    });
});

const markAsRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id, req.user);
    return success(res, {
        message: "Notification marked as read",
        data: { notification },
    });
});

const markAllAsRead = asyncHandler(async (req, res) => {
    const result = await notificationService.markAllAsRead(req.user);
    return success(res, {
        message: "All notifications marked as read",
        data: { result },
    });
});

const deleteNotification = asyncHandler(async (req, res) => {
    await notificationService.deleteNotification(req.params.id, req.user);
    return success(res, {
        message: "Notification deleted successfully",
        data: {},
    });
});

const deleteAllReadNotifications = asyncHandler(async (req, res) => {
    const result = await notificationService.deleteAllReadNotifications(req.user);
    return success(res, {
        message: "Read notifications deleted successfully",
        data: { result },
    });
});

module.exports = {
    createNotification,
    getNotifications,
    getUnreadCount,
    getNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllReadNotifications,
};
