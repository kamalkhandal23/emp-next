import jwt from "jsonwebtoken";
import User from "../models/core/User.js";

/* -------------------------------------------------------------------------- */
/*  AUTHENTICATION MIDDLEWARE                                               */
/* -------------------------------------------------------------------------- */
export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Missing or invalid Authorization header.",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Token missing.",
      });
    }

    //  Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Session expired. Please log in again."
            : "Invalid or tampered token.",
      });
    }

    //  Handle hardcoded admin case
    if (decoded.id === "admin-id") {
      req.user = {
        _id: "admin-id",
        name: "Super Admin",
        role: "admin",
        email: process.env.ADMIN_EMAIL || "admin@example.com",
        status: "active",
        isActive: true,
      };
      return next();
    }

    //  Normal user from database
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    if (user.status !== "active" || user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive or suspended. Contact admin.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* ROLE-BASED AUTHORIZATION                                                */
/* -------------------------------------------------------------------------- */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in first.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(", ")}`,
      });
    }

    next();
  };
};

/* -------------------------------------------------------------------------- */
/*  PERMISSION CHECKER                                                      */
/* -------------------------------------------------------------------------- */
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in first.",
      });
    }

    if (
      typeof req.user.hasPermission !== "function" ||
      !req.user.hasPermission(permission)
    ) {
      return res.status(403).json({
        success: false,
        message: `Permission denied: ${permission}`,
      });
    }

    next();
  };
};

/* -------------------------------------------------------------------------- */
/* RESOURCE ACCESS VALIDATION                                              */
/* -------------------------------------------------------------------------- */
export const checkResourceAccess = (resourceField = "employee") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in first.",
      });
    }

    const { role, _id } = req.user;

    // Admins & HR always allowed
    if (["admin", "hr"].includes(role)) return next();

    // Team leads or managers (extendable)
    if (["manager", "team_lead"].includes(role)) return next();

    // Regular employee: only own data
    const resourceId =
      req.params.id || req.body[resourceField] || req.query[resourceField];

    if (resourceId && resourceId.toString() !== _id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own data.",
      });
    }

    next();
  };
};

/* -------------------------------------------------------------------------- */
/* OPTIONAL AUTH (Guest or Authenticated)                                 */
/* -------------------------------------------------------------------------- */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return next();

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.id === "admin-id") {
      req.user = {
        _id: "admin-id",
        name: "Super Admin",
        role: "admin",
        email: process.env.ADMIN_EMAIL || "admin@example.com",
        status: "active",
        isActive: true,
      };
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");
    if (user && (user.isActive || user.status === "active")) {
      req.user = user;
    }

    next();
  } catch {
    next(); // silently ignore invalid tokens
  }
};

/* -------------------------------------------------------------------------- */
/* SENSITIVE OPERATION CHECK                                               */
/* -------------------------------------------------------------------------- */
export const sensitiveOperation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required for this operation.",
    });
  }

  next();
};

/* -------------------------------------------------------------------------- */
/* EXPORTS                                                                 */
/* -------------------------------------------------------------------------- */
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
