const express = require("express");
const router = express.Router();

const hubController = require("../controllers/hubController");
const { protect, authorize } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const { ROLES } = require("../constants/roles");
const {
    createHubValidation,
    updateHubValidation,
    hubStatusValidation,
    hubIdValidation,
    getHubsValidation,
} = require("../validations/hubValidation");

// A Hub Operator's own hub — available to any authenticated user (the
// service returns 404 for roles without an operational hub). Declared
// before "/:id" so "my" is never captured as a hub ID.
router.get("/my", protect, hubController.getMyHub);

// Hub read access is granted to Admin AND Logistics Director (Directors
// must be able to reference a hub when creating/editing shipments). All
// hub MANAGEMENT (create, update, status, operators) stays Admin-only —
// Logistics Directors, Carrier Dispatchers and Hub Operators receive 403.
router
    .route("/")
    .get(
        protect,
        authorize(ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR),
        getHubsValidation,
        validateRequest,
        hubController.listHubs
    )
    .post(
        protect,
        authorize(ROLES.ADMIN),
        createHubValidation,
        validateRequest,
        hubController.createHub
    );

router.get(
    "/:id/operators",
    protect,
    authorize(ROLES.ADMIN),
    hubIdValidation,
    validateRequest,
    hubController.listHubOperators
);

router
    .route("/:id")
    .get(
        protect,
        authorize(ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR),
        hubIdValidation,
        validateRequest,
        hubController.getHubById
    )
    .put(
        protect,
        authorize(ROLES.ADMIN),
        hubIdValidation,
        updateHubValidation,
        validateRequest,
        hubController.updateHub
    );

router
    .route("/:id/status")
    .patch(
        protect,
        authorize(ROLES.ADMIN),
        hubStatusValidation,
        validateRequest,
        hubController.setHubStatus
    );

module.exports = router;
