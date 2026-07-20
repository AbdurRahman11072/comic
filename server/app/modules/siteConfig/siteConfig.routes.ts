import { Router } from 'express';
import { SiteConfigController } from './siteConfig.controller';

const router = Router();

router.get('/', SiteConfigController.getConfig);
router.put('/', SiteConfigController.updateConfig); // Add auth middleware later

export const SiteConfigRoutes = router;
