const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../helpers/apiResponse");
const announcementService = require("../services/announcementService");

const createAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await announcementService.createAnnouncement(req.body, req.user);
    return success(res, {
        statusCode: 201,
        message: "Announcement created successfully",
        data: { announcement },
    });
});

const getAnnouncements = asyncHandler(async (req, res) => {
    const { announcements, pagination } = await announcementService.getAnnouncements(
        req.query,
        req.user
    );
    return success(res, {
        message: "Announcements fetched successfully",
        data: { announcements, pagination },
    });
});

const getAnnouncementById = asyncHandler(async (req, res) => {
    const announcement = await announcementService.getAnnouncementById(req.params.id, req.user);
    return success(res, {
        message: "Announcement fetched successfully",
        data: { announcement },
    });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await announcementService.updateAnnouncement(
        req.params.id,
        req.body,
        req.user
    );
    return success(res, {
        message: "Announcement updated successfully",
        data: { announcement },
    });
});

const setAnnouncementStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const announcement = await announcementService.setAnnouncementStatus(
        req.params.id,
        status,
        req.user
    );
    return success(res, {
        message: `Announcement ${status === "active" ? "activated" : "deactivated"} successfully`,
        data: { announcement },
    });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
    await announcementService.deleteAnnouncement(req.params.id);
    return success(res, {
        message: "Announcement deleted successfully",
        data: {},
    });
});

module.exports = {
    createAnnouncement,
    getAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
    setAnnouncementStatus,
    deleteAnnouncement,
};
