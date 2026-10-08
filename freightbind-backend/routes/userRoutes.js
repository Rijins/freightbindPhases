const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const { ROLES } = require("../constants/roles");
const {
    createUserValidation,
    updateUserValidation,
    updateUserStatusValidation,
    userIdValidation,
    getUsersValidation,
    getDispatchersValidation,
} = require("../validations/userValidation");

router
    .route("/")
    .get(
        protect,
        authorize(ROLES.ADMIN),
        getUsersValidation,
        validateRequest,
        userController.listUsers
    )
    .post(
        protect,
        authorize(ROLES.ADMIN),
        createUserValidation,
        validateRequest,
        userController.createUser
    );

// Active Carrier Dispatcher candidates for the shipment assignment selector.
// Must be declared before "/:id" so "dispatchers" is not captured as an ID.
router.get(
    "/dispatchers",
    protect,
    authorize(ROLES.ADMIN, ROLES.LOGISTICS_DIRECTOR),
    getDispatchersValidation,
    validateRequest,
    userController.listDispatchers
);

// Active Hub Operator candidates for hub assignment selectors. Admin-only
// (hub assignment is an Admin responsibility). Same "before /:id" rule.
router.get(
    "/hub-operators",
    protect,
    authorize(ROLES.ADMIN),
    getDispatchersValidation,
    validateRequest,
    userController.listHubOperators
);

router
    .route("/:id")
    .get(
        protect,
        authorize(ROLES.ADMIN),
        userIdValidation,
        validateRequest,
        userController.getUserById
    )
    .put(
        protect,
        authorize(ROLES.ADMIN),
        userIdValidation,
        updateUserValidation,
        validateRequest,
        userController.updateUser
    );

router
    .route("/:id/status")
    .patch(
        protect,
        authorize(ROLES.ADMIN),
        updateUserStatusValidation,
        validateRequest,
        userController.updateUserStatus
    );

module.exports = router;
