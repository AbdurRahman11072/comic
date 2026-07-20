"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const authMiddleware_1 = __importDefault(require("../../middleware/authMiddleware"));
const router = (0, express_1.Router)();
router.get('/profile', (0, authMiddleware_1.default)(['user', 'admin']), user_controller_1.UserController.getProfile);
router.put('/profile', (0, authMiddleware_1.default)(['user', 'admin']), user_controller_1.UserController.updateProfile);
router.post('/bookmarks/toggle', (0, authMiddleware_1.default)(['user', 'admin']), user_controller_1.UserController.toggleBookmark);
router.post('/history', (0, authMiddleware_1.default)(['user', 'admin']), user_controller_1.UserController.updateHistory);
// Admin routes
router.get('/', (0, authMiddleware_1.default)(['admin']), user_controller_1.UserController.getAllUsers);
router.put('/:id', (0, authMiddleware_1.default)(['admin']), user_controller_1.UserController.updateUser);
router.delete('/:id', (0, authMiddleware_1.default)(['admin']), user_controller_1.UserController.deleteUser);
router.get('/admin/transactions', (0, authMiddleware_1.default)(['admin']), user_controller_1.UserController.getAllTransactions);
exports.UserRoutes = router;
