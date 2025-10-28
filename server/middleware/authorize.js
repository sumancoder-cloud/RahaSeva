const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ msg: 'No user role found, authorization denied' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      // User's role is not authorized
      return res.status(403).json({ msg: 'Access denied: You do not have the required role' });
    }

    // Authorization successful
    next();
  };
};

export default authorize;
