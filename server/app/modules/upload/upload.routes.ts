import { Router } from 'express';
import { UploadController } from './upload.controller';
import { multerUpload } from '../../middleware/multer';

const router = Router();

router.post('/', multerUpload.single('image'), UploadController.uploadImage);

export const UploadRoutes = router;
