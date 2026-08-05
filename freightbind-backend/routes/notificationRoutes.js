const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const { ROLES } = require("../constants/roles");
const {
    createNotificationValidation,
    notificationIdValidation,
    getNotificationsValidation,
} = require("../validations/notificationValidation");

router
    .route("/")
    .post(
        protect,
        authorize(ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR),
        createNotificationValidation,
        validateRequest,
        notificationController.createNotification
    )
    .get(protect, getNotificationsValidation, validateRequest, notificationController.getNotifications);

// NOTE: static sub-paths (/unread-count, /read-all, /read) are registered
// before the /:id routes below — Express matches routes in order, and
// "/:id" would otherwise swallow these as if ":id" === "unread-count".
router.get("/unread-count", protect, notificationController.getUnreadCount);
router.patch("/read-all", protect, notificationController.markAllAsRead);
router.delete("/read", protect, notificationController.deleteAllReadNotifications);

router
    .route("/:id")
    .get(protect, notificationIdValidation, validateRequest, notificationController.getNotification)
    .delete(protect, notificationIdValidation, validateRequest, notificationController.deleteNotification);

router.patch(
    "/:id/read",
    protect,
    notificationIdValidation,
    validateRequest,
    notificationController.markAsRead
);

module.exports = router;
