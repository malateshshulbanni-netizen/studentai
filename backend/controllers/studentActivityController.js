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

    console.log('\n' + '='.repeat(70));
    console.log('📥 [BULK] Bulk create/update called');
    console.log('='.repeat(70));
    console.log('👤 Faculty ID:', facultyId);
    console.log('👤 Faculty Name:', req.user.name);
    console.log('🏫 Institution ID:', institutionId);
    console.log('📊 Activities count:', activities?.length);
    console.log('📊 First activity received:', JSON.stringify(activities?.[0], null, 2));
    console.log('='.repeat(70));

    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      console.log('❌ [BULK] No activities provided');
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one student activity'
      });
    }

    // Get current academic year
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;
    console.log(`📅 [BULK] Academic Year: ${academicYear}`);

    const results = [];
    const errors = [];

    // Process each activity
    for (let idx = 0; idx < activities.length; idx++) {
      const activityData = activities[idx];
      
      console.log('\n' + '-'.repeat(70));
      console.log(`📝 [${idx + 1}/${activities.length}] Processing student`);
      console.log('-'.repeat(70));
      
      try {
        const { 
          studentId, 
          studentName, 
          studentUsn,
          age,
          totalClasses, 
          attendedClasses, 
          gpa, 
          failedSubjects,
          backlogs, 
          assignmentCompletion,
          internalAssessmentMarks,
          examScore,
          lmsActivityScore,
          feePending,
          counselingSessions
        } = activityData;

        // ============================================
        // LOG ALL RECEIVED FIELDS
        // ============================================
        console.log('📥 [DATA] Received fields:');
        console.log('   studentId:', studentId, '| type:', typeof studentId);
        console.log('   studentName:', studentName);
        console.log('   studentUsn:', studentUsn);
        console.log('   --- 11 FEATURES ---');
        console.log('   age:', age, '| type:', typeof age);
        console.log('   totalClasses:', totalClasses, '| type:', typeof totalClasses);
        console.log('   attendedClasses:', attendedClasses, '| type:', typeof attendedClasses);
        console.log('   gpa:', gpa, '| type:', typeof gpa);
        console.log('   failedSubjects:', failedSubjects, '| type:', typeof failedSubjects);
        console.log('   backlogs:', backlogs, '| type:', typeof backlogs);
        console.log('   assignmentCompletion:', assignmentCompletion, '| type:', typeof assignmentCompletion);
        console.log('   internalAssessmentMarks:', internalAssessmentMarks, '| type:', typeof internalAssessmentMarks);
        console.log('   examScore:', examScore, '| type:', typeof examScore);
        console.log('   lmsActivityScore:', lmsActivityScore, '| type:', typeof lmsActivityScore);
        console.log('   feePending:', feePending, '| type:', typeof feePending);
        console.log('   counselingSessions:', counselingSessions, '| type:', typeof counselingSessions);

        // ============================================
        // VALIDATE studentId
        // ============================================
        if (!studentId) {
          console.log('❌ [VALIDATE] Missing studentId');
          errors.push({
            studentId,
            studentName,
            error: 'Missing studentId'
          });
          continue;
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
          console.log(`❌ [VALIDATE] Invalid ObjectId format: ${studentId}`);
          errors.push({
            studentId,
            studentName,
            error: `Invalid studentId format: ${studentId}`
          });
          continue;
        }

        // ============================================
        // VALIDATE student exists
        // ============================================
        const studentExists = await Student.findById(studentId);
        if (!studentExists) {
          console.log(`❌ [VALIDATE] Student not found in DB: ${studentId}`);
          errors.push({
            studentId,
            studentName,
            error: 'Student not found in database'
          });
          continue;
        }

        console.log(`✅ [VALIDATE] Student found: ${studentExists.name} (${studentExists.usn})`);

        // Get course, semester, branch from student
        const { course, semester, branch } = studentExists;
        console.log(`📚 [STUDENT] course: ${course}, semester: ${semester}, branch: ${branch}`);

        // ============================================
        // CALCULATE attendance percentage
        // ============================================
        const attendancePercentage = totalClasses > 0 
          ? Math.round((attendedClasses / totalClasses) * 100) 
          : 0;
        console.log(`📊 [CALC] attendancePercentage: ${attendancePercentage}% (${attendedClasses}/${totalClasses})`);

        // ============================================
        // BUILD FILTER
        // ============================================
        const filter = {
          institutionId,
          studentId,
          academicYear,
          semester
        };
        console.log('🔍 [FILTER] Query filter:', JSON.stringify(filter));

        // ============================================
        // BUILD UPDATE OBJECT
        // ============================================
        const update = {
          facultyId,
          studentName,
          studentUsn,
          course,
          semester,
          branch,
          // ============================================
          // ALL 11 FEATURES
          // ============================================
          age: age !== undefined && age !== null ? Number(age) : 20,
          totalClasses: totalClasses !== undefined ? Number(totalClasses) : 0,
          attendedClasses: attendedClasses !== undefined ? Number(attendedClasses) : 0,
          attendancePercentage,
          gpa: gpa !== undefined && gpa !== null ? Number(gpa) : 0,
          failedSubjects: failedSubjects !== undefined && failedSubjects !== null ? Number(failedSubjects) : 0,
          backlogs: backlogs !== undefined && backlogs !== null ? Number(backlogs) : 0,
          assignmentCompletion: assignmentCompletion !== undefined && assignmentCompletion !== null ? Number(assignmentCompletion) : 0,
          internalAssessmentMarks: internalAssessmentMarks !== undefined && internalAssessmentMarks !== null ? Number(internalAssessmentMarks) : 0,
          examScore: examScore !== undefined && examScore !== null ? Number(examScore) : 0,
          lmsActivityScore: lmsActivityScore !== undefined && lmsActivityScore !== null ? Number(lmsActivityScore) : 0,
          feePending: feePending !== undefined && feePending !== null ? Number(feePending) : 0,
          counselingSessions: counselingSessions !== undefined && counselingSessions !== null ? Number(counselingSessions) : 0,
          // ============================================
          // METADATA
          // ============================================
          status: 'Submitted',
          'metadata.submittedBy': req.user.name || 'Faculty',
          'metadata.submittedAt': new Date(),
          'metadata.lastUpdatedBy': req.user.name || 'Faculty',
          'metadata.lastUpdatedAt': new Date()
        };

        console.log('📦 [UPDATE] Object being saved to DB:');
        console.log(JSON.stringify(update, null, 2));

        // ============================================
        // EXECUTE UPSERT
        // ============================================
        const options = {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          returnDocument: 'after'
        };

        const updatedActivity = await StudentActivity.findOneAndUpdate(
          filter,
          update,
          options
        );

        if (!updatedActivity) {
          console.log('❌ [DB] findOneAndUpdate returned null');
          errors.push({
            studentId,
            studentName,
            error: 'Failed to save activity (returned null)'
          });
          continue;
        }

        // ============================================
        // VERIFY WHAT WAS ACTUALLY SAVED
        // ============================================
        console.log('✅ [DB] Activity saved with ID:', updatedActivity._id);
        console.log('📤 [DB] Fields saved in DB:');
        console.log('   age:', updatedActivity.age);
        console.log('   totalClasses:', updatedActivity.totalClasses);
        console.log('   attendedClasses:', updatedActivity.attendedClasses);
        console.log('   attendancePercentage:', updatedActivity.attendancePercentage);
        console.log('   gpa:', updatedActivity.gpa);
        console.log('   failedSubjects:', updatedActivity.failedSubjects);
        console.log('   backlogs:', updatedActivity.backlogs);
        console.log('   assignmentCompletion:', updatedActivity.assignmentCompletion);
        console.log('   internalAssessmentMarks:', updatedActivity.internalAssessmentMarks);
        console.log('   examScore:', updatedActivity.examScore);
        console.log('   lmsActivityScore:', updatedActivity.lmsActivityScore);
        console.log('   feePending:', updatedActivity.feePending);
        console.log('   counselingSessions:', updatedActivity.counselingSessions);

        // ============================================
        // CHECK FOR MISSING FIELDS
        // ============================================
        const missingInDB = [];
        if (updatedActivity.age === undefined) missingInDB.push('age');
        if (updatedActivity.failedSubjects === undefined) missingInDB.push('failedSubjects');
        if (updatedActivity.internalAssessmentMarks === undefined) missingInDB.push('internalAssessmentMarks');
        if (updatedActivity.examScore === undefined) missingInDB.push('examScore');
        if (updatedActivity.lmsActivityScore === undefined) missingInDB.push('lmsActivityScore');
        if (updatedActivity.feePending === undefined) missingInDB.push('feePending');
        if (updatedActivity.counselingSessions === undefined) missingInDB.push('counselingSessions');

        if (missingInDB.length > 0) {
          console.log('⚠️ [WARNING] Fields NOT saved in DB (check schema!):', missingInDB);
          console.log('⚠️ [WARNING] This means the Mongoose schema is missing these fields!');
        } else {
          console.log('✅ [VERIFY] All 11 features successfully saved in DB');
        }

        results.push({
          studentId,
          studentName,
          studentUsn,
          success: true,
          activityId: updatedActivity._id,
          attendancePercentage
        });

      } catch (error) {
        console.error(`❌ [ERROR] Error processing student ${activityData?.studentId}:`, error);
        console.error('Error stack:', error.stack);
        errors.push({
          studentId: activityData?.studentId,
          studentName: activityData?.studentName,
          error: error.message
        });
      }
    }

    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(70));
    console.log('📊 [BULK] FINAL SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successful: ${results.length}`);
    console.log(`❌ Failed: ${errors.length}`);
    console.log(`📊 Total: ${activities.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ [BULK] ERRORS:');
      errors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.studentName} (${err.studentId}): ${err.error}`);
      });
    }
    console.log('='.repeat(70) + '\n');

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
    console.error('❌ [BULK] FATAL ERROR:', error);
    console.error('Stack:', error.stack);
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
    console.log('\n' + '='.repeat(70));
    console.log('📥 [GET] Get activities called');
    console.log('='.repeat(70));
    console.log('Query params:', JSON.stringify(req.query, null, 2));
    
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

    console.log('🔍 [GET] Filter:', JSON.stringify(filter, null, 2));
    console.log('🔍 [GET] Sort:', JSON.stringify(sortOptions));
    console.log('🔍 [GET] Skip:', skip, '| Limit:', limit);

    // Execute query
    const activities = await StudentActivity.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await StudentActivity.countDocuments(filter);

    console.log(`✅ [GET] Found ${activities.length} activities (total: ${total})`);
    
    // ============================================
    // LOG FIRST ACTIVITY TO VERIFY ALL FIELDS
    // ============================================
    if (activities.length > 0) {
      const first = activities[0];
      console.log('\n📋 [GET] Sample activity (first):');
      console.log('   studentId:', first.studentId);
      console.log('   studentName:', first.studentName);
      console.log('   --- 11 FEATURES ---');
      console.log('   age:', first.age);
      console.log('   attendancePercentage:', first.attendancePercentage);
      console.log('   gpa:', first.gpa);
      console.log('   failedSubjects:', first.failedSubjects);
      console.log('   backlogs:', first.backlogs);
      console.log('   assignmentCompletion:', first.assignmentCompletion);
      console.log('   internalAssessmentMarks:', first.internalAssessmentMarks);
      console.log('   examScore:', first.examScore);
      console.log('   lmsActivityScore:', first.lmsActivityScore);
      console.log('   feePending:', first.feePending);
      console.log('   counselingSessions:', first.counselingSessions);
      
      // Check for missing fields
      const missing = [];
      if (first.age === undefined) missing.push('age');
      if (first.failedSubjects === undefined) missing.push('failedSubjects');
      if (first.internalAssessmentMarks === undefined) missing.push('internalAssessmentMarks');
      if (first.examScore === undefined) missing.push('examScore');
      if (first.lmsActivityScore === undefined) missing.push('lmsActivityScore');
      if (first.feePending === undefined) missing.push('feePending');
      if (first.counselingSessions === undefined) missing.push('counselingSessions');
      
      if (missing.length > 0) {
        console.log('⚠️ [GET] MISSING FIELDS in DB:', missing);
        console.log('⚠️ [GET] Your Mongoose schema needs these fields added!');
      } else {
        console.log('✅ [GET] All 11 features present in DB');
      }
    }

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
          totalFailedSubjects: { $sum: '$failedSubjects' },
          averageAssignmentCompletion: { $avg: '$assignmentCompletion' },
          averageInternalAssessment: { $avg: '$internalAssessmentMarks' },
          averageExamScore: { $avg: '$examScore' },
          averageLMSActivity: { $avg: '$lmsActivityScore' },
          totalFeePending: { $sum: '$feePending' },
          totalCounselingSessions: { $sum: '$counselingSessions' },
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
      totalFailedSubjects: 0,
      averageAssignmentCompletion: 0,
      averageInternalAssessment: 0,
      averageExamScore: 0,
      averageLMSActivity: 0,
      totalFeePending: 0,
      totalCounselingSessions: 0,
      goodAttendance: 0,
      needsAttention: 0,
      poorAttendance: 0
    };

    console.log('📊 [GET] Summary:', JSON.stringify(summaryData, null, 2));
    console.log('='.repeat(70) + '\n');

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
    console.error('❌ [GET] Error:', error);
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
    console.log('📥 [GET ONE] Activity ID:', req.params.id);
    
    const activity = await StudentActivity.findById(req.params.id).lean();

    if (!activity) {
      console.log('❌ [GET ONE] Not found');
      return res.status(404).json({
        success: false,
        message: 'Student activity not found'
      });
    }

    console.log('✅ [GET ONE] Found:', activity.studentName);
    console.log('📊 [GET ONE] 11 features:');
    console.log('   age:', activity.age);
    console.log('   attendancePercentage:', activity.attendancePercentage);
    console.log('   gpa:', activity.gpa);
    console.log('   failedSubjects:', activity.failedSubjects);
    console.log('   backlogs:', activity.backlogs);
    console.log('   assignmentCompletion:', activity.assignmentCompletion);
    console.log('   internalAssessmentMarks:', activity.internalAssessmentMarks);
    console.log('   examScore:', activity.examScore);
    console.log('   lmsActivityScore:', activity.lmsActivityScore);
    console.log('   feePending:', activity.feePending);
    console.log('   counselingSessions:', activity.counselingSessions);

    res.status(200).json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('❌ [GET ONE] Error:', error);
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
    console.log('\n' + '='.repeat(70));
    console.log('📥 [UPDATE] Update activity called');
    console.log('='.repeat(70));
    console.log('ID:', req.params.id);
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const {
      age,
      totalClasses,
      attendedClasses,
      gpa,
      failedSubjects,
      backlogs,
      assignmentCompletion,
      internalAssessmentMarks,
      examScore,
      lmsActivityScore,
      feePending,
      counselingSessions,
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

    // FULL 11 FEATURES UPDATE
    const updateData = {
      ...(age !== undefined && { age }),
      ...(totalClasses !== undefined && { totalClasses }),
      ...(attendedClasses !== undefined && { attendedClasses }),
      ...(attendancePercentage !== undefined && { attendancePercentage }),
      ...(gpa !== undefined && { gpa }),
      ...(failedSubjects !== undefined && { failedSubjects }),
      ...(backlogs !== undefined && { backlogs }),
      ...(assignmentCompletion !== undefined && { assignmentCompletion }),
      ...(internalAssessmentMarks !== undefined && { internalAssessmentMarks }),
      ...(examScore !== undefined && { examScore }),
      ...(lmsActivityScore !== undefined && { lmsActivityScore }),
      ...(feePending !== undefined && { feePending }),
      ...(counselingSessions !== undefined && { counselingSessions }),
      ...(status && { status }),
      ...(remarks && { remarks }),
      'metadata.lastUpdatedBy': req.user.name || 'Faculty',
      'metadata.lastUpdatedAt': new Date()
    };

    console.log('📦 [UPDATE] Data to update:', JSON.stringify(updateData, null, 2));

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
      console.log('❌ [UPDATE] Not found');
      return res.status(404).json({
        success: false,
        message: 'Student activity not found'
      });
    }

    console.log('✅ [UPDATE] Updated successfully');
    console.log('='.repeat(70) + '\n');

    res.status(200).json({
      success: true,
      message: 'Student activity updated successfully',
      data: activity
    });

  } catch (error) {
    console.error('❌ [UPDATE] Error:', error);
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
    console.log('📥 [DELETE] Activity ID:', req.params.id);
    
    const activity = await StudentActivity.findByIdAndDelete(req.params.id);

    if (!activity) {
      console.log('❌ [DELETE] Not found');
      return res.status(404).json({
        success: false,
        message: 'Student activity not found'
      });
    }

    console.log('✅ [DELETE] Deleted:', activity.studentName);

    res.status(200).json({
      success: true,
      message: 'Student activity deleted successfully'
    });

  } catch (error) {
    console.error('❌ [DELETE] Error:', error);
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
    console.log('📥 [SUMMARY] Query:', req.query);
    
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

    console.log('✅ [SUMMARY] Found', summary.length, 'records');

    res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('❌ [SUMMARY] Error:', error);
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

    console.log('📥 [TREND] Student:', studentId, '| Year:', academicYear);

    const trend = await StudentActivity.getStudentTrend(studentId, academicYear);

    console.log('✅ [TREND] Found', trend.length, 'records');

    res.status(200).json({
      success: true,
      data: trend
    });

  } catch (error) {
    console.error('❌ [TREND] Error:', error);
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

    console.log('📥 [BY INST] Institution:', institutionId);
    console.log('📥 [BY INST] Filters:', { semester, branch, course, academicYear });

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

    console.log(`✅ [BY INST] Found ${activities.length} activities (total: ${total})`);

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
    console.error('❌ [BY INST] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching institution activities',
      error: error.message
    });
  }
};

// @desc    Get ML-ready features for a student
// @route   GET /api/student-activities/ml-features/:studentId
// @access  Private (Faculty/Admin)
exports.getStudentMLFeatures = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear, semester } = req.query;

    console.log('📥 [ML] Get ML features for:', studentId);

    const features = await StudentActivity.getMLFeatures(
      studentId,
      academicYear,
      semester
    );

    if (!features) {
      console.log('❌ [ML] No features found');
      return res.status(404).json({
        success: false,
        message: 'No activity data found for this student'
      });
    }

    console.log('✅ [ML] Features:', JSON.stringify(features, null, 2));

    res.status(200).json({
      success: true,
      data: features
    });

  } catch (error) {
    console.error('❌ [ML] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ML features',
      error: error.message
    });
  }
};