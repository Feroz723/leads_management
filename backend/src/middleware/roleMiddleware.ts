import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { user } = req as AuthenticatedRequest;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};

export default roleMiddleware;
