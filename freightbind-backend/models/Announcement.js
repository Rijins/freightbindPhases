const mongoose = require("mongoose");
const { NOTIFICATION_PRIORITIES_LIST } = require("../constants/notificationTypes");

// Company-wide system announcements, managed by Admins. A single announcement
// record is the source of truth; publishing/activating fans out per-recipient
// Notification rows through notificationService.notifySystemAnnouncement so
// the existing inbox + realtime pipeline is reused.
const announcementSchema = new mongoose.Schema(
    {
        title: { type: String, required: [true, "Title is required"], trim: true },
        message: { type: String, required: [true, "Message is required"], trim: true },
        priority: {
            type: String,
            enum: {
                values: NOTIFICATION_PRIORITIES_LIST,
                message: "Priority must be one of: " + NOTIFICATION_PRIORITIES_LIST.join(", "),
            },
            default: "Medium",
        },
        status: {
            type: String,
            enum: {
                values: ["active", "inactive"],
                message: "Status must be one of: active, inactive",
            },
            default: "inactive",
        },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date, default: null },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

announcementSchema.index({ status: 1, startDate: 1, endDate: 1 });
announcementSchema.index({ createdAt: -1 });

announcementSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model("Announcement", announcementSchema);
