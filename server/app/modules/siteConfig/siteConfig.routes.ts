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

// Contact messages
router.post('/contact', SiteConfigController.submitContact);
router.get('/contact-messages', authMiddleware(['admin', 'moderator']), SiteConfigController.getContactMessages);
router.patch('/contact-messages/:id/read', authMiddleware(['admin', 'moderator']), SiteConfigController.markMessageRead);

export const SiteConfigRoutes = router;
