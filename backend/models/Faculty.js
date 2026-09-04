const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const facultySchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    dateOfJoining: {
      type: Date,
      required: [true, 'Date of joining is required'],
    },
    facultyType: {
      type: String,
      required: [true, 'Faculty type is required'],
      enum: ['Regular', 'Contract', 'Guest', 'Visiting', 'Part-Time'],
      default: 'Regular',
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
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
    active: {
      type: Boolean,
      default: true,
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
    officeLocation: {
      type: String,
      trim: true,
    },
    officeHours: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    expertise: [{
      type: String,
      trim: true
    }],
    socialLinks: {
      linkedin: String,
      twitter: String,
      website: String
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
    meetingSettings: {
      defaultDuration: {
        type: Number,
        default: 30,
        min: 5,
        max: 120
      },
      bufferTime: {
        type: Number,
        default: 5,
        min: 0,
        max: 30
      },
      autoAcceptMeetings: {
        type: Boolean,
        default: true
      }
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave', 'suspended'],
      default: 'active'
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
facultySchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
facultySchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from response
facultySchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ============================================
// NEW METHODS FOR MEETING SUPPORT
// ============================================

// Update last active timestamp
facultySchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Check if faculty is available for meeting
facultySchema.methods.isAvailable = function(date, time, duration) {
  // This will be used to check availability
  // Can be expanded to check existing meetings
  return this.status === 'active';
};

// Get faculty dashboard stats
facultySchema.methods.getDashboardStats = async function() {
  const Meeting = mongoose.model('Meeting');
  const Student = mongoose.model('Student');
  
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  
  const [totalStudents, upcomingMeetings, todayMeetings, totalMeetings] = await Promise.all([
    Student.countDocuments({ faculty: this._id }),
    Meeting.countDocuments({
      facultyId: this._id,
      status: 'scheduled',
      date: { $gte: today }
    }),
    Meeting.countDocuments({
      facultyId: this._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
      status: { $in: ['scheduled', 'live'] }
    }),
    Meeting.countDocuments({ facultyId: this._id })
  ]);
  
  return {
    totalStudents,
    upcomingMeetings,
    todayMeetings,
    totalMeetings
  };
};

// ============================================
// NEW VIRTUALS FOR MEETING SUPPORT
// ============================================

// Virtual for meetings (for populating)
facultySchema.virtual('meetings', {
  ref: 'Meeting',
  localField: '_id',
  foreignField: 'facultyId',
  options: { sort: { date: -1, time: -1 } }
});

// Virtual for upcoming meetings
facultySchema.virtual('upcomingMeetings', {
  ref: 'Meeting',
  localField: '_id',
  foreignField: 'facultyId',
  options: { 
    sort: { date: 1, time: 1 },
    match: { status: 'scheduled' }
  }
});

// Virtual for total students count
facultySchema.virtual('studentCount', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'faculty',
  count: true
});

// Virtual for full name with designation
facultySchema.virtual('displayName').get(function() {
  return `${this.fullName} (${this.designation})`;
});

// Virtual for short profile
facultySchema.virtual('shortProfile').get(function() {
  return {
    id: this._id,
    name: this.fullName,
    email: this.email,
    department: this.department,
    designation: this.designation,
    profileImage: this.profileImage
  };
});

// Ensure virtuals are included in JSON output
facultySchema.set('toJSON', { virtuals: true });
facultySchema.set('toObject', { virtuals: true });

const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;