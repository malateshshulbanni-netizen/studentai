import React, { useState, useEffect } from 'react';
import { 
  HandHelping,
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  AlertTriangle,
  Activity,
  Clock,
  Mail,
  Phone,
  Calendar,
  Loader2,
  RefreshCw,
  UserCheck,
  UserX,
  BarChart3,
  Sparkles,
  Brain,
  TrendingUp,
  X,
  FileText,
  ArrowRight,
  GraduationCap,
  Building2,
  Trash2,
  Send,
  Wand2,
  MessageCircle,
  UserPlus,
  Video,
  CalendarPlus
} from 'lucide-react';
import API_BASE_URL from '../../config/api';

const FacultyInterventions = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [predictionResults, setPredictionResults] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    interventions: 0
  });
  const [counselingHistory, setCounselingHistory] = useState({});
  const [studentActivities, setStudentActivities] = useState({});
  const [hoveredStudent, setHoveredStudent] = useState(null);
  const [facultyData, setFacultyData] = useState(null);

  // Schedule meeting form state
  const [meetingData, setMeetingData] = useState({
    title: '',
    description: '',
    meetingDate: '',
    meetingTime: '',
    duration: '30',
    studentId: '',
    studentName: '',
    studentEmail: ''
  });
  const [schedulingMeeting, setSchedulingMeeting] = useState(false);
  const [meetingError, setMeetingError] = useState('');
  const [meetingSuccess, setMeetingSuccess] = useState(false);

  // Helper function to map risk levels
  const getRiskLevel = (risk) => {
    if (typeof risk === 'number') {
      if (risk === 0) return 'Low';
      if (risk === 1) return 'Medium';
      if (risk === 2) return 'High';
      return 'Unknown';
    }
    if (typeof risk === 'string') {
      const lower = risk.toLowerCase();
      if (lower.includes('low')) return 'Low';
      if (lower.includes('medium')) return 'Medium';
      if (lower.includes('high')) return 'High';
      return 'Unknown';
    }
    return 'Unknown';
  };

  // Fetch faculty data
  const fetchFacultyData = async () => {
    try {
      const token = localStorage.getItem('token');
      const facultyId = localStorage.getItem('userId');
      
      if (!token || !facultyId) return;

      const response = await fetch(`${API_BASE_URL}/api/faculty/${facultyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFacultyData(data.data);
      }
    } catch (error) {
      console.error('Error fetching faculty data:', error);
    }
  };

  // Fetch students assigned to faculty
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/students/my-students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        const studentList = data.data || [];
        setStudents(studentList);
        await fetchPredictions(studentList);
        await fetchCounselingHistory(studentList);
        await fetchStudentActivities(studentList);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student activities
  const fetchStudentActivities = async (studentList) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const activities = {};
      for (const student of studentList) {
        const id = student._id || student.id;
        try {
          const response = await fetch(`${API_BASE_URL}/api/student-activities?studentId=${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.activities && data.data.activities.length > 0) {
              activities[id] = data.data.activities[0];
            }
          }
        } catch (error) {
          console.error(`Error fetching activities for student ${id}:`, error);
        }
      }
      setStudentActivities(activities);
    } catch (error) {
      console.error('Error fetching student activities:', error);
    }
  };

  // Fetch counseling history
  const fetchCounselingHistory = async (studentList) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const history = {};
      for (const student of studentList) {
        const id = student._id || student.id;
        try {
          const response = await fetch(`${API_BASE_URL}/api/counselor/sessions/student/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data.length > 0) {
              history[id] = data.data;
            }
          }
        } catch (error) {
          console.error(`Error fetching counseling history for student ${id}:`, error);
        }
      }
      setCounselingHistory(history);
    } catch (error) {
      console.error('Error fetching counseling history:', error);
    }
  };

  // Fetch predictions for students
  const fetchPredictions = async (studentList) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const results = {};
      let highCount = 0, mediumCount = 0, lowCount = 0;

      for (const student of studentList) {
        const id = student._id || student.id;
        try {
          const activitiesResponse = await fetch(`${API_BASE_URL}/api/student-activities?studentId=${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          let attendance = 0, gpa = 0, backlogs = 0, assignmentCompletion = 0, engagement = 'Medium';
          
          if (activitiesResponse.ok) {
            const activitiesData = await activitiesResponse.json();
            if (activitiesData.data && activitiesData.data.activities && activitiesData.data.activities.length > 0) {
              const latest = activitiesData.data.activities[0];
              attendance = latest.attendancePercentage || 0;
              gpa = latest.gpa || 0;
              backlogs = latest.backlogs || 0;
              assignmentCompletion = latest.assignmentCompletion || 0;
              engagement = latest.engagement || 'Medium';
            }
          }

          if (attendance > 0 || gpa > 0 || backlogs > 0 || assignmentCompletion > 0) {
            const payload = {
              attendance: attendance,
              gpa: gpa,
              backlogs: backlogs,
              assignment_completion: assignmentCompletion,
              engagement: engagement
            };

            const predictResponse = await fetch(`${API_BASE_URL}/api/predict`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });

            if (predictResponse.ok) {
              const predictData = await predictResponse.json();
              if (predictData.success) {
                const riskValue = predictData.data.risk_level || predictData.data.prediction || 'Low';
                const riskLevel = getRiskLevel(riskValue);
                
                results[id] = {
                  prediction: riskLevel,
                  probability: predictData.data.probability || 0,
                  riskLevel: riskLevel,
                  stats: {
                    attendance,
                    gpa,
                    backlogs,
                    assignmentCompletion,
                    engagement
                  }
                };

                if (riskLevel === 'High') highCount++;
                else if (riskLevel === 'Medium') mediumCount++;
                else if (riskLevel === 'Low') lowCount++;
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching prediction for student ${id}:`, error);
        }
      }

      // Count interventions (students with counseling history)
      const interventionCount = Object.keys(counselingHistory).length;

      setPredictionResults(results);
      setStats({
        total: studentList.length,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        interventions: interventionCount
      });

    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStudents();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchFacultyData();
    fetchStudents();
  }, []);

  // Get filtered students - ONLY show students with Active interventions (have counseling history)
  const getFilteredStudents = () => {
    let filtered = students.filter(s => {
      const id = s._id || s.id;
      const hasIntervention = counselingHistory[id] && counselingHistory[id].length > 0;
      return hasIntervention;
    });
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.usn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.branch?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredStudents = getFilteredStudents();

  // Get risk badge color
  const getRiskBadgeColor = (risk) => {
    const level = risk?.toLowerCase();
    if (level === 'high') return 'bg-red-100 text-red-700 border-red-200';
    if (level === 'medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (level === 'low') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getRiskIcon = (risk) => {
    const level = risk?.toLowerCase();
    if (level === 'high') return <AlertTriangle size={16} className="text-red-600" />;
    if (level === 'medium') return <Activity size={16} className="text-yellow-600" />;
    if (level === 'low') return <CheckCircle size={16} className="text-green-600" />;
    return <Activity size={16} className="text-gray-400" />;
  };

  // View student details (click on student row)
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  // View interventions (click on notes icon)
  const handleViewInterventions = (student) => {
    setSelectedStudent(student);
    setShowInterventionModal(true);
  };

  // Open schedule meeting modal
  const handleScheduleMeeting = (student) => {
    setSelectedStudent(student);
    setMeetingData({
      title: `Counseling Session - ${student.name}`,
      description: 'Intervention counseling session',
      meetingDate: '',
      meetingTime: '',
      duration: '30',
      studentId: student._id || student.id,
      studentName: student.name,
      studentEmail: student.email || ''
    });
    setMeetingError('');
    setMeetingSuccess(false);
    setShowScheduleModal(true);
  };

  // Schedule meeting
  const handleScheduleMeetingSubmit = async (e) => {
    e.preventDefault();
    setSchedulingMeeting(true);
    setMeetingError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMeetingError('You must be logged in');
        setSchedulingMeeting(false);
        return;
      }

      // Validate form
      if (!meetingData.title.trim()) {
        setMeetingError('Please enter a meeting title');
        setSchedulingMeeting(false);
        return;
      }

      if (!meetingData.meetingDate) {
        setMeetingError('Please select a meeting date');
        setSchedulingMeeting(false);
        return;
      }

      if (!meetingData.meetingTime) {
        setMeetingError('Please select a meeting time');
        setSchedulingMeeting(false);
        return;
      }

      // Create meeting payload
      const meetingPayload = {
        title: meetingData.title,
        description: meetingData.description || 'Intervention counseling session',
        date: meetingData.meetingDate,
        time: meetingData.meetingTime,
        duration: parseInt(meetingData.duration),
        studentId: meetingData.studentId,
        studentName: meetingData.studentName,
        studentEmail: meetingData.studentEmail,
        meetingType: 'intervention'  // Changed from 'type' to 'meetingType'
      };

      console.log('Sending meeting payload:', meetingPayload);

      const response = await fetch(`${API_BASE_URL}/api/meetings/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meetingPayload)
      });

      const data = await response.json();

      if (response.ok) {
        setMeetingSuccess(true);
        setTimeout(() => {
          setShowScheduleModal(false);
          setMeetingSuccess(false);
          // Refresh data
          fetchStudents();
        }, 2000);
      } else {
        setMeetingError(data.message || 'Failed to schedule meeting');
        console.error('Meeting schedule error:', data);
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      setMeetingError('Failed to schedule meeting. Please try again.');
    } finally {
      setSchedulingMeeting(false);
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const statsData = [
    { icon: Users, label: 'Total Students', value: stats.total, color: '#EEF9FF' },
    { icon: UserX, label: 'High Risk', value: stats.high, color: '#FEE2E2' },
    { icon: Activity, label: 'Medium Risk', value: stats.medium, color: '#FEF3C7' },
    { icon: UserCheck, label: 'Low Risk', value: stats.low, color: '#DCFCE7' },
    { icon: HandHelping, label: 'Active Interventions', value: stats.interventions, color: '#E0F2FE' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#080C68] flex items-center gap-2">
            <HandHelping className="text-[#00A9E0]" size={28} />
            Active Interventions
          </h1>
          <p className="text-gray-500 mt-1">View students with active intervention plans</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stat.color }}>
                <stat.icon size={16} className="text-[#00A9E0] sm:w-[20px] sm:h-[20px]" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-[#080C68]">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search students by name, USN, course or branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-96 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors text-sm"
          />
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 sm:p-10 text-center">
            <Loader2 size={32} className="mx-auto text-[#00A9E0] animate-spin sm:w-[40px] sm:h-[40px]" />
            <p className="mt-3 text-gray-500 text-sm">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 sm:p-10 text-center">
            <HandHelping size={32} className="mx-auto text-gray-300 mb-3 sm:w-[40px] sm:h-[40px]" />
            <p className="text-sm sm:text-base text-gray-500">
              {searchTerm ? 'No students found matching your search' : 'No active interventions'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Students with active intervention plans will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-[#F8FAFF] border-b border-gray-100">
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Student</th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">USN</th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Risk Level</th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Intervention Status</th>
                  <th className="text-center px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const id = student._id || student.id;
                  const prediction = predictionResults[id];
                  const riskLevel = prediction?.riskLevel || 'Unknown';
                  const hasIntervention = counselingHistory[id] && counselingHistory[id].length > 0;
                  const isHovered = hoveredStudent === id;

                  return (
                    <tr 
                      key={id} 
                      className={`border-b border-gray-100 last:border-0 transition-colors cursor-pointer ${isHovered ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      onMouseEnter={() => setHoveredStudent(id)}
                      onMouseLeave={() => setHoveredStudent(null)}
                      onClick={() => handleViewStudent(student)}
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div>
                          <p className="font-semibold text-[#080C68] text-sm sm:text-base">{student.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{student.email}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{student.usn}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          {getRiskIcon(riskLevel)}
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getRiskBadgeColor(riskLevel)}`}>
                            {riskLevel}
                          </span>
                          {prediction?.probability > 0 && (
                            <span className="text-xs text-gray-500">
                              {(prediction.probability * 100).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        {hasIntervention ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                            <CheckCircle size={12} className="inline mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewInterventions(student);
                            }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-purple-600 hover:bg-purple-50 transition-colors"
                            title="View Intervention Plans"
                          >
                            <FileText size={15} className="sm:w-4 sm:h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScheduleMeeting(student);
                            }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[#00A9E0] hover:bg-[#00A9E0]/10 transition-colors"
                            title="Schedule Meeting"
                          >
                            <CalendarPlus size={15} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Detail Modal (click on row) */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00A9E0] flex items-center justify-center text-white font-bold">
                  {selectedStudent.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#080C68]">Student Details</h2>
                  <p className="text-sm text-gray-500">{selectedStudent.name} - {selectedStudent.usn}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowStudentModal(false);
                  setSelectedStudent(null);
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Student Information */}
              <div>
                <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                  <Users size={16} className="text-[#00A9E0]" />
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium text-[#080C68]">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">USN</p>
                    <p className="font-medium text-[#080C68]">{selectedStudent.usn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-[#080C68]">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-[#080C68]">{selectedStudent.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Course</p>
                    <p className="font-medium text-[#080C68]">{selectedStudent.course}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Branch</p>
                    <p className="font-medium text-[#080C68]">{selectedStudent.branch}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Semester</p>
                    <p className="font-medium text-[#080C68]">Sem {selectedStudent.semester}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Intervention Status</p>
                    <p className="font-medium text-[#080C68]">
                      {counselingHistory[selectedStudent._id] && counselingHistory[selectedStudent._id].length > 0 ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-gray-500">Pending</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Prediction */}
              {predictionResults[selectedStudent._id || selectedStudent.id] && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                    <Brain size={16} className="text-purple-600" />
                    Risk Prediction
                  </h3>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getRiskIcon(predictionResults[selectedStudent._id || selectedStudent.id]?.riskLevel)}
                        <span className="font-medium text-gray-700">Risk Level:</span>
                        <span className={`px-3 py-1 text-sm rounded-full font-semibold ${getRiskBadgeColor(
                          predictionResults[selectedStudent._id || selectedStudent.id]?.riskLevel
                        )}`}>
                          {predictionResults[selectedStudent._id || selectedStudent.id]?.riskLevel || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Probability:</span>
                        <span className="text-lg font-bold text-[#080C68]">
                          {(predictionResults[selectedStudent._id || selectedStudent.id]?.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          predictionResults[selectedStudent._id || selectedStudent.id]?.riskLevel?.toLowerCase() === 'high' ? 'bg-red-500' :
                          predictionResults[selectedStudent._id || selectedStudent.id]?.riskLevel?.toLowerCase() === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ 
                          width: `${(predictionResults[selectedStudent._id || selectedStudent.id]?.probability || 0) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Meeting Button */}
              <div className="border-t border-gray-100 pt-4">
                <button
                  onClick={() => {
                    setShowStudentModal(false);
                    handleScheduleMeeting(selectedStudent);
                  }}
                  className="w-full py-3 bg-[#00A9E0] text-white rounded-lg hover:bg-[#0098C8] transition-colors flex items-center justify-center gap-2"
                >
                  <CalendarPlus size={20} />
                  Schedule Intervention Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Intervention Plans Modal (click on notes icon) */}
      {showInterventionModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00A9E0] flex items-center justify-center text-white font-bold">
                  {selectedStudent.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#080C68]">Intervention Plans</h2>
                  <p className="text-sm text-gray-500">{selectedStudent.name} - {selectedStudent.usn}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowInterventionModal(false);
                  setSelectedStudent(null);
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Student Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium text-[#080C68] text-sm">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">USN</p>
                  <p className="font-medium text-[#080C68] text-sm">{selectedStudent.usn}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Risk Level</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getRiskBadgeColor(
                    predictionResults[selectedStudent._id || selectedStudent.id]?.riskLevel
                  )}`}>
                    {predictionResults[selectedStudent._id || selectedStudent.id]?.riskLevel || 'Unknown'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  {counselingHistory[selectedStudent._id] && counselingHistory[selectedStudent._id].length > 0 ? (
                    <span className="text-xs font-semibold text-green-600">Active</span>
                  ) : (
                    <span className="text-xs font-semibold text-gray-500">Pending</span>
                  )}
                </div>
              </div>

              {/* Intervention Plans */}
              <div>
                <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                  <HandHelping size={16} className="text-purple-600" />
                  All Intervention Plans
                </h3>
                
                {counselingHistory[selectedStudent._id] && counselingHistory[selectedStudent._id].length > 0 ? (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {counselingHistory[selectedStudent._id].map((note, index) => (
                      <div key={note._id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-purple-600">
                            Plan #{index + 1}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(note.date || note.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HandHelping size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">No intervention plans found</p>
                    <p className="text-xs text-gray-400 mt-1">Admin will create intervention plans for students</p>
                  </div>
                )}
              </div>

              {/* Schedule Meeting Button */}
              <div className="border-t border-gray-100 pt-4">
                <button
                  onClick={() => {
                    setShowInterventionModal(false);
                    handleScheduleMeeting(selectedStudent);
                  }}
                  className="w-full py-3 bg-[#00A9E0] text-white rounded-lg hover:bg-[#0098C8] transition-colors flex items-center justify-center gap-2"
                >
                  <CalendarPlus size={20} />
                  Schedule Intervention Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00A9E0] flex items-center justify-center text-white font-bold">
                  <CalendarPlus size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#080C68]">Schedule Meeting</h2>
                  <p className="text-sm text-gray-500">{selectedStudent.name} - {selectedStudent.usn}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedStudent(null);
                  setMeetingError('');
                  setMeetingSuccess(false);
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {meetingSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-[#080C68] mb-2">Meeting Scheduled!</h3>
                  <p className="text-gray-500 text-sm">
                    Meeting with {selectedStudent.name} has been scheduled successfully.
                  </p>
                  <p className="text-gray-400 text-xs mt-2">Redirecting...</p>
                </div>
              ) : (
                <form onSubmit={handleScheduleMeetingSubmit} className="space-y-4">
                  {/* Meeting Title */}
                  <div>
                    <label className="block text-sm font-medium text-[#080C68] mb-1">
                      Meeting Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={meetingData.title}
                      onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors text-sm"
                      placeholder="e.g., Counseling Session - John Doe"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-[#080C68] mb-1">
                      Description
                    </label>
                    <textarea
                      value={meetingData.description}
                      onChange={(e) => setMeetingData({ ...meetingData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors text-sm resize-none"
                      rows="2"
                      placeholder="Brief description of the meeting purpose"
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#080C68] mb-1">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={meetingData.meetingDate}
                        onChange={(e) => setMeetingData({ ...meetingData, meetingDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors text-sm"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#080C68] mb-1">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={meetingData.meetingTime}
                        onChange={(e) => setMeetingData({ ...meetingData, meetingTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-[#080C68] mb-1">
                      Duration <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={meetingData.duration}
                      onChange={(e) => setMeetingData({ ...meetingData, duration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors text-sm"
                      required
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>

                  {/* Error Message */}
                  {meetingError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                      {meetingError}
                    </div>
                  )}

                  {/* Student Info (Read-only) */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Meeting with</p>
                    <p className="font-medium text-[#080C68]">{selectedStudent.name}</p>
                    <p className="text-xs text-gray-500">{selectedStudent.usn} • {selectedStudent.course}</p>
                    <p className="text-xs text-gray-500">{selectedStudent.email}</p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={schedulingMeeting}
                    className="w-full py-3 bg-[#00A9E0] text-white rounded-lg hover:bg-[#0098C8] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {schedulingMeeting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <CalendarPlus size={20} />
                        Schedule Meeting
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FacultyInterventions;