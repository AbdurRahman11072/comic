"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsRoutes = void 0;
const express_1 = require("express");
const points_controller_1 = require("./points.controller");
const authMiddleware_1 = __importDefault(require("../../middleware/authMiddleware"));
const router = (0, express_1.Router)();
// All points routes require authentication
router.get('/balance', (0, authMiddleware_1.default)(['user', 'admin']), points_controller_1.PointsController.getBalance);
router.get('/transactions', (0, authMiddleware_1.default)(['user', 'admin']), points_controller_1.PointsController.getTransactions);
router.post('/earn-ad', (0, authMiddleware_1.default)(['user', 'admin']), points_controller_1.PointsController.earnFromAd);
router.post('/buy-chapter', (0, authMiddleware_1.default)(['user', 'admin']), points_controller_1.PointsController.buyChapter);
exports.PointsRoutes = router;
