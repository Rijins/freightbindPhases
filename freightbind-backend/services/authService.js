


const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { ROLES } = require("../constants/roles");

const registerUser = async ({ fullName, email, password, phone }) => {
    const existing = await User.findOne({ email });
    if (existing) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
    }
    const user = await User.create({
        fullName,
        email,
        password,
        role: ROLES.CARRIER_DISPATCHER,
        phone,
    });
    const token = generateToken(user);
    return { user, token };
};

const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }
    if (user.status !== "active") {
        const error = new Error("Account is not active");
        error.statusCode = 403;
        throw error;
    }
    const token = generateToken(user);
    return { user, token };
};

const updateUserProfile = async (userId, updates) => {
    const allowed = ["fullName", "phone", "profileImage"];
    const payload = {};
    allowed.forEach((key) => { if (updates[key] !== undefined) payload[key] = updates[key]; });

    const user = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return user;
};

const changeUserPassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select("+password");
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        const error = new Error("Current password is incorrect");
        error.statusCode = 401;
        throw error;
    }
    user.password = newPassword;
    await user.save();
    return user;
};

module.exports = { registerUser, loginUser, updateUserProfile, changeUserPassword };
