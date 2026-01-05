import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { loginSchema, registerSchema, refreshTokenSchema, changePasswordSchema } from './auth.validation';
import { sendSuccess, sendError } from '../../utils/helpers';

export class AuthController {
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = loginSchema.parse(req.body);
            const result = await authService.login(validatedData);
            sendSuccess(res, result, 'Login successful');
        } catch (error: any) {
            if (error.message === 'Invalid email or password' ||
                error.message === 'Account is deactivated. Please contact admin.') {
                sendError(res, error.message, 401);
            } else {
                next(error);
            }
        }
    }

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = registerSchema.parse(req.body);
            const result = await authService.register(validatedData);
            sendSuccess(res, result, 'Registration successful', 201);
        } catch (error: any) {
            if (error.message === 'Email already registered') {
                sendError(res, error.message, 409);
            } else {
                next(error);
            }
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = refreshTokenSchema.parse(req.body);
            const tokens = await authService.refreshTokens(refreshToken);
            sendSuccess(res, tokens, 'Tokens refreshed successfully');
        } catch (error: any) {
            if (error.message.includes('refresh token')) {
                sendError(res, error.message, 401);
            } else {
                next(error);
            }
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                sendError(res, 'Authentication required', 401);
                return;
            }
            await authService.logout(req.user._id);
            sendSuccess(res, null, 'Logout successful');
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                sendError(res, 'Authentication required', 401);
                return;
            }
            const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
            await authService.changePassword(req.user._id, currentPassword, newPassword);
            sendSuccess(res, null, 'Password changed successfully');
        } catch (error: any) {
            if (error.message === 'Current password is incorrect') {
                sendError(res, error.message, 400);
            } else {
                next(error);
            }
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                sendError(res, 'Authentication required', 401);
                return;
            }
            const profile = await authService.getProfile(req.user._id);
            sendSuccess(res, profile, 'Profile retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
