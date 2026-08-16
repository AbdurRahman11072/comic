import { Router } from 'express';
import { BackupController } from './backup.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();

router.get('/stats', authMiddleware(['admin']), BackupController.getDatabaseStats);
router.get('/export', authMiddleware(['admin']), BackupController.exportDatabaseDump);

export const BackupRoutes = router;
