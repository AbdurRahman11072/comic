import { Router } from 'express';
import { AuditController } from './audit.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware(['admin']), AuditController.getAuditLogs);

export const AuditRoutes = router;
