const Meeting = require('../models/Meeting');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const mongoose = require('mongoose');

// Helper function to generate room ID
const generateRoomId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const counter = Math.floor(Math.random() * 1000).toString(36);
  return `intervention-${timestamp}-${random}-${counter}`;
};

// @desc    Schedule a meeting
// @route   POST /api/meetings/schedule
// @access  Private (Faculty only)
exports.scheduleMeeting = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      time, 
      duration, 
      studentId, 
      studentName,
      studentEmail,
      meetingType,
      isRecurring,
      recurrencePattern
    } = req.body;

    // Get faculty ID from authenticated user
    const facultyId = req.user.id;

    console.log('Faculty ID from token:', facultyId);
    console.log('Request body:', req.body);

    // Validate input
    if (!title || !date || !time || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, date, time, and student ID'
      });
    }

    // Check if faculty exists
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    console.log('Faculty found:', faculty.fullName, faculty.email);

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    console.log('Student found:', student.name, student.email);

    // Get faculty and student details
    const facultyEmail = faculty.email || req.user.email || 'faculty@example.com';
    const facultyName = faculty.fullName || faculty.name || req.user.name || 'Faculty';
    const studentEmailValue = studentEmail || student.email || 'student@example.com';
    const studentNameValue = studentName || student.name || 'Student';

    // Validate date (can't schedule in the past)
    const meetingDate = new Date(date);
    const [hours, minutes] = time.split(':');
    meetingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (meetingDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule meeting in the past'
      });
    }

    // Check if faculty already has a meeting at this time
    const existingMeeting = await Meeting.findOne({
      facultyId: facultyId,
      date: new Date(date),
      time: time,
      status: { $in: ['scheduled', 'live'] }
    });

    if (existingMeeting) {
      return res.status(400).json({
        success: false,
        message: 'You already have a meeting scheduled at this time'
      });
    }

    // Generate room ID and join link
    const roomId = generateRoomId();
    const joinLink = `https://meet.jit.si/${roomId}`;

    console.log('Generated roomId:', roomId);
    console.log('Generated joinLink:', joinLink);

    // Create meeting object with all required fields
    const meetingData = {
      title,
      description: description || '',
      date: new Date(date),
      time,
      duration: duration || 30,
      studentId,
      studentEmail: studentEmailValue,
      studentName: studentNameValue,
      facultyId,
      facultyEmail: facultyEmail,
      facultyName: facultyName,
      meetingType: meetingType || 'intervention',
      createdBy: facultyId,
      status: 'scheduled',
      isRecurring: isRecurring || false,
      recurrencePattern: recurrencePattern || null,
      roomId: roomId,  // Explicitly set
      joinLink: joinLink  // Explicitly set
    };

    console.log('Meeting data to save:', meetingData);

    // Create meeting
    const meeting = new Meeting(meetingData);
    await meeting.save();

    console.log('Meeting saved successfully:', meeting._id);

    // If recurring, create child meetings
    if (isRecurring && recurrencePattern) {
      await createRecurringMeetings(meeting, recurrencePattern);
    }

    // Populate the meeting with student and faculty details
    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('studentId', 'name usn email course branch semester')
      .populate('facultyId', 'fullName email department')
      .populate('createdBy', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Meeting scheduled successfully',
      data: populatedMeeting
    });

  } catch (error) {
    console.error('Error scheduling meeting:', error);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to schedule meeting',
      error: error.message
    });
  }
};

// Helper function to create recurring meetings
async function createRecurringMeetings(parentMeeting, pattern) {
  const meetings = [];
  const startDate = new Date(parentMeeting.date);
  const numMeetings = pattern === 'daily' ? 7 : 
                     pattern === 'weekly' ? 4 : 
                     pattern === 'biweekly' ? 2 : 3;

  for (let i = 1; i < numMeetings; i++) {
    const newDate = new Date(startDate);
    if (pattern === 'daily') {
      newDate.setDate(newDate.getDate() + i);
    } else if (pattern === 'weekly') {
      newDate.setDate(newDate.getDate() + (i * 7));
    } else if (pattern === 'biweekly') {
      newDate.setDate(newDate.getDate() + (i * 14));
    } else if (pattern === 'monthly') {
      newDate.setMonth(newDate.getMonth() + i);
    }

    const roomId = generateRoomId();
    const joinLink = `https://meet.jit.si/${roomId}`;

    const meetingData = {
      title: `${parentMeeting.title} (Session ${i + 1})`,
      description: parentMeeting.description,
      date: newDate,
      time: parentMeeting.time,
      duration: parentMeeting.duration,
      studentId: parentMeeting.studentId,
      studentEmail: parentMeeting.studentEmail,
      studentName: parentMeeting.studentName,
      facultyId: parentMeeting.facultyId,
      facultyEmail: parentMeeting.facultyEmail,
      facultyName: parentMeeting.facultyName,
      meetingType: parentMeeting.meetingType,
      createdBy: parentMeeting.facultyId,
      status: 'scheduled',
      isRecurring: false,
      parentMeetingId: parentMeeting._id,
      roomId: roomId,
      joinLink: joinLink
    };

    const meeting = await Meeting.create(meetingData);
    meetings.push(meeting);
  }

  return meetings;
}

