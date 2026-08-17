import { Router } from 'express';
import { UserController } from './user.controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();

router.get('/profile', authMiddleware(['user', 'creator', 'moderator', 'admin']), UserController.getProfile);
router.put('/profile', authMiddleware(['user', 'creator', 'moderator', 'admin']), UserController.updateProfile);
router.post('/bookmarks/toggle', authMiddleware(['user', 'creator', 'moderator', 'admin']), UserController.toggleBookmark);
router.post('/history', authMiddleware(['user', 'creator', 'moderator', 'admin']), UserController.updateHistory);

// Admin routes
router.get('/', authMiddleware(['admin']), UserController.getAllUsers);
router.put('/:id', authMiddleware(['admin']), UserController.updateUser);
router.delete('/:id', authMiddleware(['admin']), UserController.deleteUser);
router.get('/admin/transactions', authMiddleware(['admin']), UserController.getAllTransactions);

export const UserRoutes = router;
