import { Router } from 'express';
// Import routes from modules here
import { SeriesRoutes } from '../modules/series/series.routes';
import { ChapterRoutes } from '../modules/chapter/chapter.routes';
import { StatsRoutes } from '../modules/stats/stats.routes';
import { UploadRoutes } from '../modules/upload/upload.routes';
import { UserRoutes } from '../modules/user/user.routes';
import { PointsRoutes } from '../modules/points/points.routes';
import { SiteConfigRoutes } from '../modules/siteConfig/siteConfig.routes';
import { PaymentRoutes } from '../modules/payment/payment.routes';
import { CreatorRoutes } from '../modules/creator/creator.route';
import { AdRoutes } from '../modules/ad/ad.route';
import { WithdrawalRoutes } from '../modules/withdrawal/withdrawal.route';
import { ModeratorRoutes } from '../modules/moderator/moderator.route';
import { CommunityRoutes } from '../modules/community/community.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/series',
    route: SeriesRoutes,
  },
  {
    path: '/chapters',
    route: ChapterRoutes,
  },
  {
    path: '/admin/stats',
    route: StatsRoutes,
  },
  {
    path: '/upload',
    route: UploadRoutes,
  },
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/points',
    route: PointsRoutes,
  },
  {
    path: '/site-config',
    route: SiteConfigRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
  {
    path: '/creators',
    route: CreatorRoutes,
  },
  {
    path: '/ads',
    route: AdRoutes,
  },
  {
    path: '/withdrawals',
    route: WithdrawalRoutes,
  },
  {
    path: '/moderator',
    route: ModeratorRoutes,
  },
  {
    path: '/community',
    route: CommunityRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export const RootRoutes = router;
