import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface TokenPayload {
  userId: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET is not defined' });
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload & TokenPayload;

    if (!decoded.userId || !decoded.role) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    (req as AuthenticatedRequest).user = {
      id: String(decoded.userId),
      role: String(decoded.role),
    };
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;
