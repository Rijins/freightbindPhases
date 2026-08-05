const express = require("express");
const router = express.Router();

const { register, login, logout, getCurrentUser, updateProfile, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const { registerValidation, loginValidation, updateProfileValidation, changePasswordValidation } = require("../validations/authValidation");

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getCurrentUser);
router.put("/update-profile", protect, updateProfileValidation, validateRequest, updateProfile);
router.put("/change-password", protect, changePasswordValidation, validateRequest, changePassword);

module.exports = router;