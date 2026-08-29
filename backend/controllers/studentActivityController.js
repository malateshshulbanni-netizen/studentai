const StudentActivity = require('../models/StudentActivity');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// @desc    Create or update multiple student activities
// @route   POST /api/student-activities/bulk
// @access  Private (Faculty/Admin)
exports.bulkCreateOrUpdateActivities = async (req, res) => {
  try {
    const { activities } = req.body;
    const facultyId = req.user.id;
    const institutionId = req.user.institutionId || req.user._id;

    console.log('📥 Bulk create/update called');
    console.log('👤 Faculty ID:', facultyId);
    console.log('🏫 Institution ID:', institutionId);
    console.log('📊 Activities count:', activities?.length);

    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one student activity'
      });
    }

    // Get current academic year
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    const results = [];
    const errors = [];

    // Process each activity
    for (const activityData of activities) {
      try {
        const { 
          studentId, 
          studentName, 
          studentUsn,
          totalClasses, 
          attendedClasses, 
          engagement, 
          gpa, 
          backlogs, 
          assignmentCompletion 
        } = activityData;

        console.log(`📝 Processing student: ${studentName} (${studentId})`);

        // Validate student exists
        const studentExists = await Student.findById(studentId);
        if (!studentExists) {
          errors.push({
            studentId,
            studentName,
            error: 'Student not found'
          });
          continue;
        }

        // Get course, semester, branch from student
        const { course, semester, branch } = studentExists;

        // Calculate attendance percentage
        const attendancePercentage = totalClasses > 0 
          ? Math.round((attendedClasses / totalClasses) * 100) 
          : 0;

        // Find existing record or create new one
        const filter = {
          institutionId,
          studentId,
          academicYear,
          semester
        };

        const update = {
          facultyId,
          studentName,
          studentUsn,
          course,
          semester,
          branch,
          totalClasses,
          attendedClasses,
          attendancePercentage,
          engagement: engagement || 'Medium',
          gpa: gpa || 0,
          backlogs: backlogs || 0,
          assignmentCompletion: assignmentCompletion || 0,
          status: 'Submitted',
          'metadata.submittedBy': req.user.name || 'Faculty',
          'metadata.submittedAt': new Date(),
          'metadata.lastUpdatedBy': req.user.name || 'Faculty',
          'metadata.lastUpdatedAt': new Date()
        };

        const options = {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          returnDocument: 'after' // Fix for deprecation warning
        };

        const updatedActivity = await StudentActivity.findOneAndUpdate(
          filter,
          update,
          options
        );

        results.push({
          studentId,
          studentName,
          studentUsn,
          success: true,
          activityId: updatedActivity._id,
          attendancePercentage
        });

      } catch (error) {
        console.error(`Error processing student ${activityData.studentId}:`, error);
        errors.push({
          studentId: activityData.studentId,
          studentName: activityData.studentName,
          error: error.message
        });
      }
    }

    // Return response with summary
    res.status(200).json({
      success: true,
      message: `Successfully processed ${results.length} student activities`,
      data: {
        totalProcessed: activities.length,
        successful: results.length,
        failed: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Bulk create/update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing student activities',
      error: error.message
    });
  }
};

// @desc    Get all student activities with filters
// @route   GET /api/student-activities
// @access  Private (Faculty/Admin)
exports.getActivities = async (req, res) => {
  try {
    console.log('📥 Get activities called');
    
    const {
      institutionId,
      studentId,
      semester,
      branch,
      course,
      academicYear,
      status,
      engagement,
      minAttendance,
      maxAttendance,
      page = 1,
      limit = 20,
      sortBy = 'submissionDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = {};

    if (institutionId) filter.institutionId = institutionId;
    if (studentId) filter.studentId = studentId;
    if (semester) filter.semester = semester;
    if (branch) filter.branch = branch;
    if (course) filter.course = course;
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;
    if (engagement) filter.engagement = engagement;

    // Attendance range filter
    if (minAttendance || maxAttendance) {
      filter.attendancePercentage = {};
      if (minAttendance) filter.attendancePercentage.$gte = parseInt(minAttendance);
      if (maxAttendance) filter.attendancePercentage.$lte = parseInt(maxAttendance);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('🔍 Filter:', JSON.stringify(filter, null, 2));

    // Execute query - REMOVED POPULATE to fix User model error
    const activities = await StudentActivity.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await StudentActivity.countDocuments(filter);

    // Get summary statistics
    const summary = await StudentActivity.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          averageAttendance: { $avg: '$attendancePercentage' },
          averageGPA: { $avg: '$gpa' },
          totalBacklogs: { $sum: '$backlogs' },
          averageAssignmentCompletion: { $avg: '$assignmentCompletion' },
          highEngagement: {
            $sum: { $cond: [{ $eq: ['$engagement', 'High'] }, 1, 0] }
          },
          mediumEngagement: {
            $sum: { $cond: [{ $eq: ['$engagement', 'Medium'] }, 1, 0] }
          },
          lowEngagement: {
            $sum: { $cond: [{ $eq: ['$engagement', 'Low'] }, 1, 0] }
          },
          goodAttendance: {
            $sum: { $cond: [{ $gte: ['$attendancePercentage', 75] }, 1, 0] }
          },
          needsAttention: {
            $sum: { $cond: [
              { $and: [
                { $gte: ['$attendancePercentage', 50] },
                { $lt: ['$attendancePercentage', 75] }
              ]},
              1, 0
            ]}
          },
          poorAttendance: {
            $sum: { $cond: [{ $lt: ['$attendancePercentage', 50] }, 1, 0] }
          }
        }
      }
    ]);

    const summaryData = summary.length > 0 ? summary[0] : {
      totalStudents: 0,
      averageAttendance: 0,
      averageGPA: 0,
      totalBacklogs: 0,
      averageAssignmentCompletion: 0,
      highEngagement: 0,
      mediumEngagement: 0,
      lowEngagement: 0,
      goodAttendance: 0,
      needsAttention: 0,
      poorAttendance: 0
    };

    console.log(`✅ Found ${activities.length} activities`);

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        summary: summaryData
      }
    });

  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student activities',
      error: error.message
    });
  }
};

