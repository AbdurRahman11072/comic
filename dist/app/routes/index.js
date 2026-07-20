"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootRoutes = void 0;
const express_1 = require("express");
// Import routes from modules here
const series_routes_1 = require("../modules/series/series.routes");
const chapter_routes_1 = require("../modules/chapter/chapter.routes");
const stats_routes_1 = require("../modules/stats/stats.routes");
const upload_routes_1 = require("../modules/upload/upload.routes");
const user_routes_1 = require("../modules/user/user.routes");
const points_routes_1 = require("../modules/points/points.routes");
const siteConfig_routes_1 = require("../modules/siteConfig/siteConfig.routes");
const payment_routes_1 = require("../modules/payment/payment.routes");
const creator_route_1 = require("../modules/creator/creator.route");
const ad_route_1 = require("../modules/ad/ad.route");
const withdrawal_route_1 = require("../modules/withdrawal/withdrawal.route");
const moderator_route_1 = require("../modules/moderator/moderator.route");
const community_route_1 = require("../modules/community/community.route");
const achievement_routes_1 = require("../modules/achievement/achievement.routes");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/series',
        route: series_routes_1.SeriesRoutes,
    },
    {
        path: '/chapters',
        route: chapter_routes_1.ChapterRoutes,
    },
    {
        path: '/admin/stats',
        route: stats_routes_1.StatsRoutes,
    },
    {
        path: '/upload',
        route: upload_routes_1.UploadRoutes,
    },
    {
        path: '/user',
        route: user_routes_1.UserRoutes,
    },
    {
        path: '/points',
        route: points_routes_1.PointsRoutes,
    },
    {
        path: '/site-config',
        route: siteConfig_routes_1.SiteConfigRoutes,
    },
    {
        path: '/payments',
        route: payment_routes_1.PaymentRoutes,
    },
    {
        path: '/creators',
        route: creator_route_1.CreatorRoutes,
    },
    {
        path: '/ads',
        route: ad_route_1.AdRoutes,
    },
    {
        path: '/withdrawals',
        route: withdrawal_route_1.WithdrawalRoutes,
    },
    {
        path: '/moderator',
        route: moderator_route_1.ModeratorRoutes,
    },
    {
        path: '/community',
        route: community_route_1.CommunityRoutes,
    },
    {
        path: '/achievements',
        route: achievement_routes_1.AchievementRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.RootRoutes = router;
