const success = (res, { statusCode = 200, message = "Success", data = {} } = {}) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

const failure = (res, { statusCode = 400, message = "Something went wrong", errors = [] } = {}) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};

module.exports = { success, failure };