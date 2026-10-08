const ChatMessage = require("../models/ChatMessage");
const Shipment = require("../models/Shipment");
const User = require("../models/User");
const { ROLES } = require("../constants/roles");
const { SOCKET_EVENTS } = require("../constants/socketEvents");
const socketService = require("./socketService");
const notificationService = require("./notificationService");

// Shipment-scoped operational chat (Carrier Dispatcher <-> Hub Operator /
// Warehouse Staff). Access is enforced here on every read AND write — the
// routes only authenticate, they never authorize chat participants.

const USER_POPULATE_FIELDS = "fullName email role";
const MESSAGE_POPULATE_FIELDS = "fullName email role";

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// ------------------------------------------------------------------
// Access control (single source of truth for every chat operation)
// ------------------------------------------------------------------
//   Carrier Dispatcher : only the dispatcher assigned to the shipment
//   Hub Operator       : only when their hub matches the shipment's hub
//   Admin / Logistics Director / others : 403 — platform roles are not
//                        operational chat participants (by design).
const assertChatAccess = (shipment, user) => {
    if (user.role === ROLES.CARRIER_DISPATCHER) {
        if (shipment.assignedDispatcher && shipment.assignedDispatcher.equals(user._id)) {
            return;
        }
        throw createError("You can only chat on shipments assigned to you", 403);
    }

    if (user.role === ROLES.HUB_OPERATOR) {
        if (user.hub && shipment.hub && user.hub.equals(shipment.hub._id || shipment.hub)) {
            return;
        }
        throw createError("You can only chat on shipments relevant to your hub", 403);
    }

    throw createError("Forbidden: insufficient role permissions to access shipment chat", 403);
};

const getShipmentOr404 = async (shipmentId) => {
    const shipment = await Shipment.findById(shipmentId)
        .populate("assignedDispatcher", USER_POPULATE_FIELDS)
        .populate("hub", "name location type status");
    if (!shipment) {
        throw createError("Shipment not found", 404);
    }
    return shipment;
};

// Active Hub Operators whose hub matches the shipment's hub — the people
// who can participate in this shipment's operational chat.
const getHubOperatorParticipants = async (shipment) => {
    if (!shipment.hub) return [];
    return User.find({ role: ROLES.HUB_OPERATOR, status: "active", hub: shipment.hub._id || shipment.hub })
        .select(USER_POPULATE_FIELDS)
        .sort({ fullName: 1 });
};

// ------------------------------------------------------------------
// Chat context: shipment reference + participants (for the UI header)
// ------------------------------------------------------------------
const getChatContext = async (shipmentId, user) => {
    const shipment = await getShipmentOr404(shipmentId);
    assertChatAccess(shipment, user);

    const hubOperators = await getHubOperatorParticipants(shipment);

    return {
        shipment: {
            _id: shipment._id,
            shipmentId: shipment.shipmentId,
            title: shipment.title,
            status: shipment.status,
            priority: shipment.priority,
            hub: shipment.hub,
        },
        dispatcher: shipment.assignedDispatcher || null,
        hubOperators,
    };
};

// ------------------------------------------------------------------
// Messages
// ------------------------------------------------------------------
const getMessages = async (shipmentId, user, { page = 1, limit = 50 } = {}) => {
    const shipment = await getShipmentOr404(shipmentId);
    assertChatAccess(shipment, user);

    const skip = (page - 1) * limit;
    const [messages, totalItems] = await Promise.all([
        ChatMessage.find({ shipment: shipmentId })
            .populate("sender", MESSAGE_POPULATE_FIELDS)
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit),
        ChatMessage.countDocuments({ shipment: shipmentId }),
    ]);

    return {
        messages,
        pagination: {
            totalItems,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
        },
    };
};

const buildChatMessagePayload = (message) => {
    const sender = message.sender;
    return {
        id: message._id ? String(message._id) : null,
        shipmentId: message.shipment ? String(message.shipment) : null,
        message: message.message,
        sender: sender
            ? {
                  _id: String(sender._id || sender),
                  fullName: sender.fullName || null,
                  email: sender.email || null,
                  role: sender.role || null,
              }
            : null,
        createdAt: message.createdAt ? new Date(message.createdAt).getTime() : Date.now(),
    };
};

const sendMessage = async (shipmentId, user, text) => {
    const shipment = await getShipmentOr404(shipmentId);
    assertChatAccess(shipment, user);

    const message = await ChatMessage.create({
        shipment: shipment._id,
        sender: user._id,
        message: text,
    });

    // Realtime delivery is strictly user-scoped: the assigned dispatcher and
    // the shipment hub's active operators. Never a role/broadcast emit, so
    // unrelated users can never receive another shipment's conversation.
    try {
        const recipientIds = [];
        if (shipment.assignedDispatcher) {
            recipientIds.push(shipment.assignedDispatcher._id || shipment.assignedDispatcher);
        }
        const hubOperators = await getHubOperatorParticipants(shipment);
        hubOperators.forEach((operator) => {
            if (!operator._id.equals(user._id)) recipientIds.push(operator._id);
        });

        const populated = await ChatMessage.findById(message._id).populate(
            "sender",
            MESSAGE_POPULATE_FIELDS
        );
        const payload = buildChatMessagePayload(populated);

        if (recipientIds.length) {
            socketService.emitToUsers(recipientIds, SOCKET_EVENTS.CHAT_MESSAGE, {
                shipmentId: String(shipment._id),
                message: payload,
            });
        }

        // Chat notifications: exactly the same participant set, minus the
        // sender (never self-notify). Each recipient is dispatched through
        // the existing notification funnel (persist + notification:new +
        // notification:count), guarded individually so one inactive
        // recipient can never block the message send or the others.
        const senderId = String(user._id);
        for (const recipientId of recipientIds) {
            if (String(recipientId) === senderId) continue;
            try {
                await notificationService.notifyChatMessage({
                    shipment,
                    sender: user,
                    recipient: recipientId,
                });
            } catch (notifyError) {
                console.error(`[chat] notification delivery failed: ${notifyError.message}`);
            }
        }
    } catch (error) {
        console.error(`[chat] realtime delivery failed: ${error.message}`);
    }

    const populated = await ChatMessage.findById(message._id).populate("sender", MESSAGE_POPULATE_FIELDS);
    return populated;
};

module.exports = {
    assertChatAccess,
    getChatContext,
    getMessages,
    sendMessage,
};
