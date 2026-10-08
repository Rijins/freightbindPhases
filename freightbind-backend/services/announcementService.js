const Announcement = require("../models/Announcement");
const notificationService = require("./notificationService");
const { ROLES } = require("../constants/roles");

// Admin-managed system announcements. The announcement record is the single
// source of truth for what users may see (status + date window); publishing
// (activating) additionally fans out per-recipient Notification rows through
// the existing notificationService so users get inbox + realtime delivery.

const ANNOUNCEMENT_EDITABLE_FIELDS = [
    "title",
    "message",
    "priority",
    "status",
    "startDate",
    "endDate",
];
const ANNOUNCEMENT_SORT_FIELDS = ["createdAt", "updatedAt", "title", "priority", "status"];

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// Deliver the announcement to every active user through the existing
// notification fan-out. Best-effort by design (mirrors deliverRealtime's
// "never throws" contract): an inbox/socket hiccup must never roll back or
// fail the publish itself.
const fanOutAnnouncement = async (announcement, actor) => {
    try {
        await notificationService.notifySystemAnnouncement(
            {
                title: announcement.title,
                message: announcement.message,
                priority: announcement.priority,
            },
            actor
        );
    } catch (error) {
        console.warn("Announcement fan-out failed:", error.message);
    }
};

// The window a user-visible announcement must be inside right now.
const buildUserVisibilityQuery = () => {
    const now = new Date();
    return {
        status: "active",
        startDate: { $lte: now },
        $or: [{ endDate: null }, { endDate: { $gte: now } }],
    };
};

const isWithinWindow = (announcement) => {
    const now = Date.now();
    const start = announcement.startDate ? new Date(announcement.startDate).getTime() : 0;
    const end = announcement.endDate ? new Date(announcement.endDate).getTime() : Infinity;
    return start <= now && now <= end;
};

// A non-admin may only ever see active announcements inside their date window.
const isVisibleToUser = (announcement) =>
    announcement.status === "active" && isWithinWindow(announcement);

const createAnnouncement = async (payload, actor) => {
    const announcement = await Announcement.create({
        title: payload.title,
        message: payload.message,
        priority: payload.priority || "Medium",
        status: payload.status || "inactive",
        startDate: payload.startDate || Date.now(),
        endDate: payload.endDate || null,
        createdBy: actor._id,
    });

    if (announcement.status === "active") {
        await fanOutAnnouncement(announcement, actor);
    }
    return announcement;
};

const getAnnouncements = async (filters, actor) => {
    const { search, status, page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = filters;

    const isAdmin = actor.role === ROLES.ADMIN;
    const conditions = [];

    if (isAdmin) {
        if (status) conditions.push({ status });
    } else {
        conditions.push(buildUserVisibilityQuery());
    }

    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchExpression = new RegExp(escapedSearch, "i");
        conditions.push({ $or: [{ title: searchExpression }, { message: searchExpression }] });
    }

    const query = conditions.length ? { $and: conditions } : {};

    const sortField = ANNOUNCEMENT_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const sort = { [sortField]: order === "asc" ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [announcements, totalItems] = await Promise.all([
        Announcement.find(query).sort(sort).skip(skip).limit(limit),
        Announcement.countDocuments(query),
    ]);

    return {
        announcements,
        pagination: {
            totalItems,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
        },
    };
};

const getAnnouncementById = async (announcementId, actor) => {
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
        throw createError("Announcement not found", 404);
    }

    const isAdmin = actor.role === ROLES.ADMIN;
    if (!isAdmin && !isVisibleToUser(announcement)) {
        // Never leak inactive/expired/scheduled announcements to non-admins.
        throw createError("Announcement not found", 404);
    }
    return announcement;
};

const updateAnnouncement = async (announcementId, payload, actor) => {
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
        throw createError("Announcement not found", 404);
    }

    const updates = {};
    ANNOUNCEMENT_EDITABLE_FIELDS.forEach((field) => {
        if (payload[field] !== undefined) updates[field] = payload[field];
    });
    if (!Object.keys(updates).length) {
        throw createError("No valid announcement fields were provided for update", 422);
    }

    if (updates.startDate !== undefined && updates.endDate !== undefined) {
        if (new Date(updates.endDate).getTime() < new Date(updates.startDate).getTime()) {
            throw createError("End date must be on or after the start date", 422);
        }
    }

    const wasActive = announcement.status === "active";
    announcement.set(updates);
    await announcement.save();

    const becameActive = announcement.status === "active" && !wasActive;
    if (becameActive) {
        await fanOutAnnouncement(announcement, actor);
    }
    return announcement;
};

const setAnnouncementStatus = async (announcementId, status, actor) => {
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
        throw createError("Announcement not found", 404);
    }

    const wasActive = announcement.status === "active";
    announcement.status = status;
    await announcement.save();

    const becameActive = status === "active" && !wasActive;
    if (becameActive) {
        await fanOutAnnouncement(announcement, actor);
    }
    return announcement;
};

const deleteAnnouncement = async (announcementId) => {
    const announcement = await Announcement.findByIdAndDelete(announcementId);
    if (!announcement) {
        throw createError("Announcement not found", 404);
    }
    // Already-delivered notification copies intentionally remain in users'
    // inboxes — deleting the announcement does not retract what was sent.
    return announcement;
};

module.exports = {
    createAnnouncement,
    getAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
    setAnnouncementStatus,
    deleteAnnouncement,
};
