
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