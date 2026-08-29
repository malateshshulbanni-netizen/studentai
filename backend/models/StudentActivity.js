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
  attendancePercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  engagement: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  gpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  backlogs: {
    type: Number,
    min: 0,
    default: 0
  },
  assignmentCompletion: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
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
        averageAssignmentCompletion: { $avg: '$assignmentCompletion' },
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
        averageAssignmentCompletion: { $round: ['$averageAssignmentCompletion', 1] },
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
    'semester attendancePercentage gpa backlogs assignmentCompletion submissionDate'
  )
  .sort({ semester: 1 })
  .lean();

  return trend;
};

module.exports = mongoose.model('StudentActivity', StudentActivitySchema);