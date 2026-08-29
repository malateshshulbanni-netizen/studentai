const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Auth Middleware - User role:', req.user?.role);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.',
    });
  }
};

const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin only.',
    });
  }
  next();
};

// Institution Admin Only Middleware
const institutionAdminOnly = (req, res, next) => {
  console.log('InstitutionAdminOnly - User role:', req.user?.role);
  if (req.user?.role !== 'INSTITUTION_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Institution Admin only. Your role: ' + req.user?.role,
    });
  }
  next();
};

// Faculty Only Middleware
const facultyOnly = (req, res, next) => {
  console.log('FacultyOnly - User role:', req.user?.role);
  if (req.user?.role !== 'FACULTY') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Faculty only. Your role: ' + req.user?.role,
    });
  }
  next();
};

// Student Only Middleware
const studentOnly = (req, res, next) => {
  if (req.user?.role !== 'STUDENT') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student only.',
    });
  }
  next();
};

// Add these middleware functions at the end of your auth.js file

// Faculty or Institution Admin Middleware
const facultyOrInstitutionAdmin = (req, res, next) => {
  console.log('FacultyOrInstitutionAdmin - User role:', req.user?.role);
  if (req.user?.role === 'FACULTY' || req.user?.role === 'INSTITUTION_ADMIN') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Faculty or Institution Admin only. Your role: ' + req.user?.role,
    });
  }
};

// Admin or Super Admin Middleware
const adminOrSuperAdmin = (req, res, next) => {
  console.log('AdminOrSuperAdmin - User role:', req.user?.role);
  if (req.user?.role === 'INSTITUTION_ADMIN' || req.user?.role === 'SUPER_ADMIN') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Institution Admin or Super Admin only. Your role: ' + req.user?.role,
    });
  }
};

// Export all middleware
module.exports = { 
  authMiddleware, 
  superAdminOnly, 
  institutionAdminOnly,
  facultyOnly,
  studentOnly,
  facultyOrInstitutionAdmin,
  adminOrSuperAdmin
};