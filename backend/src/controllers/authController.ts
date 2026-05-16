import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, user } = await AuthService.register(req.body);
    res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await AuthService.login(email, password);
    res.status(200).json({ token, user });
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response) => {
  // Clear client-side token (handled by client)
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest;
    if (!user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const profile = await User.findById(user.id).select('-password').exec();
    if (!profile) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.status(200).json({ user: profile });
  } catch (error) {
    next(error);
  }
};
