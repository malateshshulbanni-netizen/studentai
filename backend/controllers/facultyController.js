const Faculty = require('../models/Faculty');
const Institution = require('../models/Institution');

// Helper function to generate employee ID
const generateEmployeeId = async (institutionId) => {
  const faculty = await Faculty.find({ institutionId });
  
  if (faculty.length === 0) {
    return '01';
  }
  
  const ids = faculty.map(f => parseInt(f.employeeId));
  const maxId = Math.max(...ids);
  const nextId = maxId + 1;
  
  return nextId.toString().padStart(2, '0');
};

// @desc    Create a new faculty
// @route   POST /api/faculty
// @access  Private (Institution Admin)
const createFaculty = async (req, res) => {
  try {
    const { 
      employeeId,
      fullName, 
      department, 
      designation, 
      qualification, 
      specialization, 
      mobile, 
      email, 
      dateOfJoining, 
      facultyType, 
      username, 
      password,
      institutionId 
    } = req.body;

    console.log('📝 Creating faculty:', { fullName, employeeId, email, department });

    if (!fullName || !department || !designation || !qualification || !specialization || 
        !mobile || !email || !dateOfJoining || !facultyType || !username || !password || !institutionId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const existingFaculty = await Faculty.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: 'Faculty with this email or username already exists',
      });
    }

    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    let finalEmployeeId = employeeId;
    if (!finalEmployeeId) {
      finalEmployeeId = await generateEmployeeId(institutionId);
    }

    const faculty = new Faculty({
      employeeId: finalEmployeeId,
      fullName: fullName.trim(),
      department: department.trim(),
      designation: designation.trim(),
      qualification: qualification.trim(),
      specialization: specialization.trim(),
      mobile: mobile.trim(),
      email: email.toLowerCase().trim(),
      dateOfJoining,
      facultyType,
      username: username.toLowerCase().trim(),
      password,
      institutionId,
      institutionName: institution.name,
      createdBy: req.user?.id || null,
    });

    await faculty.save();

    console.log('✅ Faculty created successfully:', faculty.email);

    res.status(201).json({
      success: true,
      message: 'Faculty registered successfully',
      data: faculty,
    });

  } catch (error) {
    console.error('❌ Create faculty error:', error);
    
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
      message: 'Failed to create faculty',
      error: error.message,
    });
  }
};

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Private (Institution Admin)
const getFaculty = async (req, res) => {
  try {
    let query = {};
    
    if (req.user?.institutionId) {
      query.institutionId = req.user.institutionId;
    }

    const faculty = await Faculty.find(query)
      .sort({ employeeId: 1 })
      .select('-password');

    res.status(200).json({
      success: true,
      count: faculty.length,
      data: faculty,
    });

  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty',
      error: error.message,
    });
  }
};

// @desc    Get single faculty by ID
// @route   GET /api/faculty/:id
// @access  Private (Institution Admin)
const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id).select('-password');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    if (req.user?.institutionId && faculty.institutionId.toString() !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Faculty does not belong to your institution.',
      });
    }

    res.status(200).json({
      success: true,
      data: faculty,
    });

  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty',
      error: error.message,
    });
  }
};

// @desc    Update faculty
// @route   PUT /api/faculty/:id
// @access  Private (Institution Admin)
const updateFaculty = async (req, res) => {
  try {
    const { 
      fullName, 
      department, 
      designation, 
      qualification, 
      specialization, 
      mobile, 
      email, 
      dateOfJoining, 
      facultyType, 
      username,
      active
    } = req.body;

    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    if (req.user?.institutionId && faculty.institutionId.toString() !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Faculty does not belong to your institution.',
      });
    }

    if (email || username) {
      const existing = await Faculty.findOne({
        $or: [{ email: email?.toLowerCase() }, { username: username?.toLowerCase() }],
        _id: { $ne: req.params.id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email or username already in use by another faculty',
        });
      }
    }

    if (fullName) faculty.fullName = fullName.trim();
    if (department) faculty.department = department.trim();
    if (designation) faculty.designation = designation.trim();
    if (qualification) faculty.qualification = qualification.trim();
    if (specialization) faculty.specialization = specialization.trim();
    if (mobile) faculty.mobile = mobile.trim();
    if (email) faculty.email = email.toLowerCase().trim();
    if (dateOfJoining) faculty.dateOfJoining = dateOfJoining;
    if (facultyType) faculty.facultyType = facultyType;
    if (username) faculty.username = username.toLowerCase().trim();
    if (active !== undefined) faculty.active = active;

    await faculty.save();

    const facultyData = faculty.toObject();
    delete facultyData.password;

    res.status(200).json({
      success: true,
      message: 'Faculty updated successfully',
      data: facultyData,
    });

  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update faculty',
      error: error.message,
    });
  }
};

// @desc    Delete faculty
// @route   DELETE /api/faculty/:id
// @access  Private (Institution Admin)
const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    if (req.user?.institutionId && faculty.institutionId.toString() !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Faculty does not belong to your institution.',
      });
    }

    await faculty.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Faculty deleted successfully',
    });

  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete faculty',
      error: error.message,
    });
  }
};

module.exports = {
  createFaculty,
  getFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
};