const express = require('express');
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  updateStudentPassword,
  toggleStudentStatus,
  getStudentsByInstitution,
  getStudentCountByInstitution,
  assignFaculty,
  getStudentsByFaculty,
  getFacultyInstitutionStudents
} = require('../controllers/studentController');
const { 
  authMiddleware, 
  institutionAdminOnly, 
  facultyOnly, 
  facultyOrInstitutionAdmin,
  studentOrInstitutionAdmin  // <-- ADDED THIS IMPORT
} = require('../middleware/auth');

// ==================== FACULTY & ADMIN ACCESS ROUTES ====================
// IMPORTANT: These routes MUST be defined BEFORE the institutionAdminOnly middleware
// Faculty can view their assigned students
router.get('/my-students', authMiddleware, facultyOnly, getStudentsByFaculty);

// Faculty AND Institution Admin can view all students in their institution
router.get('/faculty/institution-students', authMiddleware, facultyOrInstitutionAdmin, getFacultyInstitutionStudents);

// ==================== STUDENT SELF-ACCESS ROUTE ====================
// Student can view their own profile
// This must be defined BEFORE the institutionAdminOnly middleware
router.get('/:id', authMiddleware, studentOrInstitutionAdmin, getStudentById);

// ==================== INSTITUTION ADMIN ROUTES ====================
// All routes below require authentication and institution admin role
router.use(authMiddleware);
router.use(institutionAdminOnly);

// Student CRUD routes
router.post('/', createStudent);
router.get('/', getStudents);
// router.get('/:id', getStudentById);  // REMOVED - moved above for student access
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

// Student password management
router.put('/:id/password', updateStudentPassword);

// Toggle student status
router.patch('/:id/toggle-status', toggleStudentStatus);

// Assign faculty to student
router.put('/:id/assign-faculty', assignFaculty);

// Institution specific routes
router.get('/institution/:institutionId', getStudentsByInstitution);
router.get('/count/institution/:institutionId', getStudentCountByInstitution);

module.exports = router;