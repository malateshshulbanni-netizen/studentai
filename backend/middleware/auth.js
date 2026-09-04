const jwt = require('jsonwebtoken');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

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

// ============================================================
// NEW MIDDLEWARE - Student or Institution Admin
// ============================================================

// Student or Institution Admin Middleware
const studentOrInstitutionAdmin = (req, res, next) => {
  console.log('StudentOrInstitutionAdmin - User role:', req.user?.role);
  console.log('StudentOrInstitutionAdmin - User ID:', req.user?._id || req.user?.id);
  console.log('StudentOrInstitutionAdmin - Request params:', req.params);
  
  // Allow Institution Admins
  if (req.user?.role === 'INSTITUTION_ADMIN') {
    console.log('✅ Institution Admin access granted');
    return next();
  }
  
  // Allow Students to access their own data
  if (req.user?.role === 'STUDENT') {
    const studentId = req.params.id;
    const userId = req.user._id || req.user.id;
    
    if (studentId === userId || studentId === userId.toString()) {
      console.log('✅ Student accessing their own data');
      return next();
    }
    
    console.log('❌ Student trying to access another student\'s data');
    return res.status(403).json({
      success: false,
      message: 'Access denied. Students can only access their own data.'
    });
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied. Institution Admin or Student only. Your role: ' + req.user?.role,
  });
};

// ============================================================
// NEW MIDDLEWARE - Student or Faculty or Institution Admin
// ============================================================

// Student or Faculty or Institution Admin Middleware
const studentFacultyOrInstitutionAdmin = (req, res, next) => {
  console.log('StudentFacultyOrInstitutionAdmin - User role:', req.user?.role);
  console.log('StudentFacultyOrInstitutionAdmin - User ID:', req.user?._id || req.user?.id);
  console.log('StudentFacultyOrInstitutionAdmin - Request query:', req.query);
  console.log('StudentFacultyOrInstitutionAdmin - Request params:', req.params);
  
  // Allow Institution Admins
  if (req.user?.role === 'INSTITUTION_ADMIN') {
    console.log('✅ Institution Admin access granted');
    return next();
  }
  
  // Allow Faculty
  if (req.user?.role === 'FACULTY') {
    console.log('✅ Faculty access granted');
    return next();
  }
  
  // Allow Students to access their own data
  if (req.user?.role === 'STUDENT') {
    // Check if student is trying to access their own activities
    // For GET /api/student-activities?studentId=xxx
    const studentId = req.query.studentId || req.params.studentId || req.params.id;
    const userId = req.user._id || req.user.id;
    
    // If no studentId is provided, assume they want their own data
    if (!studentId) {
      console.log('✅ Student accessing their own data (no studentId param)');
      // Add studentId to query for the controller
      if (req.query) {
        req.query.studentId = userId;
      }
      return next();
    }
    
    if (studentId === userId || studentId === userId.toString()) {
      console.log('✅ Student accessing their own data');
      return next();
    }
    
    console.log('❌ Student trying to access another student\'s data');
    return res.status(403).json({
      success: false,
      message: 'Access denied. Students can only access their own data.'
    });
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied. Faculty, Institution Admin or Student only. Your role: ' + req.user?.role,
  });
};

// ============================================================
// NEW MIDDLEWARE FOR MEETINGS - Faculty or Student (for joining)
// ============================================================

// Faculty or Student Middleware (for meeting access)
const facultyOrStudent = (req, res, next) => {
  console.log('FacultyOrStudent - User role:', req.user?.role);
  console.log('FacultyOrStudent - User ID:', req.user?._id || req.user?.id);
  
  if (req.user?.role === 'FACULTY' || req.user?.role === 'STUDENT') {
    console.log('✅ Faculty or Student access granted');
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied. Faculty or Student only. Your role: ' + req.user?.role,
  });
};

// ============================================================
// EXPORT
// ============================================================

module.exports = { 
  authMiddleware, 
  superAdminOnly, 
  institutionAdminOnly,
  facultyOnly,
  studentOnly,
  facultyOrInstitutionAdmin,
  adminOrSuperAdmin,
  studentOrInstitutionAdmin,
  studentFacultyOrInstitutionAdmin,
  facultyOrStudent  // <-- Added for meetings
};