const mongoose = require('mongoose');

const StudentActivitySchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentUsn: {
    type: String,
    required: true,
    index: true
  },
  course: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },

  // ============================================
  // ALL 11 FEATURES FOR ML MODEL
  // ============================================

  // Feature 1: Age
  age: {
    type: Number,
    min: 17,
    max: 30,
    default: 20
  },

  // Attendance (2 fields used to calculate attendancePercentage)
  totalClasses: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  attendedClasses: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },

  // Feature 2: Attendance Percentage (auto-calculated)
  attendancePercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Feature 3: Current GPA
  gpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },

  // Feature 4: Failed Subjects
  failedSubjects: {
    type: Number,
    min: 0,
    default: 0
  },

  // Feature 5: Backlogs
  backlogs: {
    type: Number,
    min: 0,
    default: 0
  },

  // Feature 6: Assignment Completion Percentage
  assignmentCompletion: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Feature 7: Internal Assessment Marks
  internalAssessmentMarks: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Feature 8: Exam Score
  examScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Feature 9: LMS Activity Score
  lmsActivityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Feature 10: Fee Pending (0 = No, 1 = Yes)
  feePending: {
    type: Number,
    enum: [0, 1],
    default: 0
  },

  // Feature 11: Counseling Sessions
  counselingSessions: {
    type: Number,
    min: 0,
    default: 0
  },

  // ============================================
  // LEGACY FIELD (kept for backward compatibility)
  // ============================================
  engagement: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },

  // ============================================
  // METADATA & STATUS
  // ============================================
  academicYear: {
    type: String,
    required: true
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  remarks: {
    type: String,
    trim: true
  },
  metadata: {
    submittedBy: {
      type: String,
      trim: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    lastUpdatedBy: {
      type: String,
      trim: true
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Compound index for unique combination
StudentActivitySchema.index(
  { institutionId: 1, studentId: 1, academicYear: 1, semester: 1 },
  { unique: true }
);

// ============================================
// VIRTUAL: Get ML-ready 11 features
// ============================================
StudentActivitySchema.virtual('mlFeatures').get(function() {
  return {
    age: this.age,
    attendance_percentage: this.attendancePercentage,
    current_gpa: this.gpa,
    failed_subjects: this.failedSubjects,
    backlogs: this.backlogs,
    assignment_completion_percentage: this.assignmentCompletion,
    internal_assessment_marks: this.internalAssessmentMarks,
    exam_score: this.examScore,
    lms_activity_score: this.lmsActivityScore,
    fee_pending: this.feePending,
    counseling_sessions: this.counselingSessions
  };
});

StudentActivitySchema.set('toJSON', { virtuals: true });
StudentActivitySchema.set('toObject', { virtuals: true });

// Static method to get student activity summary
StudentActivitySchema.statics.getSummaryByInstitution = async function(institutionId, academicYear, semester) {
  const matchQuery = { institutionId: new mongoose.Types.ObjectId(institutionId) };
  if (academicYear) matchQuery.academicYear = academicYear;
  if (semester) matchQuery.semester = semester;

  const summary = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          branch: '$branch',
          course: '$course',
          semester: '$semester'
        },
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
        averageAge: { $avg: '$age' },
        engagementBreakdown: {
          $push: '$engagement'
        }
      }
    },
    {
      $project: {
        branch: '$_id.branch',
        course: '$_id.course',
        semester: '$_id.semester',
        totalStudents: 1,
        averageAttendance: { $round: ['$averageAttendance', 1] },
        averageGPA: { $round: ['$averageGPA', 1] },
        totalBacklogs: 1,
        totalFailedSubjects: 1,
        averageAssignmentCompletion: { $round: ['$averageAssignmentCompletion', 1] },
        averageInternalAssessment: { $round: ['$averageInternalAssessment', 1] },
        averageExamScore: { $round: ['$averageExamScore', 1] },
        averageLMSActivity: { $round: ['$averageLMSActivity', 1] },
        totalFeePending: 1,
        totalCounselingSessions: 1,
        averageAge: { $round: ['$averageAge', 1] },
        highEngagement: {
          $size: {
            $filter: {
              input: '$engagementBreakdown',
              as: 'eng',
              cond: { $eq: ['$$eng', 'High'] }
            }
          }
        },
        mediumEngagement: {
          $size: {
            $filter: {
              input: '$engagementBreakdown',
              as: 'eng',
              cond: { $eq: ['$$eng', 'Medium'] }
            }
          }
        },
        lowEngagement: {
          $size: {
            $filter: {
              input: '$engagementBreakdown',
              as: 'eng',
              cond: { $eq: ['$$eng', 'Low'] }
            }
          }
        }
      }
    }
  ]);

  return summary;
};

// Static method to get individual student performance trend
StudentActivitySchema.statics.getStudentTrend = async function(studentId, academicYear) {
  const trend = await this.find(
    { studentId: new mongoose.Types.ObjectId(studentId), academicYear },
    'semester age attendancePercentage gpa failedSubjects backlogs assignmentCompletion internalAssessmentMarks examScore lmsActivityScore feePending counselingSessions submissionDate'
  )
  .sort({ semester: 1 })
  .lean();

  return trend;
};

// Static method to get ML-ready features for a student
StudentActivitySchema.statics.getMLFeatures = async function(studentId, academicYear, semester) {
  const query = { studentId: new mongoose.Types.ObjectId(studentId) };
  if (academicYear) query.academicYear = academicYear;
  if (semester) query.semester = semester;

  const activity = await this.findOne(query)
    .sort({ submissionDate: -1 })
    .lean();

  if (!activity) return null;

  return {
    age: activity.age || 20,
    attendance_percentage: activity.attendancePercentage || 0,
    current_gpa: activity.gpa || 0,
    failed_subjects: activity.failedSubjects || 0,
    backlogs: activity.backlogs || 0,
    assignment_completion_percentage: activity.assignmentCompletion || 0,
    internal_assessment_marks: activity.internalAssessmentMarks || 0,
    exam_score: activity.examScore || 0,
    lms_activity_score: activity.lmsActivityScore || 0,
    fee_pending: activity.feePending || 0,
    counseling_sessions: activity.counselingSessions || 0
  };
};

module.exports = mongoose.model('StudentActivity', StudentActivitySchema);