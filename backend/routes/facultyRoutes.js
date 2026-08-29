const express = require('express');
const router = express.Router();
const {
  createFaculty,
  getFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
} = require('../controllers/facultyController');
const { authMiddleware, institutionAdminOnly } = require('../middleware/auth');

// All routes require authentication and institution admin role
router.use(authMiddleware);
router.use(institutionAdminOnly);

// Faculty CRUD routes
router.post('/', createFaculty);
router.get('/', getFaculty);
router.get('/:id', getFacultyById);
router.put('/:id', updateFaculty);
router.delete('/:id', deleteFaculty);

module.exports = router;