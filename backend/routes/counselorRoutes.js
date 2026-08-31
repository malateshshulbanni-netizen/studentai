const express = require('express');
const router = express.Router();
const counselingController = require('../controllers/counselingController');
const { authMiddleware, facultyOrInstitutionAdmin } = require('../middleware/auth');

// ==================== COUNSELING SESSIONS ====================

// Get all counseling sessions
router.get('/sessions', authMiddleware, facultyOrInstitutionAdmin, counselingController.getSessions);

// Get counseling sessions for a specific student
router.get('/sessions/student/:studentId', authMiddleware, facultyOrInstitutionAdmin, counselingController.getStudentSessions);

// Get a single counseling session
router.get('/sessions/:sessionId', authMiddleware, facultyOrInstitutionAdmin, counselingController.getSessionById);

// Create a new counseling session
router.post('/sessions', authMiddleware, facultyOrInstitutionAdmin, counselingController.createSession);

// Update a counseling session
router.put('/sessions/:sessionId', authMiddleware, facultyOrInstitutionAdmin, counselingController.updateSession);

// Delete a counseling session
router.delete('/sessions/:sessionId', authMiddleware, facultyOrInstitutionAdmin, counselingController.deleteSession);

// ==================== FACULTY ASSIGNMENT ====================

// Assign faculty to student (direct assignment)
router.post('/assign-faculty', authMiddleware, facultyOrInstitutionAdmin, counselingController.assignFacultyToStudent);

// ==================== STATISTICS ====================

// Get counseling statistics
router.get('/statistics', authMiddleware, facultyOrInstitutionAdmin, counselingController.getStatistics);

// Get student risk distribution
router.get('/risk-distribution', authMiddleware, facultyOrInstitutionAdmin, counselingController.getRiskDistribution);

// Get faculty assignment statistics
router.get('/faculty-assignment-stats', authMiddleware, facultyOrInstitutionAdmin, counselingController.getFacultyAssignmentStats);

module.exports = router;