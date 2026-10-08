
const { body } = require("express-validator");
const { ROLES_LIST } = require("../constants/roles");

const registerValidation = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("phone")
        .optional({ nullable: true })
        .isString(),

    // Public registration creates Carrier Dispatcher accounts only. Reject any
    // attempt to self-assign a role (Admin / Logistics Director / Hub Operator)
    // by submitting one in the request body.
    body().custom((value, { req }) => {
        const requestBody = req.body || {};
        const invalidFields = Object.keys(requestBody).filter(
            (field) => !["fullName", "email", "password", "phone"].includes(field)
        );
        if (invalidFields.length) {
            throw new Error(`Unsupported registration fields: ${invalidFields.join(", ")}`);
        }
        return true;
    }),
];
const loginValidation = [
    body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileValidation = [
    body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
    body("phone").optional({ nullable: true }).isString(),
    body("profileImage").optional({ nullable: true }).isString(),
];

const changePasswordValidation = [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
];

module.exports = { registerValidation, loginValidation, updateProfileValidation, changePasswordValidation };