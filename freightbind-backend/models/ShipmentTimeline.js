const mongoose = require("mongoose");

const TIMELINE_EVENT_TYPES = [
  "Shipment Created",
  "Status Updated",
  "Location Updated",
  "Dispatcher Assigned",
  "Dispatcher Changed",
  "Shipment Cancelled",
  "Shipment Delivered",
  "Note Added",
];

const shipmentTimelineSchema = new mongoose.Schema(
  {
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: [true, "Timeline event must belong to a shipment"],
      immutable: true,
    },
    eventType: {
      type: String,
      enum: {
        values: TIMELINE_EVENT_TYPES,
        message: "Event type must be one of: " + TIMELINE_EVENT_TYPES.join(", "),
      },
      required: [true, "Event type is required"],
      immutable: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      immutable: true,
    },
    statusBefore: {
      type: String,
      default: null,
      immutable: true,
    },
    statusAfter: {
      type: String,
      default: null,
      immutable: true,
    },
    location: {
      type: String,
      default: null,
      immutable: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "performedBy is required"],
      immutable: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      immutable: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ---------- Indexes ----------
shipmentTimelineSchema.index({ shipment: 1 });
shipmentTimelineSchema.index({ createdAt: 1 });
shipmentTimelineSchema.index({ eventType: 1 });
shipmentTimelineSchema.index({ shipment: 1, createdAt: 1 });

// ---------- Immutability Guards ----------
// Timeline records are an append-only audit log: block edits and deletes
// at the model layer regardless of how they're attempted.
const blockMutation = function (next) {
  const error = new Error("Timeline records are immutable and cannot be modified");
  error.statusCode = 400;
  next(error);
};

shipmentTimelineSchema.pre("findOneAndUpdate", blockMutation);
shipmentTimelineSchema.pre("updateOne", blockMutation);
shipmentTimelineSchema.pre("updateMany", blockMutation);
shipmentTimelineSchema.pre("findOneAndDelete", blockMutation);
shipmentTimelineSchema.pre("findOneAndRemove", blockMutation);
shipmentTimelineSchema.pre("deleteOne", blockMutation);
shipmentTimelineSchema.pre("deleteMany", blockMutation);

module.exports = mongoose.model("ShipmentTimeline", shipmentTimelineSchema);
module.exports.TIMELINE_EVENT_TYPES = TIMELINE_EVENT_TYPES;
