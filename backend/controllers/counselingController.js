const CounselingSession = require('../models/CounselingSession');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// Helper function to validate risk level
const validateRiskLevel = (riskLevel) => {
  const validLevels = ['Low', 'Medium', 'High', 'Unknown'];
  if (!riskLevel || riskLevel === 'N/A' || !validLevels.includes(riskLevel)) {
    return 'Unknown';
  }
  return riskLevel;
};

// ==================== COUNSELING SESSIONS ====================

// Get all counseling sessions
const getSessions = async (req, res) => {
  try {
    const { studentId, facultyId, status, startDate, endDate, riskLevel } = req.query;
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const query = { institutionId: user.institutionId };
    
    if (studentId) query.studentId = studentId;
    if (facultyId) query.facultyId = facultyId;
    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sessions = await CounselingSession.find(query)
      .sort({ createdAt: -1 })
      .populate('studentId', 'name email usn course branch semester')
      .populate('facultyId', 'name email department branch');

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching counseling sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counseling sessions',
      error: error.message
    });
  }
};

// Get counseling sessions for a specific student
const getStudentSessions = async (req, res) => {
  try {
    const { studentId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const sessions = await CounselingSession.find({
      studentId: studentId,
      institutionId: user.institutionId
    })
      .sort({ createdAt: -1 })
      .populate('facultyId', 'name email department branch');

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching student counseling sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student counseling sessions',
      error: error.message
    });
  }
};

// Get a single counseling session
const getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const session = await CounselingSession.findById(sessionId)
      .populate('studentId', 'name email usn course branch semester')
      .populate('facultyId', 'name email department branch');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Counseling session not found' });
    }

    if (session.institutionId.toString() !== user.institutionId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error fetching counseling session:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counseling session',
      error: error.message
    });
  }
};

// Create a new counseling session
const createSession = async (req, res) => {
  try {
    const { studentId, notes, status, followUpDate } = req.body;
    const user = req.user;

    if (!studentId || !notes) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and notes are required'
      });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get assigned faculty from student
    let facultyId = null;
    let facultyName = null;
    if (student.assignedFaculty) {
      const assignedFaculty = await Faculty.findById(student.assignedFaculty);
      if (assignedFaculty) {
        facultyId = assignedFaculty._id;
        facultyName = assignedFaculty.name;
      }
    }

    // VALIDATE RISK LEVEL - This is the fix
    let riskLevel = student.riskLevel || 'Unknown';
    // If riskLevel is 'N/A' or not in enum, set to 'Unknown'
    const validRiskLevels = ['Low', 'Medium', 'High', 'Unknown'];
    if (riskLevel === 'N/A' || !validRiskLevels.includes(riskLevel)) {
      riskLevel = 'Unknown';
    }
    const probability = student.riskProbability || 0;

    console.log('Risk Level being saved:', riskLevel); // Debug log

    const session = new CounselingSession({
      studentId: studentId,
      studentName: student.name,
      studentUsn: student.usn,
      facultyId: facultyId,
      facultyName: facultyName,
      institutionId: user.institutionId,
      notes: notes,
      riskLevel: riskLevel,
      probability: probability,
      status: status || 'Pending',
      followUpDate: followUpDate || null,
      createdBy: user._id || user.id
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: 'Counseling session created successfully',
      data: session
    });
  } catch (error) {
    console.error('Error creating counseling session:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating counseling session',
      error: error.message
    });
  }
};

// Update a counseling session
const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { notes, status, followUpDate } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const session = await CounselingSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Counseling session not found' });
    }

    if (session.institutionId.toString() !== user.institutionId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (notes) session.notes = notes;
    if (status) session.status = status;
    if (followUpDate) session.followUpDate = followUpDate;
    session.updatedAt = new Date();

    await session.save();

    res.json({
      success: true,
      message: 'Counseling session updated successfully',
      data: session
    });
  } catch (error) {
    console.error('Error updating counseling session:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating counseling session',
      error: error.message
    });
  }
};

// Delete a counseling session
const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const session = await CounselingSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Counseling session not found' });
    }

    if (session.institutionId.toString() !== user.institutionId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await session.deleteOne();

    res.json({
      success: true,
      message: 'Counseling session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting counseling session:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting counseling session',
      error: error.message
    });
  }
};

// ==================== STATISTICS ====================

