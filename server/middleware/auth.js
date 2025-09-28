import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT token
export const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.',
      });
    }

    if (!user.isActive && user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active.',
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.',
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

// Check if user has specific role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
};

// Check if user has specific permission
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.',
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permission}`,
      });
    }

    next();
  };
};

// Check if user can access resource (own data or has permission)
export const checkResourceAccess = (resourceField = 'employee') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.',
      });
    }

    // Admin and HR can access all resources
    if (['admin', 'hr'].includes(req.user.role)) {
      return next();
    }

    // Managers can access their team members' data
    if (req.user.role === 'manager') {
      // This would need additional logic to check if the resource belongs to their team
      return next();
    }

    // Team leads can access their team members' data
    if (req.user.role === 'team_lead') {
      // This would need additional logic to check if the resource belongs to their team
      return next();
    }

    // Employees can only access their own data
    const resourceId =
      req.params.id || req.body[resourceField] || req.query[resourceField];

    if (resourceId && resourceId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own data.',
      });
    }

    next();
  };
};

// Optional authentication (for public endpoints that can benefit from user context)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next(); // Continue without authentication
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');

    if (user && (user.isActive || user.status === 'active')) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Rate limiting for sensitive operations
export const sensitiveOperation = (req, res, next) => {
  // This could implement additional security measures for sensitive operations
  // like password changes, role updates, etc.

  // For now, just ensure the user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication required for sensitive operations.',
    });
  }

  next();
};

// Alias for backward compatibility
export const authenticate = auth;

export default {
  auth,
  authenticate,
  authorize,
  checkPermission,
  checkResourceAccess,
  optionalAuth,
  sensitiveOperation,
};