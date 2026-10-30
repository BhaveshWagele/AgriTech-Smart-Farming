import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'agritech_smart_farming_jwt_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: 'Farmer' | 'Admin' | 'Agricultural Expert';
    name: string;
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is missing. Please log in.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: any };
    const user = db.users.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User session not found or expired. Please log in again.'
      });
    }

    req.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
}

export function authorizeRoles(...roles: Array<'Farmer' | 'Admin' | 'Agricultural Expert'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of [${roles.join(', ')}] role privileges.`
      });
    }

    next();
  };
}
