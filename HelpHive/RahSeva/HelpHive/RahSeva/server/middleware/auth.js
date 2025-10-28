import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
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

export default auth;
