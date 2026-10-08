const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../helpers/apiResponse");
const chatService = require("../services/chatService");

const getChatContext = asyncHandler(async (req, res) => {
    const context = await chatService.getChatContext(req.params.shipmentId, req.user);
    return success(res, {
        message: "Chat context fetched successfully",
        data: context,
    });
});

const getMessages = asyncHandler(async (req, res) => {
    const { messages, pagination } = await chatService.getMessages(
        req.params.shipmentId,
        req.user,
        req.query
    );
    return success(res, {
        message: "Messages fetched successfully",
        data: { messages, pagination },
    });
});

const sendMessage = asyncHandler(async (req, res) => {
    const message = await chatService.sendMessage(
        req.params.shipmentId,
        req.user,
        req.body.message
    );
    return success(res, {
        statusCode: 201,
        message: "Message sent successfully",
        data: { message },
    });
});

module.exports = { getChatContext, getMessages, sendMessage };
