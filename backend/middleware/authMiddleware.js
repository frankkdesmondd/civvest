import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  try {
    console.log('🔐 Auth middleware called for:', req.path);
    
    // Log all headers for debugging
    console.log('📋 Request headers:', {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      cookie: req.headers.cookie ? 'Present' : 'Missing'
    });

    // PRIORITY: Check Authorization header first (more reliable for cross-origin)
    let token = null;
    
    // 1. Try Authorization header first
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.replace('Bearer ', '');
      console.log('📎 Token from Authorization header');
    }
    
    // 2. Fall back to cookies if no header
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('🍪 Token from cookie');
    }
    
    console.log('🔍 Token status:', token ? 'Found' : 'Not found');

    if (!token) {
      console.log('❌ No token found in request');
      return res.status(401).json({ 
        success: false,
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
    console.error('Error details:', error);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ JWT Error - Invalid token format or signature');
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token',
        message: 'The provided token is invalid. Please sign in again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.log('❌ JWT Error - Token expired');
      return res.status(401).json({ 
        success: false,
        error: 'Token expired',
        message: 'Your session has expired. Please sign in again.'
      });
    }
    
    console.error('❌ Unexpected authentication error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    console.log('❌ Admin access denied for user:', req.user?.email);
    return res.status(403).json({ 
      success: false,
      error: 'Admin access required',
      message: 'You do not have permission to access this resource'
    });
  }
  
  console.log('✅ Admin access granted for:', req.user.email);
  next();
};
