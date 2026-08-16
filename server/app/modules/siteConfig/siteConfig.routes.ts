import { Router } from 'express';
import { SiteConfigController } from './siteConfig.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();

router.get('/', SiteConfigController.getConfig);
router.put('/', authMiddleware(['admin']), SiteConfigController.updateConfig);

export const SiteConfigRoutes = router;
