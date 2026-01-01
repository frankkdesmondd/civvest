import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      
      // Make sure user object has id property
      if (!user.id) {
        return res.status(403).json({ error: 'Invalid token payload' });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
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

