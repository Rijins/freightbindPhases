const mongoose = require("mongoose");

// Shipment-scoped operational chat message (Carrier Dispatcher <-> Hub
// Operator / Warehouse Staff). Messages are append-only: once written, a
// message's shipment and sender are immutable so a conversation can never
// be silently reparented to another shipment.
const chatMessageSchema = new mongoose.Schema(
  {
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: [true, "Chat message must belong to a shipment"],
      immutable: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Chat message sender is required"],
      immutable: true,
    },
    message: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

chatMessageSchema.index({ shipment: 1, createdAt: 1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
