import { Router } from 'express';
import * as authController from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';
import { validateLogin, validateRegister } from '../middleware/validationMiddleware';

const router = Router();

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.post('/logout', authController.logout);

export default router;
