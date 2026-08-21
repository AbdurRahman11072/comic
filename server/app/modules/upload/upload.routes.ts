import { Router } from 'express';
import { UploadController } from './upload.controller';
import { multerUpload } from '../../middleware/multer';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();

router.get('/proxy-image', UploadController.proxyImage);

router.post(
  '/',
  authMiddleware(['user', 'creator', 'moderator', 'admin']),
  multerUpload.single('image'),
  UploadController.uploadImage
);

export const UploadRoutes = router;
