"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const globalErrorHandler = (error, req, res, next) => {
    const isDev = process.env.NODE_ENV === 'development';
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Something went wrong';
    if (error.code === 'P2002') {
        statusCode = http_status_1.default.CONFLICT;
        message = 'Record already exists';
    }
    if (isDev) {
        console.error('API Error:', error);
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(isDev && {
            error: error,
            stackTrace: error.stack,
        }),
    });
};
exports.default = globalErrorHandler;
