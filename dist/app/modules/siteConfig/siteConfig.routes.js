"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteConfigRoutes = void 0;
const express_1 = require("express");
const siteConfig_controller_1 = require("./siteConfig.controller");
const router = (0, express_1.Router)();
router.get('/', siteConfig_controller_1.SiteConfigController.getConfig);
router.put('/', siteConfig_controller_1.SiteConfigController.updateConfig); // Add auth middleware later
exports.SiteConfigRoutes = router;
