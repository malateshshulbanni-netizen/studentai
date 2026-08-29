const express = require('express');
const router = express.Router();
const {
  createInstitution,
  getInstitutions,
  getInstitutionById,
  updateInstitution,
  toggleInstitutionStatus,
  deleteInstitution,
  updatePassword,
} = require('../controllers/institutionController');
const { authMiddleware, superAdminOnly } = require('../middleware/auth');

// ==================== ALL ROUTES REQUIRE AUTHENTICATION ====================
// All routes require authentication and super admin role
router.use(authMiddleware);
router.use(superAdminOnly);

// CRUD routes (Protected - Super Admin only)
router.post('/', createInstitution);
router.get('/', getInstitutions);
router.get('/:id', getInstitutionById);
router.put('/:id', updateInstitution);
router.patch('/:id/toggle-status', toggleInstitutionStatus);
router.delete('/:id', deleteInstitution);
router.put('/:id/password', updatePassword);

module.exports = router;