// @desc    Get single student activity
// @route   GET /api/student-activities/:id
// @access  Private (Faculty/Admin)
exports.getActivityById = async (req, res) => {
  try {
    const activity = await StudentActivity.findById(req.params.id).lean();

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Student activity not found'
      });
    }

    res.status(200).json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('Get activity by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student activity',
      error: error.message
    });
  }
};

// @desc    Update single student activity
// @route   PUT /api/student-activities/:id
// @access  Private (Faculty/Admin)
exports.updateActivity = async (req, res) => {
  try {
    const {
      totalClasses,
      attendedClasses,
      engagement,
      gpa,
      backlogs,
      assignmentCompletion,
      status,
      remarks
    } = req.body;

    // Calculate attendance percentage
    let attendancePercentage;
    if (totalClasses !== undefined && attendedClasses !== undefined) {
      attendancePercentage = totalClasses > 0 
        ? Math.round((attendedClasses / totalClasses) * 100) 
        : 0;
    }

    const updateData = {
      ...(totalClasses !== undefined && { totalClasses }),
      ...(attendedClasses !== undefined && { attendedClasses }),
      ...(attendancePercentage !== undefined && { attendancePercentage }),
      ...(engagement && { engagement }),
      ...(gpa !== undefined && { gpa }),
      ...(backlogs !== undefined && { backlogs }),
      ...(assignmentCompletion !== undefined && { assignmentCompletion }),
      ...(status && { status }),
      ...(remarks && { remarks }),
      'metadata.lastUpdatedBy': req.user.name || 'Faculty',
      'metadata.lastUpdatedAt': new Date()
    };

    const activity = await StudentActivity.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
        returnDocument: 'after'
      }
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Student activity not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student activity updated successfully',
      data: activity
    });

  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student activity',
      error: error.message
    });
  }
};

// @desc    Delete student activity
// @route   DELETE /api/student-activities/:id
// @access  Private (Faculty/Admin)
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await StudentActivity.findByIdAndDelete(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Student activity not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student activity deleted successfully'
    });

  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student activity',
      error: error.message
    });
  }
};

// @desc    Get summary statistics for institution
// @route   GET /api/student-activities/summary
// @access  Private (Faculty/Admin)
exports.getSummary = async (req, res) => {
  try {
    const { institutionId, academicYear, semester } = req.query;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: 'Institution ID is required'
      });
    }

    const summary = await StudentActivity.getSummaryByInstitution(
      institutionId,
      academicYear,
      semester
    );

    res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching summary',
      error: error.message
    });
  }
};

// @desc    Get student performance trend
// @route   GET /api/student-activities/trend/:studentId
// @access  Private (Faculty/Admin)
exports.getStudentTrend = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;

    const trend = await StudentActivity.getStudentTrend(studentId, academicYear);

    res.status(200).json({
      success: true,
      data: trend
    });

  } catch (error) {
    console.error('Get student trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student trend',
      error: error.message
    });
  }
};

// @desc    Get student activities by institution
// @route   GET /api/student-activities/institution/:institutionId
// @access  Private (Faculty/Admin)
exports.getActivitiesByInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { semester, branch, course, academicYear, page = 1, limit = 50 } = req.query;

    const filter = { institutionId };
    if (semester) filter.semester = semester;
    if (branch) filter.branch = branch;
    if (course) filter.course = course;
    if (academicYear) filter.academicYear = academicYear;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await StudentActivity.find(filter)
      .sort({ submissionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await StudentActivity.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get activities by institution error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching institution activities',
      error: error.message
    });
  }
};