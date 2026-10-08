const mongoose = require("mongoose");
const crypto = require("crypto");

const SHIPMENT_STATUSES = [
  "Draft",
  "Created",
  "Scheduled",
  "In Transit",
  "Delayed",
  "Delivered",
  "Cancelled",
];

const SHIPMENT_PRIORITIES = ["Low", "Medium", "High", "Critical"];

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      default: () => `FB-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    },
    title: {
      type: String,
      required: [true, "Shipment title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    cargoType: {
      type: String,
      required: [true, "Cargo type is required"],
      trim: true,
    },
    shipmentType: {
      type: String,
      required: [true, "Shipment type is required"],
      trim: true,
    },
    origin: {
      type: String,
      required: [true, "Origin is required"],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    currentLocation: {
      type: String,
      trim: true,
      default: null,
    },
    priority: {
      type: String,
      enum: SHIPMENT_PRIORITIES,
      default: "Medium",
    },
    status: {
      type: String,
      enum: SHIPMENT_STATUSES,
      default: "Draft",
    },
    assignedDispatcher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Operational Hub this shipment hands through (e.g. Kochi Port Hub).
    // Set by Admin / Logistics Director; Hub Operators of this hub gain
    // operational visibility + chat access for the shipment.
    hub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hub",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Shipment creator is required"],
      immutable: true,
    },
    estimatedDeparture: {
      type: Date,
      default: null,
    },
    estimatedArrival: {
      type: Date,
      default: null,
    },
    actualDeparture: {
      type: Date,
      default: null,
    },
    actualArrival: {
      type: Date,
      default: null,
    },
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
      default: null,
    },
    containerNumber: {
      type: String,
      trim: true,
      default: null,
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

shipmentSchema.index({ status: 1, priority: 1 });
shipmentSchema.index({ origin: 1, destination: 1 });
shipmentSchema.index({ assignedDispatcher: 1 });
shipmentSchema.index({ createdBy: 1 });
shipmentSchema.index({ hub: 1 });

module.exports = mongoose.model("Shipment", shipmentSchema);
module.exports.SHIPMENT_STATUSES = SHIPMENT_STATUSES;
module.exports.SHIPMENT_PRIORITIES = SHIPMENT_PRIORITIES;
