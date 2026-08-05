const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const error = new Error("Validation failed");
        error.statusCode = 422;
        error.errors = result.array().map((e) => e.msg);
        return next(error);
    }
    next();
};

module.exports = validateRequest;