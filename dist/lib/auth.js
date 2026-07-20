"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const better_auth_1 = require("better-auth");
const prisma_1 = require("better-auth/adapters/prisma");
const plugins_1 = require("better-auth/plugins");
const prisma_2 = require("./prisma");
const envConfig_1 = require("../app/config/envConfig");
exports.auth = (0, better_auth_1.betterAuth)({
    baseURL: envConfig_1.envConfig.BACKEND_URL,
    trustedOrigins: [envConfig_1.envConfig.FRONTEND_URL],
    database: (0, prisma_1.prismaAdapter)(prisma_2.prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [(0, plugins_1.admin)()],
});
