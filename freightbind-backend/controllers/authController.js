const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../helpers/apiResponse");
const authService = require("../services/authService");

const register = asyncHandler(async (req, res) => {
    const { fullName, email, password, phone } = req.body;

    const { user, token } = await authService.registerUser({
        fullName,
        email,
        password,
        phone,
    });
    return success(res, { statusCode: 201, message: "User registered successfully", data: { user, token } });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });
    return success(res, { statusCode: 200, message: "Login successful", data: { user, token } });
});

const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token");
    return success(res, { statusCode: 200, message: "Logout successful", data: {} });
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return success(res, { statusCode: 200, message: "Current user fetched successfully", data: { user: req.user } });
});

const updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateUserProfile(req.user._id, req.body);
    return success(res, { statusCode: 200, message: "Profile updated successfully", data: { user } });
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changeUserPassword(req.user._id, currentPassword, newPassword);
    return success(res, { statusCode: 200, message: "Password changed successfully", data: {} });
});

module.exports = { register, login, logout, getCurrentUser, updateProfile, changePassword };