// @desc    Get all meetings for a student
// @route   GET /api/meetings/student/:studentId
// @access  Private (Student only)
exports.getStudentMeetings = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;

    // Check if the requesting user is the student
    if (req.user.id !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view these meetings'
      });
    }

    // Build query
    const query = { studentId: studentId };
    if (status) {
      query.status = status;
    }

    // Get meetings and auto-update statuses
    const meetings = await Meeting.find(query)
      .populate('studentId', 'name usn email course branch semester')
      .populate('facultyId', 'fullName email department')
      .populate('createdBy', 'fullName email')
      .sort({ date: -1, time: -1 });

    // Update statuses for each meeting
    for (const meeting of meetings) {
      meeting.updateStatus();
      await meeting.save();
    }

    // Categorize meetings
    const upcoming = meetings.filter(m => m.status === 'scheduled' && m.isUpcoming);
    const live = meetings.filter(m => m.status === 'live' || m.isLive);
    const completed = meetings.filter(m => m.status === 'completed' || m.isCompleted);
    const cancelled = meetings.filter(m => m.status === 'cancelled');
    const missed = meetings.filter(m => m.status === 'missed');

    res.status(200).json({
      success: true,
      count: meetings.length,
      data: {
        all: meetings,
        upcoming,
        live,
        completed,
        cancelled,
        missed,
        summary: {
          total: meetings.length,
          upcoming: upcoming.length,
          live: live.length,
          completed: completed.length,
          cancelled: cancelled.length,
          missed: missed.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching student meetings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meetings',
      error: error.message
    });
  }
};

// @desc    Get all meetings for a faculty
// @route   GET /api/meetings/faculty/:facultyId
// @access  Private (Faculty only)
exports.getFacultyMeetings = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { status } = req.query;

    // Check if the requesting user is the faculty
    if (req.user.id !== facultyId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view these meetings'
      });
    }

    // Build query
    const query = { facultyId: facultyId };
    if (status) {
      query.status = status;
    }

    const meetings = await Meeting.find(query)
      .populate('studentId', 'name usn email course branch semester')
      .populate('facultyId', 'fullName email department')
      .populate('createdBy', 'fullName email')
      .sort({ date: -1, time: -1 });

    // Update statuses for each meeting
    for (const meeting of meetings) {
      meeting.updateStatus();
      await meeting.save();
    }

    // Categorize meetings
    const upcoming = meetings.filter(m => m.status === 'scheduled' && m.isUpcoming);
    const live = meetings.filter(m => m.status === 'live' || m.isLive);
    const completed = meetings.filter(m => m.status === 'completed' || m.isCompleted);
    const cancelled = meetings.filter(m => m.status === 'cancelled');
    const missed = meetings.filter(m => m.status === 'missed');

    res.status(200).json({
      success: true,
      count: meetings.length,
      data: {
        all: meetings,
        upcoming,
        live,
        completed,
        cancelled,
        missed,
        summary: {
          total: meetings.length,
          upcoming: upcoming.length,
          live: live.length,
          completed: completed.length,
          cancelled: cancelled.length,
          missed: missed.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching faculty meetings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meetings',
      error: error.message
    });
  }
};

