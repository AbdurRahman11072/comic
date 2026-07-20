"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdRoutes = void 0;
const express_1 = __importDefault(require("express"));
const ad_controller_1 = require("./ad.controller");
const authMiddleware_1 = __importDefault(require("../../middleware/authMiddleware"));
const router = express_1.default.Router();
const modOrAdmin = (0, authMiddleware_1.default)(['moderator', 'admin']);
// User-facing
router.post('/earn', (0, authMiddleware_1.default)(['user', 'creator', 'moderator', 'admin']), ad_controller_1.AdController.earnAdPoints);
router.get('/active', ad_controller_1.AdController.getActiveCustomAd);
// Admin/Moderator management
router.get('/', modOrAdmin, ad_controller_1.AdController.getCustomAds);
router.post('/', modOrAdmin, ad_controller_1.AdController.createCustomAd);
router.put('/:id', modOrAdmin, ad_controller_1.AdController.updateCustomAd);
router.delete('/:id', modOrAdmin, ad_controller_1.AdController.deleteCustomAd);
exports.AdRoutes = router;
