// middleware/auth.js
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token found in cookies or headers');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Debug: Log the decoded token
    console.log('Decoded JWT:', decoded);
    
    // Your JWT contains "userId", not "id"
    const userId = decoded.userId; // This is what your token has
    
    if (!userId) {
      console.log('JWT token missing userId:', decoded);
      return res.status(401).json({ error: 'Token missing user information' });
    }
    
    // Set req.user with the correct field name
    req.user = {
      id: userId, // Map userId to id for consistency
      userId: userId, // Also keep as userId
      email: decoded.email,
      role: decoded.role
    };
    
    console.log('Authenticated user:', req.user);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
