import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate, authRateLimiter } from '../../middlewares';

const router = Router();

// Public routes
router.post('/login', authRateLimiter, authController.login.bind(authController));
router.post('/register', authRateLimiter, authController.register.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));

// Protected routes
router.post('/logout', authenticate, authController.logout.bind(authController));
router.post('/change-password', authenticate, authController.changePassword.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));

export const authRoutes = router;
