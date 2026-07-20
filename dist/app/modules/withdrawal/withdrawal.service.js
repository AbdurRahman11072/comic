"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalService = void 0;
const prisma_1 = require("../../../lib/prisma");
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const requestWithdrawal = async (userId, payload) => {
    const { pointsRequested, bankDetails } = payload;
    if (!pointsRequested || pointsRequested <= 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid points amount');
    }
    if (!bankDetails) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Bank details are required');
    }
    return await prisma_1.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        if (user.transactionsFrozen) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Your transactions are currently frozen. Please contact support.');
        }
        if (user.points < pointsRequested) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Insufficient points balance');
        }
        const config = await tx.siteConfig.findUnique({
            where: { id: 'global' }
        });
        const rate = config?.pointToFiatRate || 0.01;
        const fiatAmount = pointsRequested * rate;
        // Deduct points immediately to prevent double spending
        await tx.user.update({
            where: { id: userId },
            data: { points: { decrement: pointsRequested } }
        });
        // Create withdrawal log
        await tx.pointTransaction.create({
            data: {
                userId,
                type: 'WITHDRAWAL',
                amount: -pointsRequested,
                description: `Requested withdrawal of ${pointsRequested} points for $${fiatAmount}`,
            }
        });
        const request = await tx.withdrawalRequest.create({
            data: {
                userId,
                pointsRequested,
                fiatAmount,
                bankDetails,
                status: 'PENDING'
            }
        });
        return request;
    });
};
const getMyRequests = async (userId) => {
    return await prisma_1.prisma.withdrawalRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};
exports.WithdrawalService = {
    requestWithdrawal,
    getMyRequests,
};
