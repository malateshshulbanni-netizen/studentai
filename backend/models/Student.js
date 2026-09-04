const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    usn: {
      type: String,
      required: [true, 'USN/Roll No is required'],
      trim: true,
      unique: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true,
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      trim: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: [true, 'Institution ID is required'],
    },
    institutionName: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'N/A'],
      default: 'N/A',
    },
    riskProbability: {
      type: Number,
      default: 0,
    },
    assignedFaculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // ============================================
    // NEW FIELDS FOR MEETING SUPPORT
    // ============================================
    profileImage: {
      type: String,
      default: null
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    guardianName: {
      type: String,
      trim: true,
    },
    guardianPhone: {
      type: String,
      match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    guardianEmail: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    meetingPreferences: {
      preferredTimeSlots: [{
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        startTime: String,
        endTime: String
      }],
      timezone: {
        type: String,
        default: 'Asia/Kolkata'
      }
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'graduated'],
      default: 'active'
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    // Additional academic info
    academicYear: {
      type: String,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
studentSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
studentSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from response
studentSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ============================================
// NEW METHODS FOR MEETING SUPPORT
// ============================================

// Update last active timestamp
studentSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Get student dashboard stats
studentSchema.methods.getDashboardStats = async function() {
  const Meeting = mongoose.model('Meeting');
  
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  
  const [upcomingMeetings, todayMeetings, totalMeetings] = await Promise.all([
    Meeting.countDocuments({
      studentId: this._id,
      status: 'scheduled',
      date: { $gte: today }
    }),
    Meeting.countDocuments({
      studentId: this._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
      status: { $in: ['scheduled', 'live'] }
    }),
    Meeting.countDocuments({ studentId: this._id })
  ]);
  
  return {
    upcomingMeetings,
    todayMeetings,
    totalMeetings
  };
};

// Check if student has upcoming meetings
studentSchema.methods.hasUpcomingMeetings = async function() {
  const Meeting = mongoose.model('Meeting');
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  
  const count = await Meeting.countDocuments({
    studentId: this._id,
    status: 'scheduled',
    date: { $gte: today }
  });
  
  return count > 0;
};

// Get student's full name with USN
studentSchema.virtual('fullDisplayName').get(function() {
  return `${this.name} (${this.usn})`;
});

// ============================================
// NEW VIRTUALS FOR MEETING SUPPORT
// ============================================

// Virtual for meetings (for populating)
studentSchema.virtual('meetings', {
  ref: 'Meeting',
  localField: '_id',
  foreignField: 'studentId',
  options: { sort: { date: -1, time: -1 } }
});

// Virtual for upcoming meetings
studentSchema.virtual('upcomingMeetings', {
  ref: 'Meeting',
  localField: '_id',
  foreignField: 'studentId',
  options: { 
    sort: { date: 1, time: 1 },
    match: { status: 'scheduled' }
  }
});

// Virtual for live meetings
studentSchema.virtual('liveMeetings', {
  ref: 'Meeting',
  localField: '_id',
  foreignField: 'studentId',
  options: { 
    sort: { date: 1, time: 1 },
    match: { status: 'live' }
  }
});

// Virtual for completed meetings
studentSchema.virtual('completedMeetings', {
  ref: 'Meeting',
  localField: '_id',
  foreignField: 'studentId',
  options: { 
    sort: { date: -1, time: -1 },
    match: { status: 'completed' }
  }
});

// Virtual for short profile
studentSchema.virtual('shortProfile').get(function() {
  return {
    id: this._id,
    name: this.name,
    usn: this.usn,
    email: this.email,
    course: this.course,
    branch: this.branch,
    semester: this.semester,
    riskLevel: this.riskLevel,
    profileImage: this.profileImage
  };
});

// Ensure virtuals are included in JSON output
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;