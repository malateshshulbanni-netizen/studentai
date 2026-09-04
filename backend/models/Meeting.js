const mongoose = require('mongoose');

// Helper function to generate room ID
const generateRoomId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const counter = Math.floor(Math.random() * 1000).toString(36);
  return `intervention-${timestamp}-${random}-${counter}`;
};

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true,
    maxlength: [100, 'Meeting title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Meeting date is required']
  },
  time: {
    type: String,
    required: [true, 'Meeting time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  duration: {
    type: Number,
    required: [true, 'Meeting duration is required'],
    min: [5, 'Duration must be at least 5 minutes'],
    max: [240, 'Duration cannot exceed 240 minutes'],
    default: 30
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  studentEmail: {
    type: String,
    required: [true, 'Student email is required'],
    lowercase: true,
    trim: true
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required']
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: [true, 'Faculty ID is required']
  },
  facultyEmail: {
    type: String,
    required: [true, 'Faculty email is required'],
    lowercase: true,
    trim: true
  },
  facultyName: {
    type: String,
    required: [true, 'Faculty name is required']
  },
  meetingType: {
    type: String,
    enum: ['intervention', 'regular', 'emergency'],
    default: 'intervention'
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled', 'missed'],
    default: 'scheduled'
  },
  roomId: {
    type: String,
    unique: true,
    default: generateRoomId  // Auto-generate if not provided
  },
  joinLink: {
    type: String,
    default: function() {
      return `https://meet.jit.si/${this.roomId}`;
    }
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  actualDuration: {
    type: Number
  },
  notes: {
    type: String,
    trim: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', null],
    default: null
  },
  parentMeetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
meetingSchema.index({ studentId: 1, date: -1 });
meetingSchema.index({ facultyId: 1, date: -1 });
meetingSchema.index({ status: 1, date: 1 });
meetingSchema.index({ startTime: 1 });

// Helper function to get meeting datetime
meetingSchema.methods.getMeetingDateTime = function() {
  const meetingDateTime = new Date(this.date);
  if (this.time) {
    const [hours, minutes] = this.time.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      meetingDateTime.setHours(hours, minutes, 0, 0);
    }
  }
  return meetingDateTime;
};

// Helper function to get end datetime
meetingSchema.methods.getEndDateTime = function() {
  const start = this.getMeetingDateTime();
  return new Date(start.getTime() + this.duration * 60000);
};

// Virtual for checking if meeting is upcoming
meetingSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const meetingDateTime = this.getMeetingDateTime();
  return this.status === 'scheduled' && meetingDateTime > now;
});

// Virtual for checking if meeting is live
meetingSchema.virtual('isLive').get(function() {
  const now = new Date();
  const meetingDateTime = this.getMeetingDateTime();
  const endDateTime = this.getEndDateTime();
  return this.status === 'live' || (this.status === 'scheduled' && meetingDateTime <= now && endDateTime > now);
});

// Virtual for checking if meeting is completed
meetingSchema.virtual('isCompleted').get(function() {
  const now = new Date();
  const endDateTime = this.getEndDateTime();
  return this.status === 'completed' || (this.status === 'scheduled' && endDateTime < now);
});

// Virtual for formatted date and time
meetingSchema.virtual('formattedDate').get(function() {
  if (!this.date) return 'N/A';
  try {
    return this.date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
});

meetingSchema.virtual('formattedTime').get(function() {
  if (!this.time) return 'N/A';
  return this.time;
});

// Method to check if a user can join
meetingSchema.methods.canJoin = function(userId, userType) {
  const now = new Date();
  const meetingDateTime = this.getMeetingDateTime();
  const endDateTime = this.getEndDateTime();
  
  // Allow joining 10 minutes before start and 5 minutes after end
  const joinWindowStart = new Date(meetingDateTime.getTime() - 10 * 60000);
  const joinWindowEnd = new Date(endDateTime.getTime() + 5 * 60000);

  if (this.status === 'cancelled') return false;
  if (this.status === 'completed') return false;
  if (this.status === 'missed') return false;
  if (now < joinWindowStart) return false;
  if (now > joinWindowEnd) return false;

  // Check if user is authorized
  const studentIdStr = this.studentId.toString();
  const facultyIdStr = this.facultyId.toString();
  
  const userIdStr = userId.toString();
  
  if (userType === 'student' && studentIdStr === userIdStr) {
    return true;
  }
  if (userType === 'faculty' && facultyIdStr === userIdStr) {
    return true;
  }
  return false;
};

// Method to auto-update meeting status
meetingSchema.methods.updateStatus = function() {
  const now = new Date();
  const meetingDateTime = this.getMeetingDateTime();
  const endDateTime = this.getEndDateTime();

  // Check if meeting is live
  if (meetingDateTime <= now && endDateTime > now && this.status === 'scheduled') {
    this.status = 'live';
    this.startTime = now;
    return true;
  }
  
  // Check if meeting is completed
  if (endDateTime < now && this.status === 'live') {
    this.status = 'completed';
    this.endTime = now;
    if (this.startTime) {
      this.actualDuration = Math.round((now - this.startTime) / 60000);
    }
    return true;
  }

  // Check if scheduled meeting time passed without starting
  if (endDateTime < now && this.status === 'scheduled') {
    this.status = 'missed';
    return true;
  }

  return false;
};

// Method to check if meeting is joinable now
meetingSchema.methods.isJoinable = function() {
  const now = new Date();
  const meetingDateTime = this.getMeetingDateTime();
  const endDateTime = this.getEndDateTime();
  
  // Allow joining 10 minutes before start and 5 minutes after end
  const joinWindowStart = new Date(meetingDateTime.getTime() - 10 * 60000);
  const joinWindowEnd = new Date(endDateTime.getTime() + 5 * 60000);
  
  return this.status !== 'cancelled' && 
         this.status !== 'completed' && 
         this.status !== 'missed' &&
         now >= joinWindowStart && 
         now <= joinWindowEnd;
};

// Ensure virtuals are included in JSON output
meetingSchema.set('toJSON', { virtuals: true });
meetingSchema.set('toObject', { virtuals: true });

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;