const express = require('express');
const router = express.Router();
const {
  bulkCreateOrUpdateActivities,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  getSummary,
  getStudentTrend,
  getActivitiesByInstitution
} = require('../controllers/studentActivityController');
const { 
  authMiddleware, 
  facultyOnly,
  facultyOrInstitutionAdmin,
  adminOrSuperAdmin
} = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Student activities routes are working!',
    user: req.user ? { email: req.user.email, role: req.user.role } : 'No user'
  });
});

// Bulk operations - Faculty only
router.post('/bulk', facultyOnly, bulkCreateOrUpdateActivities);

// Summary and trend - Faculty or Institution Admin
router.get('/summary', facultyOrInstitutionAdmin, getSummary);
router.get('/trend/:studentId', facultyOrInstitutionAdmin, getStudentTrend);

// Institution specific - Faculty or Institution Admin
router.get('/institution/:institutionId', facultyOrInstitutionAdmin, getActivitiesByInstitution);

// CRUD operations
router
  .route('/')
  .get(facultyOrInstitutionAdmin, getActivities);

router
  .route('/:id')
  .get(facultyOrInstitutionAdmin, getActivityById)
  .put(facultyOrInstitutionAdmin, updateActivity)
  .delete(adminOrSuperAdmin, deleteActivity);

module.exports = router;