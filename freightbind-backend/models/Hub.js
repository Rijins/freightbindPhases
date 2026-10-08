const mongoose = require("mongoose");

const HUB_TYPES = ["Port", "Yard", "Warehouse", "Distribution"];

const HUB_STATUSES = ["active", "inactive"];

const hubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hub name is required"],
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Hub location is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: HUB_TYPES,
        message: "Hub type must be one of: " + HUB_TYPES.join(", "),
      },
      required: [true, "Hub type is required"],
    },
    status: {
      type: String,
      enum: {
        values: HUB_STATUSES,
        message: "Hub status must be one of: " + HUB_STATUSES.join(", "),
      },
      default: "active",
    },
    capacity: {
      type: Number,
      min: [0, "Capacity cannot be negative"],
      default: null,
    },
  },
  { timestamps: true }
);

hubSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model("Hub", hubSchema);
module.exports.HUB_TYPES = HUB_TYPES;
module.exports.HUB_STATUSES = HUB_STATUSES;
