const express = require('express');
const router = express.Router();
const { 
  authMiddleware, 
  facultyOnly, 
  studentOnly,
  facultyOrStudent 
} = require('../middleware/auth');
const meetingController = require('../controllers/meetingController');

// All routes require authentication
router.use(authMiddleware);

// Meeting stats
router.get('/stats', meetingController.getMeetingStats);

// Send reminders (system route)
router.post('/send-reminders', meetingController.sendMeetingReminders);

// Student meetings
router.get(
  '/student/:studentId/upcoming', 
  studentOnly, 
  meetingController.getUpcomingStudentMeetings
);

router.get(
  '/student/:studentId',
  studentOnly,
  meetingController.getStudentMeetings
);

// Faculty meetings
router.get(
  '/faculty/:facultyId',
  facultyOnly,
  meetingController.getFacultyMeetings
);

// Schedule meeting - Only faculty
router.post(
  '/schedule',
  facultyOnly,
  meetingController.scheduleMeeting
);

// Meeting join details - Both faculty and student can join
router.get(
  '/:meetingId/join',
  facultyOrStudent,
  meetingController.getMeetingJoinDetails
);

// Meeting details - Both faculty and student can view
router.get(
  '/:meetingId',
  facultyOrStudent,
  meetingController.getMeetingDetails
);

// Cancel meeting - Only faculty
router.put(
  '/:meetingId/cancel',
  facultyOnly,
  meetingController.cancelMeeting
);

// Complete meeting - Only faculty
router.put(
  '/:meetingId/complete',
  facultyOnly,
  meetingController.completeMeeting
);

// Reschedule meeting - Only faculty
router.put(
  '/:meetingId/reschedule',
  facultyOnly,
  meetingController.rescheduleMeeting
);

module.exports = router;