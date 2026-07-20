"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsRoutes = void 0;
const express_1 = require("express");
const stats_controller_1 = require("./stats.controller");
const router = (0, express_1.Router)();
router.get('/', stats_controller_1.StatsController.getAdminStats); // Add admin auth middleware later
exports.StatsRoutes = router;
