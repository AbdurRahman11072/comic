"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = void 0;
const http_status_1 = __importDefault(require("http-status"));
const auth_1 = require("../../lib/auth");
const AppError_1 = __importDefault(require("../error/AppError"));
const authMiddleware = (roles) => {
    return async (req, res, next) => {
        try {
            const session = await auth_1.auth.api.getSession({
                headers: req.headers,
            });
            if (!session) {
                throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Unauthorized. Please log in first');
            }
            req.user = {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                role: session.user.role,
            };
            if (roles.length > 0 && !roles.includes(session.user.role)) {
                throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Unauthorized access');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const session = await auth_1.auth.api.getSession({
            headers: req.headers,
        });
        if (session) {
            req.user = {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                role: session.user.role,
            };
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
exports.default = authMiddleware;
