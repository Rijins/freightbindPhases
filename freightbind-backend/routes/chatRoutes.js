const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");
const { protect } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const {
    getChatContextValidation,
    getMessagesValidation,
    sendMessageValidation,
} = require("../validations/chatValidation");

// Operational shipment chat (Carrier Dispatcher <-> Hub Operator). Access
// control is enforced inside services/chatService.js on every operation —
// no route-level authorize() exists because participation depends on the
// shipment's assignment/hub relationship, not the role alone.

router.get(
    "/shipments/:shipmentId",
    protect,
    getChatContextValidation,
    validateRequest,
    chatController.getChatContext
);

router
    .route("/shipments/:shipmentId/messages")
    .get(
        protect,
        getMessagesValidation,
        validateRequest,
        chatController.getMessages
    )
    .post(
        protect,
        sendMessageValidation,
        validateRequest,
        chatController.sendMessage
    );

module.exports = router;
