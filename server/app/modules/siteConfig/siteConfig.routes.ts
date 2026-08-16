import { Router } from 'express';
import { SiteConfigController } from './siteConfig.controller';
import authMiddleware from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/validateRequest';
import { updateSiteConfigSchema } from './siteConfig.validation';

const router = Router();

router.get('/', SiteConfigController.getConfig);
router.put(
  '/',
  authMiddleware(['admin']),
  validateRequest(updateSiteConfigSchema),
  SiteConfigController.updateConfig
);

export const SiteConfigRoutes = router;
