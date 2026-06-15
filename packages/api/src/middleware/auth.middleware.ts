import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
    user?: {
        uid: string;
        email?: string;
        role?: string;
    };
}

/**
 * Middleware to verify Firebase ID token
 */
export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError(401, 'Unauthorized - No token provided');
        }

        const idToken = authHeader.split('Bearer ')[1];

        // Verify Firebase ID token
        const decodedToken = await auth.verifyIdToken(idToken);

        // Attach user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role as string | undefined,
        };

        next();
    } catch (error: any) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(401, 'Unauthorized - Invalid token'));
        }
    }
};

/**
 * Middleware to check user role
 */
export const roleMiddleware = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError(401, 'Unauthorized'));
        }

        if (!req.user.role || !allowedRoles.includes(req.user.role)) {
            return next(new AppError(403, 'Forbidden - Insufficient permissions'));
        }

        next();
    };
};
