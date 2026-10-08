const Notification = require("../models/Notification");
const { NOTIFICATION_TYPES } = require("../constants/notificationTypes");
const { SOCKET_EVENTS } = require("../constants/socketEvents");
const notificationService = require("./notificationService");
const socketService = require("./socketService");

// Persisted dedupe window: within this window, only ONE AI Alert may exist
// per shipment. A burst of related socket events (shipment:updated +
// shipment:status-changed + timeline:updated) all re-run the same analysis,
// so without this the same High-risk detection would fan out duplicate
// alerts. Bounded and persisted in MongoDB — no unbounded in-memory state.
const AI_ALERT_DEDUPE_WINDOW_MS = 30 * 60 * 1000;

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const uniqueUserIds = (ids) => {
    const seen = new Set();
    const result = [];
    for (const id of ids) {
        if (!id) continue;
        const key = id.toString();
        if (!seen.has(key)) {
            seen.add(key);
            result.push(id);
        }
    }
    return result;
};

const buildTitle = (shipment) =>
    `AI Alert — High Delay Risk`;
const buildMessage = (shipment, prediction) =>
    `Shipment ${shipment.shipmentId || shipment._id} shows a High delay risk ` +
    `(${Math.round((prediction.confidence || 0) * 100)}% confidence). Review the recommendations and act.`;

const hasRecentAiAlert = async (shipmentId) =>
    Notification.exists({
        type: NOTIFICATION_TYPES.AI_ALERT,
        relatedShipment: shipmentId,
        createdAt: { $gte: new Date(Date.now() - AI_ALERT_DEDUPE_WINDOW_MS) },
    });

/**
 * AI alert pipeline (Phase 9 Part 4). Fired after a valid delay-risk
 * analysis, never from controllers. Flow:
 *   High risk -> persisted dedupe check -> persist AI Alert notifications
 *   (MongoDB FIRST, through the existing notificationService, which then
 *   delivers `notification:new` realtime) -> best-effort `ai:alert` emit
 *   to the shipment room through socketService.
 *
 * Never throws: alert failures must never fail or crash the analysis that
 * triggered them. Returns { raised, reason }.
 */
const maybeRaiseHighRiskAlert = async ({ shipment, prediction, actingUser = null }) => {
    try {
        if (!shipment || !shipment._id) {
            return { raised: false, reason: "no-shipment" };
        }
        if (!prediction || prediction.risk !== "High") {
            return { raised: false, reason: "not-high-risk" };
        }

        const alreadyAlerted = await hasRecentAiAlert(shipment._id);
        if (alreadyAlerted) {
            return { raised: false, reason: "duplicate" };
        }

        const recipients = uniqueUserIds([shipment.assignedDispatcher, shipment.createdBy]);
        if (recipients.length === 0) {
            return { raised: false, reason: "no-recipients" };
        }

        const title = buildTitle(shipment);
        const message = buildMessage(shipment, prediction);

        const created = await Promise.all(
            recipients.map((recipient) =>
                notificationService.notifyAIAlert(
                    recipient,
                    title,
                    message,
                    actingUser?._id ?? null,
                    shipment._id
                )
            )
        );

        // Realtime `ai:alert` event — best-effort, never throws. The persisted
        // notifications above already delivered `notification:new` to each
        // recipient's user room; this event targets the shipment room so
        // users currently viewing the shipment can react instantly.
        try {
            socketService.emitToShipment(shipment._id, SOCKET_EVENTS.AI_ALERT, {
                shipmentId: String(shipment._id),
                risk: prediction.risk,
                confidence: prediction.confidence ?? null,
                notificationIds: created.map((notification) => String(notification._id)),
            });
        } catch (emitError) {
            console.error(`[ai-alert] ai:alert emit failed: ${emitError.message}`);
        }

        return { raised: true, notifications: created };
    } catch (error) {
        console.error(`[ai-alert] high-risk alert skipped: ${error.message}`);
        return { raised: false, reason: "error" };
    }
};

module.exports = { maybeRaiseHighRiskAlert, AI_ALERT_DEDUPE_WINDOW_MS, hasRecentAiAlert };