// @desc    Get meeting details by ID
// @route   GET /api/meetings/:meetingId
// @access  Private (Faculty or Student involved)
exports.getMeetingDetails = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findById(meetingId)
      .populate('studentId', 'name usn email course branch semester phone')
      .populate('facultyId', 'fullName email department')
      .populate('createdBy', 'fullName email');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check if user is authorized to view this meeting
    const userId = req.user.id;
    const userRole = req.user.role;
    const studentIdStr = meeting.studentId._id.toString();
    const facultyIdStr = meeting.facultyId._id.toString();

    if (userRole === 'student' && userId !== studentIdStr) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this meeting'
      });
    }

    if (userRole === 'faculty' && userId !== facultyIdStr) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this meeting'
      });
    }

    // Update status
    meeting.updateStatus();
    await meeting.save();

    res.status(200).json({
      success: true,
      data: meeting
    });

  } catch (error) {
    console.error('Error fetching meeting details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meeting details',
      error: error.message
    });
  }
};

// @desc    Get meeting room details for joining
// @route   GET /api/meetings/:meetingId/join
// @access  Private (Faculty or Student involved)
exports.getMeetingJoinDetails = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check if user can join
    const userId = req.user.id;
    const userRole = req.user.role;
    const canJoin = meeting.canJoin(userId, userRole);

    if (!canJoin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to join this meeting or it is not available'
      });
    }

    // Update status to live if it's scheduled and within time
    const now = new Date();
    const meetingDateTime = new Date(meeting.date);
    const [hours, minutes] = meeting.time.split(':');
    meetingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const endDateTime = new Date(meetingDateTime.getTime() + meeting.duration * 60000);

    if (meetingDateTime <= now && endDateTime > now && meeting.status === 'scheduled') {
      meeting.status = 'live';
      meeting.startTime = now;
      await meeting.save();
    }

    // Check again after status update
    if (meeting.status === 'cancelled' || meeting.status === 'completed' || meeting.status === 'missed') {
      return res.status(403).json({
        success: false,
        message: `This meeting is ${meeting.status} and cannot be joined`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        roomId: meeting.roomId,
        joinLink: meeting.joinLink,
        title: meeting.title,
        studentName: meeting.studentName,
        facultyName: meeting.facultyName,
        date: meeting.date,
        time: meeting.time,
        duration: meeting.duration,
        status: meeting.status
      }
    });

  } catch (error) {
    console.error('Error getting meeting join details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get meeting join details',
      error: error.message
    });
  }
};

