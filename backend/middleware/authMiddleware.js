import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  try {
    // PRIORITY: Check Authorization header first (more reliable for cross-origin)
    let token = null;
    
    // 1. Try Authorization header first
    if (req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    }
    
    // 2. Fall back to cookies if no header
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      console.log('❌ No token found in request');
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'No authentication token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('✅ Token verified for user:', decoded.email);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Your session has expired. Please sign in again.'
      });
    }
    
    res.status(500).json({ 
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    console.log('❌ Admin access denied for user:', req.user?.email);
    return res.status(403).json({ 
      error: 'Admin access required',
      message: 'You do not have permission to access this resource'
    });
  }
  
  console.log('✅ Admin access granted for:', req.user.email);
  next();
};
