/**
 * Auth Middleware Adapter
 * 
 * Ensures the auth middleware works with and without MongoDB connection
 */

import jwt from 'jsonwebtoken';

const authAdapter = (req, res, next) => {
  // Get token from header (support both formats)
  let token = req.header('x-auth-token') || req.header('Authorization');
  
  // If Authorization header exists, extract token from Bearer format
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      msg: 'No token provided, authorization denied',
      success: false 
    });
  }

  // Verify token
  try {
    // Use either the configured JWT_SECRET or a fallback for development
    const jwtSecret = process.env.JWT_SECRET || 'mock-jwt-secret';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Add user info to request
    req.user = decoded.user;
    
    // For mock data mode, verify user exists in mock storage
    if (!req.isMongoConnected) {
      req.mockDataStore.findById('users', req.user.id)
        .then(user => {
          if (!user) {
            return res.status(401).json({ 
              msg: 'User not found, token invalid',
              success: false 
            });
          }
          
          // User exists in mock data, proceed
          next();
        })
        .catch(err => {
          console.error('Mock storage error:', err);
          return res.status(500).json({ 
            msg: 'Server error during authentication',
            success: false 
          });
        });
    } else {
      // MongoDB connected, proceed normally
      next();
    }
  } catch (err) {
    console.error('Token verification error:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        msg: 'Token has expired, please login again',
        success: false 
      });
    }
    
    return res.status(401).json({ 
      msg: 'Token is not valid',
      success: false 
    });
  }
};

export default authAdapter;
