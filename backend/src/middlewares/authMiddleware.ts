import { Request, Response, NextFunction } from 'express';
import { verifyToken, generateToken } from '../utils/jwt';
import { prisma } from '../models/User';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
    iat?: number;
    exp?: number;
  };
}

interface DecodedToken {
  id: string;
  email: string;
  role?: string;
  iat: number;
  exp: number;
}

// ✅ Enhanced authentication with role-based access control
export const authenticate = (roles: string[] = []) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          message: 'Access denied. No token provided.',
          code: 'NO_TOKEN'
        });
      }

      const token = authHeader.split(' ')[1];

      // ✅ Verify token and check expiration
      const decoded = verifyToken(token) as DecodedToken;
      
      // ✅ Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        return res.status(401).json({ 
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }

      // ✅ Verify user still exists in database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user) {
        return res.status(401).json({ 
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // ✅ Check role-based access
      if (roles.length > 0) {
        const userRole = decoded.role || 'user';
        if (!roles.includes(userRole)) {
          return res.status(403).json({ 
            message: 'Access denied. Insufficient permissions.',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: roles,
            current: userRole
          });
        }
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'user'
      };

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
  };
};

// ✅ Refresh token middleware
export const refreshToken = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        message: 'Refresh token required',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    // ✅ Verify refresh token (implement refresh token logic)
    const decoded = verifyToken(refreshToken) as DecodedToken;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // ✅ Generate new access token
    const newToken = generateToken({
      id: user.id,
      email: user.email,
      role: 'user' // Default role, can be enhanced
    });

    res.json({
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({ 
      message: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
};

// ✅ Backward compatibility
export const protect = authenticate();