// @desc    Cancel a meeting
// @route   PUT /api/meetings/:meetingId/cancel
// @access  Private (Faculty who created the meeting)
exports.cancelMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { reason } = req.body;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check if user is authorized to cancel
    const userId = req.user.id;
    const facultyIdStr = meeting.facultyId.toString();

    if (userId !== facultyIdStr && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the faculty who created this meeting can cancel it'
      });
    }

    // Check if meeting can be cancelled
    if (meeting.status === 'completed' || meeting.status === 'missed') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${meeting.status} meeting`
      });
    }

    // Update meeting status
    meeting.status = 'cancelled';
    meeting.notes = reason || meeting.notes || 'Meeting cancelled';
    await meeting.save();

    // If this is a recurring meeting, also cancel future meetings
    if (meeting.isRecurring && meeting.parentMeetingId) {
      await Meeting.updateMany(
        { 
          parentMeetingId: meeting.parentMeetingId,
          date: { $gte: meeting.date },
          status: 'scheduled'
        },
        { 
          status: 'cancelled',
          notes: `Cancelled due to: ${reason || 'No reason provided'}`
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Meeting cancelled successfully',
      data: meeting
    });

  } catch (error) {
    console.error('Error cancelling meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel meeting',
      error: error.message
    });
  }
};

// @desc    Complete a meeting
// @route   PUT /api/meetings/:meetingId/complete
// @access  Private (Faculty only)
exports.completeMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { notes } = req.body;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check if user is authorized
    const userId = req.user.id;
    const facultyIdStr = meeting.facultyId.toString();

    if (userId !== facultyIdStr && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the faculty can complete this meeting'
      });
    }

    // Update meeting
    meeting.status = 'completed';
    meeting.endTime = new Date();
    if (meeting.startTime) {
      meeting.actualDuration = Math.round((new Date() - meeting.startTime) / 60000);
    }
    if (notes) {
      meeting.notes = notes;
    }
    await meeting.save();

    res.status(200).json({
      success: true,
      message: 'Meeting completed successfully',
      data: meeting
    });

  } catch (error) {
    console.error('Error completing meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete meeting',
      error: error.message
    });
  }
};

// @desc    Reschedule a meeting
// @route   PUT /api/meetings/:meetingId/reschedule
// @access  Private (Faculty only)
exports.rescheduleMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { date, time, duration } = req.body;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check if user is authorized
    const userId = req.user.id;
    const facultyIdStr = meeting.facultyId.toString();

    if (userId !== facultyIdStr && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the faculty can reschedule this meeting'
      });
    }

    // Validate new date
    if (date) {
      const newDate = new Date(date);
      const [hours, minutes] = (time || meeting.time).split(':');
      newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (newDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot reschedule to a past time'
        });
      }
    }

    // Update meeting
    if (date) meeting.date = new Date(date);
    if (time) meeting.time = time;
    if (duration) meeting.duration = duration;
    
    // Reset status if it was cancelled or missed
    if (meeting.status === 'cancelled' || meeting.status === 'missed') {
      meeting.status = 'scheduled';
    }

    await meeting.save();

    res.status(200).json({
      success: true,
      message: 'Meeting rescheduled successfully',
      data: meeting
    });

  } catch (error) {
    console.error('Error rescheduling meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule meeting',
      error: error.message
    });
  }
};

// @desc    Get upcoming meetings for a student (dashboard)
// @route   GET /api/meetings/student/:studentId/upcoming
// @access  Private (Student only)
exports.getUpcomingStudentMeetings = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check authorization
    if (req.user.id !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    const meetings = await Meeting.find({
      studentId: studentId,
      status: { $in: ['scheduled', 'live'] },
      date: { $gte: today }
    })
      .populate('facultyId', 'fullName email department')
      .populate('studentId', 'name usn email')
      .sort({ date: 1, time: 1 })
      .limit(10);

    // Update statuses
    for (const meeting of meetings) {
      meeting.updateStatus();
      await meeting.save();
    }

    res.status(200).json({
      success: true,
      count: meetings.length,
      data: meetings
    });

  } catch (error) {
    console.error('Error fetching upcoming meetings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming meetings',
      error: error.message
    });
  }
};

// @desc    Get meeting stats for dashboard
// @route   GET /api/meetings/stats
// @access  Private
exports.getMeetingStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = {};
    if (userRole === 'student') {
      query.studentId = userId;
    } else if (userRole === 'faculty') {
      query.facultyId = userId;
    }

    const meetings = await Meeting.find(query);

    // Update statuses
    for (const meeting of meetings) {
      meeting.updateStatus();
      await meeting.save();
    }

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    const stats = {
      total: meetings.length,
      upcoming: meetings.filter(m => m.status === 'scheduled' && m.isUpcoming).length,
      live: meetings.filter(m => m.status === 'live' || m.isLive).length,
      completed: meetings.filter(m => m.status === 'completed' || m.isCompleted).length,
      cancelled: meetings.filter(m => m.status === 'cancelled').length,
      missed: meetings.filter(m => m.status === 'missed').length,
      today: meetings.filter(m => {
        const meetingDate = new Date(m.date);
        const meetingDay = new Date(meetingDate.setHours(0, 0, 0, 0));
        return meetingDay.getTime() === today.getTime() && 
               (m.status === 'scheduled' || m.status === 'live');
      }).length,
      upcomingThisWeek: meetings.filter(m => {
        const meetingDate = new Date(m.date);
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return m.status === 'scheduled' && 
               meetingDate >= today && 
               meetingDate <= weekFromNow;
      }).length
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching meeting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meeting stats',
      error: error.message
    });
  }
};

// @desc    Send reminder for upcoming meetings
// @route   POST /api/meetings/send-reminders
// @access  Private (System)
exports.sendMeetingReminders = async (req, res) => {
  try {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now

    const meetings = await Meeting.find({
      status: 'scheduled',
      date: reminderTime,
      reminderSent: false
    })
      .populate('studentId', 'name email')
      .populate('facultyId', 'fullName email');

    for (const meeting of meetings) {
      // Send reminder logic here
      // This could integrate with email service, SMS, or push notifications
      
      meeting.reminderSent = true;
      meeting.reminderSentAt = now;
      await meeting.save();
    }

    res.status(200).json({
      success: true,
      message: `Reminders sent for ${meetings.length} meetings`,
      data: meetings
    });

  } catch (error) {
    console.error('Error sending reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reminders',
      error: error.message
    });
  }
};