import { Router } from 'express';
import { KycController } from '../controllers/KycController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/verify', authMiddleware, KycController.verify);

export default router; 