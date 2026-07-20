"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const next_1 = __importDefault(require("next"));
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./lib/prisma");
const envConfig_1 = require("./app/config/envConfig");
const notFound_1 = __importDefault(require("./app/middleware/notFound"));
const dev = process.env.NODE_ENV !== 'production';
const nextApp = (0, next_1.default)({ dev });
const handle = nextApp.getRequestHandler();
const port = envConfig_1.envConfig.PORT || 5000;
nextApp.prepare().then(async () => {
    try {
        await prisma_1.prisma.$connect();
        console.log('Database connection successful');
        // Route non-API requests to Next.js
        app_1.default.use((req, res, nextMiddleware) => {
            if (req.path.startsWith('/api')) {
                return nextMiddleware();
            }
            return handle(req, res);
        });
        // Unmatched API requests fall through to the notFound handler
        app_1.default.use(notFound_1.default);
        app_1.default.listen(port, () => {
            console.log(`> Server is running on: http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error('Error starting server:', error);
        await prisma_1.prisma.$disconnect();
        process.exit(1);
    }
}).catch((err) => {
    console.error('Error preparing Next.js:', err);
    process.exit(1);
});
