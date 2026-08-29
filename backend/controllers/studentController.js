const Student = require('../models/Student');
const Institution = require('../models/Institution');

// @desc    Create a new student
// @route   POST /api/students
// @access  Private (Institution Admin)
const createStudent = async (req, res) => {
  try {
    const { 
      name, 
      usn, 
      email, 
      phone, 
      course, 
      branch, 
      semester, 
      institutionId,
      password 
    } = req.body;

    console.log('📝 Creating student:', { name, usn, email, course, branch, semester });

    // Validate required fields
    if (!name || !usn || !email || !phone || !course || !branch || !semester || !institutionId || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ email: email.toLowerCase() }, { usn: usn.toUpperCase().trim() }],
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email or USN already exists',
      });
    }

    // Get institution name
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    // Create student
    const student = new Student({
      name: name.trim(),
      usn: usn.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      course: course.trim(),
      branch: branch.trim(),
      semester: semester.trim(),
      institutionId,
      institutionName: institution.name,
      password,
      createdBy: req.user?.id || null,
    });

    await student.save();

    console.log('✅ Student created successfully:', student.email);

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: student,
    });

  } catch (error) {
    console.error('❌ Create student error:', error);
    
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
      message: 'Failed to create student',
      error: error.message,
    });
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Institution Admin)
const getStudents = async (req, res) => {
  try {
    const { institutionId } = req.query;
    
    let query = {};
    
    // If institutionId is provided, filter by institution
    if (institutionId) {
      query.institutionId = institutionId;
    } else if (req.user?.institutionId) {
      // If user has institutionId, filter by that
      query.institutionId = req.user.institutionId;
    }

    const students = await Student.find(query)
      .populate('assignedFaculty', 'fullName email department')
      .sort({ createdAt: -1 })
      .select('-password');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message,
    });
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private (Institution Admin)
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('assignedFaculty', 'fullName email department')
      .select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Check if student belongs to the institution
    if (req.user?.institutionId && student.institutionId.toString() !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student does not belong to your institution.',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });

  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student',
      error: error.message,
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Institution Admin)
const updateStudent = async (req, res) => {
  try {
    const { name, usn, email, phone, course, branch, semester, active } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Check if student belongs to the institution
    if (req.user?.institutionId && student.institutionId.toString() !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student does not belong to your institution.',
      });
    }

    // Check if email or usn already exists (excluding current student)
    if (email || usn) {
      const existing = await Student.findOne({
        $or: [{ email: email?.toLowerCase() }, { usn: usn?.toUpperCase().trim() }],
        _id: { $ne: req.params.id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email or USN already in use by another student',
        });
      }
    }

    // Update fields
    if (name) student.name = name.trim();
    if (usn) student.usn = usn.toUpperCase().trim();
    if (email) student.email = email.toLowerCase().trim();
    if (phone) student.phone = phone.trim();
    if (course) student.course = course.trim();
    if (branch) student.branch = branch.trim();
    if (semester) student.semester = semester.trim();
    if (active !== undefined) student.active = active;

    await student.save();

    const studentData = student.toObject();
    delete studentData.password;

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: studentData,
    });

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message,
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Institution Admin)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Check if student belongs to the institution
    if (req.user?.institutionId && student.institutionId.toString() !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student does not belong to your institution.',
      });
    }

    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message,
    });
  }
};

// @desc    Update student password
// @route   PUT /api/students/:id/password
// @access  Private (Institution Admin)
const updateStudentPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const student = await Student.findById(req.params.id).select('+password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Check if student belongs to the institution
    if (req.user?.institutionId && student.institutionId.toString() !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student does not belong to your institution.',
      });
    }

    // Check current password
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is required',
      });
    }

    const isMatch = await student.comparePassword(currentPassword);
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

    student.password = newPassword;
    await student.save();

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