// Get counseling statistics
const getStatistics = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const institutionId = user.institutionId;

    const totalSessions = await CounselingSession.countDocuments({ institutionId });
    const pendingSessions = await CounselingSession.countDocuments({ institutionId, status: 'Pending' });
    const completedSessions = await CounselingSession.countDocuments({ institutionId, status: 'Completed' });
    const followUpSessions = await CounselingSession.countDocuments({ institutionId, status: 'Follow-up Required' });
    const highRiskSessions = await CounselingSession.countDocuments({ institutionId, riskLevel: 'High' });
    const mediumRiskSessions = await CounselingSession.countDocuments({ institutionId, riskLevel: 'Medium' });
    const lowRiskSessions = await CounselingSession.countDocuments({ institutionId, riskLevel: 'Low' });
    const assignedStudents = await Student.countDocuments({ institutionId, assignedFaculty: { $ne: null } });

    const recentSessions = await CounselingSession.find({ institutionId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('studentId', 'name email usn')
      .populate('facultyId', 'name email');

    res.json({
      success: true,
      data: {
        totalSessions,
        pendingSessions,
        completedSessions,
        followUpSessions,
        highRiskSessions,
        mediumRiskSessions,
        lowRiskSessions,
        assignedStudents,
        recentSessions
      }
    });
  } catch (error) {
    console.error('Error fetching counseling statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counseling statistics',
      error: error.message
    });
  }
};

// Get student risk distribution
const getRiskDistribution = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const institutionId = user.institutionId;
    const students = await Student.find({ institutionId });
    
    const riskDistribution = { High: 0, Medium: 0, Low: 0, Unknown: 0 };

    students.forEach(student => {
      let level = student.riskLevel || 'Unknown';
      if (level === 'N/A' || !['Low', 'Medium', 'High', 'Unknown'].includes(level)) {
        level = 'Unknown';
      }
      riskDistribution[level] = (riskDistribution[level] || 0) + 1;
    });

    res.json({
      success: true,
      data: riskDistribution
    });
  } catch (error) {
    console.error('Error fetching risk distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching risk distribution',
      error: error.message
    });
  }
};

// Get faculty assignment statistics
const getFacultyAssignmentStats = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const institutionId = user.institutionId;
    const students = await Student.find({
      institutionId,
      assignedFaculty: { $ne: null }
    }).populate('assignedFaculty', 'name');

    const facultyStats = {};
    students.forEach(student => {
      const facultyName = student.assignedFaculty?.name || 'Unknown';
      facultyStats[facultyName] = (facultyStats[facultyName] || 0) + 1;
    });

    res.json({
      success: true,
      data: facultyStats
    });
  } catch (error) {
    console.error('Error fetching faculty assignment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty assignment stats',
      error: error.message
    });
  }
};

// Assign faculty to student
const assignFacultyToStudent = async (req, res) => {
  try {
    const { studentId, facultyId } = req.body;
    const user = req.user;

    if (!studentId || !facultyId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Faculty ID are required'
      });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const assignedFaculty = await Faculty.findById(facultyId);
    if (!assignedFaculty) {
      return res.status(404).json({ success: false, message: 'Assigned faculty not found' });
    }

    // Assign faculty to student
    student.assignedFaculty = facultyId;
    await student.save();

    // VALIDATE RISK LEVEL
    let riskLevel = student.riskLevel || 'Unknown';
    const validRiskLevels = ['Low', 'Medium', 'High', 'Unknown'];
    if (riskLevel === 'N/A' || !validRiskLevels.includes(riskLevel)) {
      riskLevel = 'Unknown';
    }
    const probability = student.riskProbability || 0;

    // Create a counseling session record for the assignment
    const session = new CounselingSession({
      studentId: studentId,
      studentName: student.name,
      studentUsn: student.usn,
      facultyId: facultyId,
      facultyName: assignedFaculty.name,
      institutionId: user.institutionId,
      notes: `Mentor ${assignedFaculty.name} assigned to student ${student.name}`,
      riskLevel: riskLevel,
      probability: probability,
      status: 'Pending',
      createdBy: user._id || user.id
    });

    await session.save();

    res.json({
      success: true,
      message: 'Faculty assigned successfully',
      data: {
        student: student,
        faculty: assignedFaculty,
        session: session
      }
    });
  } catch (error) {
    console.error('Error assigning faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning faculty',
      error: error.message
    });
  }
};

// ==================== EXPORTS ====================

module.exports = {
  getSessions,
  getStudentSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  assignFacultyToStudent,
  getStatistics,
  getRiskDistribution,
  getFacultyAssignmentStats
};