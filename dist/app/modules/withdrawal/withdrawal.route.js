"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalRoutes = void 0;
const express_1 = __importDefault(require("express"));
const withdrawal_controller_1 = require("./withdrawal.controller");
const authMiddleware_1 = __importDefault(require("../../middleware/authMiddleware"));
const router = express_1.default.Router();
router.post('/', (0, authMiddleware_1.default)(['user', 'creator', 'moderator', 'admin']), withdrawal_controller_1.WithdrawalController.requestWithdrawal);
router.get('/my-requests', (0, authMiddleware_1.default)(['user', 'creator', 'moderator', 'admin']), withdrawal_controller_1.WithdrawalController.getMyRequests);
exports.WithdrawalRoutes = router;
