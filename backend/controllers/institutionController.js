const Institution = require('../models/Institution');

// @desc    Create a new institution
// @route   POST /api/institutions
// @access  Private (Super Admin)
const createInstitution = async (req, res) => {
  try {
    const { name, code, email, phone, address, password } = req.body;

    console.log('📝 Creating institution with data:', { name, code, email, phone, address });

    // Validate required fields
    if (!name || !code || !email || !phone || !address || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Check if institution already exists
    const existingInstitution = await Institution.findOne({
      $or: [{ email: email.toLowerCase() }, { code: code.toUpperCase().trim() }],
    });

    if (existingInstitution) {
      return res.status(400).json({
        success: false,
        message: 'Institution with this email or code already exists',
      });
    }

    // Create institution
    const institution = new Institution({
      name,
      code: code.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      password,
      createdBy: req.user ? req.user.id : null,
    });

    console.log('💾 Saving institution...');

    // Save the institution
    await institution.save();

    console.log('✅ Institution saved successfully');

    // Remove password from response
    const institutionData = institution.toObject();
    delete institutionData.password;

    res.status(201).json({
      success: true,
      message: 'Institution registered successfully',
      data: institutionData,
    });
  } catch (error) {
    console.error('❌ Create institution error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create institution',
      error: error.message,
    });
  }
};

// @desc    Get all institutions
// @route   GET /api/institutions
// @access  Private (Super Admin)
const getInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: institutions.length,
      data: institutions,
    });
  } catch (error) {
    console.error('Get institutions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch institutions',
      error: error.message,
    });
  }
};

// @desc    Get single institution by ID
// @route   GET /api/institutions/:id
// @access  Private (Super Admin)
const getInstitutionById = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id).select('-password');

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    res.status(200).json({
      success: true,
      data: institution,
    });
  } catch (error) {
    console.error('Get institution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch institution',
      error: error.message,
    });
  }
};

// @desc    Update institution
// @route   PUT /api/institutions/:id
// @access  Private (Super Admin)
const updateInstitution = async (req, res) => {
  try {
    const { name, code, email, phone, address, active } = req.body;

    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    // Check if email or code already exists (excluding current institution)
    if (email || code) {
      const existing = await Institution.findOne({
        $or: [{ email: email?.toLowerCase().trim() }, { code: code?.toUpperCase().trim() }],
        _id: { $ne: req.params.id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email or code already in use by another institution',
        });
      }
    }

    // Update fields
    if (name) institution.name = name.trim();
    if (code) institution.code = code.toUpperCase().trim();
    if (email) institution.email = email.toLowerCase().trim();
    if (phone) institution.phone = phone.trim();
    if (address) institution.address = address.trim();
    if (active !== undefined) institution.active = active;

    await institution.save();

    const institutionData = institution.toObject();
    delete institutionData.password;

    res.status(200).json({
      success: true,
      message: 'Institution updated successfully',
      data: institutionData,
    });
  } catch (error) {
    console.error('Update institution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update institution',
      error: error.message,
    });
  }
};

// @desc    Toggle institution status (activate/deactivate)
// @route   PATCH /api/institutions/:id/toggle-status
// @access  Private (Super Admin)
const toggleInstitutionStatus = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    institution.active = !institution.active;
    await institution.save();

    const institutionData = institution.toObject();
    delete institutionData.password;

    res.status(200).json({
      success: true,
      message: `Institution ${institution.active ? 'activated' : 'deactivated'} successfully`,
      data: institutionData,
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle institution status',
      error: error.message,
    });
  }
};

// @desc    Delete institution
// @route   DELETE /api/institutions/:id
// @access  Private (Super Admin)
const deleteInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    await institution.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Institution deleted successfully',
    });
  } catch (error) {
    console.error('Delete institution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete institution',
      error: error.message,
    });
  }
};

// @desc    Update institution password
// @route   PUT /api/institutions/:id/password
// @access  Private (Super Admin)
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const institution = await Institution.findById(req.params.id).select('+password');

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    // Check current password
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is required',
      });
    }

    const isMatch = await institution.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    institution.password = newPassword;
    await institution.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message,
    });
  }
};

module.exports = {
  createInstitution,
  getInstitutions,
  getInstitutionById,
  updateInstitution,
  toggleInstitutionStatus,
  deleteInstitution,
  updatePassword,
};