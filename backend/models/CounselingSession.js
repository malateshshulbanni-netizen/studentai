const mongoose = require('mongoose');

const CounselingSessionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentUsn: {
    type: String,
    required: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  facultyName: {
    type: String
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  notes: {
    type: String,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Unknown', 'N/A'],
    default: 'Unknown'
  },
  probability: {
    type: Number,
    default: 0
  },
  sessionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Follow-up Required'],
    default: 'Pending'
  },
  followUpDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
CounselingSessionSchema.index({ studentId: 1, createdAt: -1 });
CounselingSessionSchema.index({ institutionId: 1, createdAt: -1 });
CounselingSessionSchema.index({ facultyId: 1, createdAt: -1 });
CounselingSessionSchema.index({ riskLevel: 1 });

module.exports = mongoose.model('CounselingSession', CounselingSessionSchema);