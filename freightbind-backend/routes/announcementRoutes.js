const express = require("express");
const router = express.Router();

const announcementController = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const { ROLES } = require("../constants/roles");
const {
    createAnnouncementValidation,
    updateAnnouncementValidation,
    announcementStatusValidation,
    announcementIdValidation,
    getAnnouncementsValidation,
} = require("../validations/announcementValidation");

// Viewing is open to every authenticated user (users only ever see
// active, in-window announcements — the service enforces it). All
// management operations are Admin-only on the backend.
router
    .route("/")
    .get(protect, getAnnouncementsValidation, validateRequest, announcementController.getAnnouncements)
    .post(
        protect,
        authorize(ROLES.ADMIN),
        createAnnouncementValidation,
        validateRequest,
        announcementController.createAnnouncement
    );

router
    .route("/:id")
    .get(protect, announcementIdValidation, validateRequest, announcementController.getAnnouncementById)
    .put(
        protect,
        authorize(ROLES.ADMIN),
        announcementIdValidation,
        updateAnnouncementValidation,
        validateRequest,
        announcementController.updateAnnouncement
    )
    .delete(
        protect,
        authorize(ROLES.ADMIN),
        announcementIdValidation,
        validateRequest,
        announcementController.deleteAnnouncement
    );

router
    .route("/:id/status")
    .patch(
        protect,
        authorize(ROLES.ADMIN),
        announcementStatusValidation,
        validateRequest,
        announcementController.setAnnouncementStatus
    );

module.exports = router;
