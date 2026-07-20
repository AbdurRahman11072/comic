"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError extends Error {
    statusCode;
    success;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = AppError;
