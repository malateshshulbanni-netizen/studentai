const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Institution = require('../models/Institution');
const Faculty = require('../models/Faculty');

// @desc    Login institution admin
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log('🔑 Login attempt:', { email, role });

    // Super Admin Login
    if (role === 'SUPER_ADMIN') {
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
      const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

      if (email === superAdminEmail && password === superAdminPassword) {
        const token = jwt.sign(
          { email, role: 'SUPER_ADMIN' },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          success: true,
          token,
          user: {
            email,
            role: 'SUPER_ADMIN',
            name: 'Super Admin',
            active: true,
          },
        });
      }
    }

    // Institution Admin Login
    if (role === 'INSTITUTION_ADMIN') {
      const institution = await Institution.findOne({ email }).select('+password');

      if (!institution) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check if institution is active
      if (!institution.active) {
        return res.status(401).json({
          success: false,
          message: 'Your account is not activated yet. Please contact Super Admin.',
        });
      }

      const isMatch = await institution.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      const token = jwt.sign(
        { 
          id: institution._id, 
          email: institution.email, 
          role: 'INSTITUTION_ADMIN',
          institutionId: institution._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const institutionData = institution.toObject();
      delete institutionData.password;

      return res.json({
        success: true,
        token,
        user: {
          ...institutionData,
          role: 'INSTITUTION_ADMIN',
          name: institution.name,
          institutionId: institution._id,
        },
      });
    }

    // ==================== FACULTY LOGIN ====================
    if (role === 'FACULTY') {
      const faculty = await Faculty.findOne({ email }).select('+password');

      if (!faculty) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check if faculty is active
      if (!faculty.active) {
        return res.status(401).json({
          success: false,
          message: 'Your account is not activated yet. Please contact Admin.',
        });
      }

      const isMatch = await faculty.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      const token = jwt.sign(
        { 
          id: faculty._id, 
          email: faculty.email, 
          role: 'FACULTY',
          institutionId: faculty.institutionId,
          facultyId: faculty._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const facultyData = faculty.toObject();
      delete facultyData.password;

      return res.json({
        success: true,
        token,
        user: {
          ...facultyData,
          role: 'FACULTY',
          name: faculty.fullName,
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
      error: error.message,
    });
  }
});

// ==================== PUBLIC REGISTRATION ROUTE ====================
// @desc    Public registration (No token required)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, code, email, phone, address, password } = req.body;

    console.log('📝 Public registration attempt:', { name, code, email });

    // Validate required fields
    if (!name || !code || !email || !phone || !address || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
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

    // Create institution with active: false
    const institution = new Institution({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      password: password,
      active: false, // Requires Super Admin activation
    });

    await institution.save();

    console.log('✅ Institution registered successfully (awaiting activation)');

    const institutionData = institution.toObject();
    delete institutionData.password;

    res.status(201).json({
      success: true,
      message: 'Institution registered successfully. Please wait for Super Admin activation.',
      data: institutionData,
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

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
      message: 'Failed to register institution',
      error: error.message,
    });
  }
});

// @desc    Get current admin profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role === 'SUPER_ADMIN') {
      return res.json({
        success: true,
        user: {
          email: decoded.email,
          role: 'SUPER_ADMIN',
          name: 'Super Admin',
          active: true,
        },
      });
    }

    if (decoded.role === 'INSTITUTION_ADMIN') {
      const institution = await Institution.findById(decoded.id).select('-password');
      if (!institution) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found',
        });
      }
      return res.json({
        success: true,
        user: {
          ...institution.toObject(),
          role: 'INSTITUTION_ADMIN',
          institutionId: institution._id,
        },
      });
    }

    if (decoded.role === 'FACULTY') {
      const faculty = await Faculty.findById(decoded.id).select('-password');
      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found',
        });
      }
      return res.json({
        success: true,
        user: {
          ...faculty.toObject(),
          role: 'FACULTY',
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid role',
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const institution = await Institution.findOne({ email });
    
    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }
    
    institution.password = newPassword;
    await institution.save();
    
    res.json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
});

module.exports = router;