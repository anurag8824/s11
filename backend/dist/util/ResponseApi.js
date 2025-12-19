"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = exports.error = exports.success = void 0;
const success = (data, message = '', statusCode = 200) => {
    return {
        message,
        error: false,
        code: statusCode,
        data,
    };
};
exports.success = success;
const error = (message, data = {}, statusCode) => {
    // List of common HTTP request code
    const codes = [200, 201, 400, 401, 404, 403, 422, 500];
    // Get matched code
    const findCode = codes.find((code) => code == statusCode);
    if (!findCode)
        statusCode = 500;
    else
        statusCode = findCode;
    return {
        message,
        code: statusCode,
        error: true,
        data: data,
    };
};
exports.error = error;
const validation = (errors) => {
    let singleError = '';
    if (errors && Object.values(errors).length > 0) {
        singleError = Object.values(errors)[0];
    }
    return {
        message: singleError,
        error: true,
        code: 422,
        errors,
        data: {},
    };
};
exports.validation = validation;
//# sourceMappingURL=ResponseApi.js.map