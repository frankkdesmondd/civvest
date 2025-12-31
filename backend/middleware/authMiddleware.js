// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    console.log('[Auth] Token check:', {
      hasCookie: !!req.cookies.token,
      hasHeader: !!req.headers.authorization,
      path: req.path,
      method: req.method
    });

    if (!token) {
      console.log('[Auth] No token found');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[Auth] Token decoded:', { userId: decoded.userId, role: decoded.role });

    // Get user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      console.log('[Auth] User not found for token');
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request object with BOTH id and userId for compatibility
    req.user = {
      id: user.id,           // Used by most routes
      userId: user.id,       // Used by some legacy routes
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    console.log('[Auth] User authenticated:', { userId: user.id, role: user.role });
    next();
  } catch (error) {
    console.error('[Auth] Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export const isAdmin = (req, res, next) => {
  console.log('[Admin Check] Checking admin access:', { 
    userId: req.user?.id, 
    role: req.user?.role 
  });
  
  if (!req.user) {
    console.log('[Admin Check] No user in request');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'ADMIN') {
    console.log('[Admin Check] User is not admin:', req.user.role);
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  console.log('[Admin Check] Admin access granted');
  next();
};
