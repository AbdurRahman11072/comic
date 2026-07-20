import { Router } from 'express';
import { UserController } from './user.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();

router.get('/profile', authMiddleware(['user', 'admin']), UserController.getProfile);
router.put('/profile', authMiddleware(['user', 'admin']), UserController.updateProfile);
router.post('/bookmarks/toggle', authMiddleware(['user', 'admin']), UserController.toggleBookmark);
router.post('/history', authMiddleware(['user', 'admin']), UserController.updateHistory);

// Admin routes
router.get('/', authMiddleware(['admin']), UserController.getAllUsers);
router.put('/:id', authMiddleware(['admin']), UserController.updateUser);
router.delete('/:id', authMiddleware(['admin']), UserController.deleteUser);
router.get('/admin/transactions', authMiddleware(['admin']), UserController.getAllTransactions);

export const UserRoutes = router;
