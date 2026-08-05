const express = require("express");
const router = express.Router();

const shipmentController = require("../controllers/shipmentController");
const { protect, authorize } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const { ROLES } = require("../constants/roles");
const {
    createShipmentValidation,
    updateShipmentValidation,
    shipmentIdValidation,
    getShipmentsValidation,
} = require("../validations/shipmentValidation");

router
    .route("/")
    .post(
        protect,
        authorize(ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR),
        createShipmentValidation,
        validateRequest,
        shipmentController.createShipment
    )
    .get(protect, getShipmentsValidation, validateRequest, shipmentController.getShipments);

router
    .route("/:id")
    .get(protect, shipmentIdValidation, validateRequest, shipmentController.getShipmentById)
    .put(
        protect,
        shipmentIdValidation,
        updateShipmentValidation,
        validateRequest,
        shipmentController.updateShipment
    )
    .delete(
        protect,
        authorize(ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR),
        shipmentIdValidation,
        validateRequest,
        shipmentController.deleteShipment
    );

module.exports = router;