// @desc    Toggle student active status
// @route   PATCH /api/students/:id/toggle-status
// @access  Private (Institution Admin)
const toggleStudentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Check if student belongs to the institution
    if (req.user?.institutionId && student.institutionId.toString() !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student does not belong to your institution.',
      });
    }

    student.active = !student.active;
    await student.save();

    const studentData = student.toObject();
    delete studentData.password;

    res.status(200).json({
      success: true,
      message: `Student ${student.active ? 'activated' : 'deactivated'} successfully`,
      data: studentData,
    });

  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle student status',
      error: error.message,
    });
  }
};

// @desc    Get students by institution
// @route   GET /api/students/institution/:institutionId
// @access  Private (Institution Admin)
const getStudentsByInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;

    const students = await Student.find({ institutionId })
      .populate('assignedFaculty', 'fullName email department')
      .sort({ createdAt: -1 })
      .select('-password');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });

  } catch (error) {
    console.error('Get students by institution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message,
    });
  }
};

// @desc    Get student count by institution
// @route   GET /api/students/count/institution/:institutionId
// @access  Private (Institution Admin)
const getStudentCountByInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;

    const count = await Student.countDocuments({ institutionId });

    res.status(200).json({
      success: true,
      count,
    });

  } catch (error) {
    console.error('Get student count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student count',
      error: error.message,
    });
  }
};

// @desc    Assign faculty to student
// @route   PUT /api/students/:id/assign-faculty
// @access  Private (Institution Admin)
const assignFaculty = async (req, res) => {
  try {
    const { facultyId } = req.body;

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID is required',
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Check if student belongs to the institution
    if (req.user?.institutionId && student.institutionId.toString() !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student does not belong to your institution.',
      });
    }

    // Verify faculty exists and belongs to same institution
    const Faculty = require('../models/Faculty');
    const faculty = await Faculty.findById(facultyId);
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    // Check if faculty belongs to same institution
    if (faculty.institutionId.toString() !== student.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Faculty does not belong to the same institution',
      });
    }

    // Assign faculty to student
    student.assignedFaculty = facultyId;
    await student.save();

    // Populate assignedFaculty for response
    await student.populate('assignedFaculty', 'fullName email department');

    const studentData = student.toObject();
    delete studentData.password;

    res.status(200).json({
      success: true,
      message: 'Faculty assigned successfully',
      data: studentData,
    });

  } catch (error) {
    console.error('Assign faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign faculty',
      error: error.message,
    });
  }
};

// ==================== NEW FUNCTION ====================
// @desc    Get students assigned to a specific faculty
// @route   GET /api/students/my-students
// @access  Private (Faculty only)
const getStudentsByFaculty = async (req, res) => {
  try {
    // Get faculty ID from the logged-in user
    const facultyId = req.user?.id || req.user?.facultyId;

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID not found',
      });
    }

    // Find students where assignedFaculty matches the faculty ID
    const students = await Student.find({ assignedFaculty: facultyId })
      .populate('assignedFaculty', 'fullName email department')
      .sort({ createdAt: -1 })
      .select('-password');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });

  } catch (error) {
    console.error('Get students by faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message,
    });
  }
};


// @desc    Get all students from faculty's institution
// @route   GET /api/students/faculty/institution-students
// @access  Private (Faculty only)
const getFacultyInstitutionStudents = async (req, res) => {
  try {
    // Get institution ID from the logged-in user
    const institutionId = req.user?.institutionId;

    console.log('🏫 Institution ID:', institutionId);
    console.log('👤 User role:', req.user?.role);

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: 'Institution ID not found',
      });
    }

    // Find all students in the institution
    const students = await Student.find({ institutionId: institutionId })
      .populate('assignedFaculty', 'fullName email department')
      .sort({ createdAt: -1 })
      .select('-password');

    console.log(`✅ Found ${students.length} students in institution`);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });

  } catch (error) {
    console.error('Get faculty institution students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message,
    });
  }
};

module.exports = {
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
  getStudentsByFaculty, // ← ADD THIS
  getFacultyInstitutionStudents, // ← ADD THIS
};