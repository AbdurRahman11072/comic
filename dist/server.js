"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = server;
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./lib/prisma");
const envConfig_1 = require("./app/config/envConfig");
const PORT = envConfig_1.envConfig.PORT || 5000;
async function server() {
    try {
        await prisma_1.prisma.$connect();
        console.log('Database connection successful');
        const httpServer = app_1.default.listen(PORT, () => {
            console.log(`server is running on : http://localhost:${PORT}/`);
        });
        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} received. Shutting down gracefully...`);
            httpServer.close(async () => {
                await prisma_1.prisma.$disconnect();
                console.log('Database connection closed.');
                process.exit(0);
            });
            setTimeout(() => {
                console.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        await prisma_1.prisma.$disconnect();
        console.log('Failed to establish connection with database');
        console.error(error);
        process.exit(1);
    }
}
server();
