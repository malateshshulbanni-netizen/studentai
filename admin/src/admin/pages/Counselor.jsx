import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
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
  UserPlus,
  Video,
  FileText,
  ArrowRight,
  ClipboardList,
  GraduationCap,
  Building2,
  Edit3,
  Save,
  Trash2,
  Send,
  Wand2
} from 'lucide-react';
import API_BASE_URL from '../../config/api';

const Counselor = () => {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCounselingModal, setShowCounselingModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [counselingNotes, setCounselingNotes] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [predictionResults, setPredictionResults] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    assigned: 0
  });
  const [assignedStudents, setAssignedStudents] = useState({});
  const [hoveredFaculty, setHoveredFaculty] = useState(null);
  const [institutionId, setInstitutionId] = useState(null);
  const [counselingHistory, setCounselingHistory] = useState({});
  const [isPolishing, setIsPolishing] = useState(false);
  const [studentActivities, setStudentActivities] = useState({});

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

  // Get logged-in user institution
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.institutionId) {
          setInstitutionId(user.institutionId);
        } else if (user.institution) {
          setInstitutionId(user.institution);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Fetch all students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        const studentList = data.data || [];
        setStudents(studentList);
        
        // Extract assigned faculty from student data
        const assignedMap = {};
        studentList.forEach(student => {
          if (student.assignedFaculty || student.facultyId) {
            const facultyId = student.assignedFaculty?._id || student.assignedFaculty || student.facultyId;
            if (facultyId) {
              assignedMap[student._id || student.id] = facultyId;
            }
          }
        });
        setAssignedStudents(assignedMap);
        
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

  // Fetch faculty list for the logged-in institution only
  const fetchFaculty = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/faculty`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        let facultyList = data.data || [];
        
        // Filter faculty by institution
        if (institutionId) {
          facultyList = facultyList.filter(f => {
            const fInstId = f.institutionId || f.institution || f.institution_id;
            return fInstId === institutionId || fInstId === institutionId.toString();
          });
        }
        
        setFaculty(facultyList);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  // Fetch predictions for all students
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

      setPredictionResults(results);
      setStats({
        total: studentList.length,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        assigned: Object.keys(assignedStudents).length
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
      await fetchFaculty();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (institutionId) {
      fetchStudents();
      fetchFaculty();
    }
  }, [institutionId]);

  // Get filtered students
  const getFilteredStudents = () => {
    let filtered = students;
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.usn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.branch?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter !== 'all') {
      filtered = filtered.filter(s => {
        const pred = predictionResults[s._id || s.id];
        return pred && pred.riskLevel === filter;
      });
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

  // Get recommendations based on risk level
  const getRecommendations = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'high') {
      return [
        'Schedule immediate one-on-one counseling session',
        'Assign a mentor for regular academic check-ins',
        'Create a personalized academic support plan',
        'Monitor attendance and performance on a daily basis',
        'Contact parents/guardians to discuss progress',
        'Provide additional learning resources and tutoring'
      ];
    } else if (level === 'medium') {
      return [
        'Monitor attendance and performance on a weekly basis',
        'Encourage participation in study groups and peer learning',
        'Provide additional academic resources and support materials',
        'Schedule regular progress review meetings',
        'Set achievable short-term academic goals'
      ];
    } else if (level === 'low') {
      return [
        'Continue regular monitoring of academic progress',
        'Encourage advanced learning opportunities',
        'Maintain engagement activities and participation',
        'Recognize and reward consistent performance'
      ];
    }
    return ['No recommendations available at this time'];
  };

  // Assign mentor to student
  const handleAssignFaculty = (student) => {
    setSelectedStudent(student);
    setShowAssignModal(true);
  };

  const confirmAssignFaculty = async () => {
    if (!selectedFaculty) {
      alert('Please select a faculty member');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Use the new counselor assign-faculty endpoint
      const response = await fetch(`${API_BASE_URL}/api/counselor/assign-faculty`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          facultyId: selectedFaculty
        })
      });

      const data = await response.json();

      if (response.ok) {
        setAssignedStudents({
          ...assignedStudents,
          [selectedStudent._id]: selectedFaculty
        });
        setShowAssignModal(false);
        setSelectedFaculty('');
        alert('Mentor assigned successfully!');
        await handleRefresh();
      } else {
        alert(data.message || 'Failed to assign mentor');
      }
    } catch (error) {
      console.error('Error assigning mentor:', error);
      alert('Error assigning mentor');
    }
  };

  // Open counseling modal
  const handleOpenCounseling = (student) => {
    setSelectedStudent(student);
    setCounselingNotes('');
    setEditingNoteId(null);
    setShowCounselingModal(true);
  };

  // AI Polish function - generates notes based on real student data
  const handleAIPolish = async () => {
    setIsPolishing(true);
    
    try {
      const studentId = selectedStudent._id;
      const student = selectedStudent;
      const prediction = predictionResults[studentId];
      const activity = studentActivities[studentId];
      
      const riskLevel = prediction?.riskLevel || 'Medium';
      const probability = prediction?.probability || 0;
      const attendance = activity?.attendancePercentage || prediction?.stats?.attendance || 0;
      const gpa = activity?.gpa || prediction?.stats?.gpa || 0;
      const backlogs = activity?.backlogs || prediction?.stats?.backlogs || 0;
      const assignmentCompletion = activity?.assignmentCompletion || prediction?.stats?.assignmentCompletion || 0;
      const engagement = activity?.engagement || prediction?.stats?.engagement || 'Medium';
      
      let defaultNotes = '';
      
      // Generate notes based on actual student data
      if (riskLevel === 'High') {
        defaultNotes = `Student ${student.name} (USN: ${student.usn}) has been identified as HIGH RISK based on the ML prediction model (${(probability * 100).toFixed(1)}% probability).

Current Academic Performance:
- Attendance: ${attendance}%
- GPA: ${gpa}
- Backlogs: ${backlogs}
- Assignment Completion: ${assignmentCompletion}%
- Engagement Level: ${engagement}

Key Observations:
${attendance < 75 ? '- Attendance is below 75% which requires immediate attention' : `- Attendance is at ${attendance}%`}
${gpa < 6 ? '- Academic performance shows significant decline' : `- GPA is ${gpa}`}
${backlogs > 0 ? `- ${backlogs} backlogs identified in core subjects` : '- No backlogs identified'}
${engagement === 'Low' ? '- Low engagement in class activities' : `- ${engagement} engagement in class activities`}

Recommended Actions for Mentor:
1. Schedule an immediate one-on-one counseling session with the student
2. Create a personalized academic support plan
3. Monitor attendance on a daily basis
4. Contact parents/guardians to discuss progress
5. Provide additional learning resources and tutoring support
6. Regular weekly progress review meetings

Follow-up: Review progress in 2 weeks and adjust intervention plan accordingly.`;
      } else if (riskLevel === 'Medium') {
        defaultNotes = `Student ${student.name} (USN: ${student.usn}) has been identified as MEDIUM RISK based on the ML prediction model (${(probability * 100).toFixed(1)}% probability).

Current Academic Performance:
- Attendance: ${attendance}%
- GPA: ${gpa}
- Backlogs: ${backlogs}
- Assignment Completion: ${assignmentCompletion}%
- Engagement Level: ${engagement}

Key Observations:
${attendance < 85 ? '- Attendance is below 85% which needs monitoring' : `- Attendance is at ${attendance}%`}
${gpa >= 6 && gpa < 8 ? '- Academic performance shows slight decline' : `- GPA is ${gpa}`}
${backlogs > 0 ? `- ${backlogs} backlogs identified` : '- No backlogs identified'}
${engagement === 'Medium' ? '- Moderate engagement in class activities' : `- ${engagement} engagement in class activities`}

Recommended Actions for Mentor:
1. Schedule a counseling session within the next week
2. Encourage participation in study groups
3. Provide additional academic resources and support materials
4. Monitor attendance on a weekly basis
5. Set achievable short-term academic goals

Follow-up: Review progress in 1 month and adjust support if needed.`;
      } else {
        defaultNotes = `Student ${student.name} (USN: ${student.usn}) has been identified as LOW RISK based on the ML prediction model (${(probability * 100).toFixed(1)}% probability).

Current Academic Performance:
- Attendance: ${attendance}%
- GPA: ${gpa}
- Backlogs: ${backlogs}
- Assignment Completion: ${assignmentCompletion}%
- Engagement Level: ${engagement}

Key Observations:
${attendance >= 85 ? '- Good attendance record above 85%' : `- Attendance is at ${attendance}%`}
${gpa >= 8 ? '- Satisfactory academic performance' : `- GPA is ${gpa}`}
${backlogs === 0 ? '- No major backlogs identified' : `- ${backlogs} backlogs identified`}
${engagement === 'High' || engagement === 'Medium' ? '- Active engagement in class activities' : `- ${engagement} engagement in class activities`}

Recommended Actions for Mentor:
1. Continue regular monitoring of academic progress
2. Encourage advanced learning opportunities
3. Maintain engagement activities and participation
4. Recognize and reward consistent performance

Follow-up: Regular check-ins to ensure continued progress.`;
      }

      setCounselingNotes(defaultNotes);
    } catch (error) {
      console.error('Error generating notes:', error);
      alert('Failed to generate notes. Please try again.');
    } finally {
      setIsPolishing(false);
    }
  };

  // Save counseling note
  const saveCounselingNote = async () => {
    if (!counselingNotes.trim()) {
      alert('Please add counseling notes');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const studentId = selectedStudent._id;
      
      const response = await fetch(`${API_BASE_URL}/api/counselor/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: studentId,
          notes: counselingNotes,
          status: 'Pending'
        })
      });

      const data = await response.json();

      if (response.ok) {
        const updatedHistory = { ...counselingHistory };
        if (!updatedHistory[studentId]) {
          updatedHistory[studentId] = [];
        }
        updatedHistory[studentId].push({
          _id: data.data?._id || Date.now().toString(),
          notes: counselingNotes,
          date: new Date().toLocaleDateString(),
          createdAt: data.data?.createdAt || new Date().toISOString()
        });
        setCounselingHistory(updatedHistory);
        setShowCounselingModal(false);
        setCounselingNotes('');
        alert('Counseling note sent successfully!');
        await handleRefresh();
      } else {
        alert(data.message || 'Failed to send counseling note');
      }
    } catch (error) {
      console.error('Error sending counseling note:', error);
      alert('Error sending counseling note');
    }
  };

  // Delete counseling note
  const deleteCounselingNote = async (studentId, noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/counselor/sessions/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedHistory = { ...counselingHistory };
        if (updatedHistory[studentId]) {
          updatedHistory[studentId] = updatedHistory[studentId].filter(n => n._id !== noteId);
          if (updatedHistory[studentId].length === 0) {
            delete updatedHistory[studentId];
          }
          setCounselingHistory(updatedHistory);
        }
        alert('Note deleted successfully!');
        await handleRefresh();
      } else {
        alert('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note');
    }
  };

  // View student details
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const statsData = [
    { icon: Users, label: 'Total Students', value: stats.total, color: '#EEF9FF' },
    { icon: UserX, label: 'High Risk', value: stats.high, color: '#FEE2E2' },
    { icon: Activity, label: 'Medium Risk', value: stats.medium, color: '#FEF3C7' },
    { icon: UserCheck, label: 'Low Risk', value: stats.low, color: '#DCFCE7' },
    { icon: UserPlus, label: 'Assigned', value: stats.assigned, color: '#E0F2FE' },
  ];

  // Get assigned faculty name with branch
  const getAssignedFacultyName = (studentId) => {
    const facultyId = assignedStudents[studentId];
    if (!facultyId) return null;
    
    const facultyMember = faculty.find(f => {
      const fId = f._id || f.id;
      return fId === facultyId || fId === facultyId.toString();
    });
    
    if (!facultyMember) {
      const student = students.find(s => (s._id || s.id) === studentId);
      if (student && student.assignedFaculty && student.assignedFaculty.name) {
        return {
          name: student.assignedFaculty.name,
          branch: student.assignedFaculty.branch || student.assignedFaculty.department || 'Faculty'
        };
      }
      return null;
    }
    
    return {
      name: facultyMember.name || facultyMember.fullName || 'Faculty',
      branch: facultyMember.branch || facultyMember.department || 'Faculty'
    };
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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#080C68] flex items-center gap-2">
            <MessageCircle className="text-[#00A9E0]" size={28} />
            Counselor Dashboard
          </h1>
          <p className="text-gray-500 mt-1">ML Risk Prediction → Intervention → Counseling</p>
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

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search students by name, USN, course or branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-[#00A9E0] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('High')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'High' 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            High Risk
          </button>
          <button
            onClick={() => setFilter('Medium')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'Medium' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Medium Risk
          </button>
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
            <Users size={32} className="mx-auto text-gray-300 mb-3 sm:w-[40px] sm:h-[40px]" />
            <p className="text-sm sm:text-base text-gray-500">
              {searchTerm ? 'No students found matching your search' : 'No students available'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="bg-[#F8FAFF] border-b border-gray-100">
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Student</th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">USN</th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Risk Level</th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Assigned Mentor</th>
                  <th className="text-center px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const id = student._id || student.id;
                  const prediction = predictionResults[id];
                  const riskLevel = prediction?.riskLevel || 'Unknown';
                  const assignedFaculty = getAssignedFacultyName(id);
                  const isHovered = hoveredFaculty === id;
                  const hasNotes = counselingHistory[id] && counselingHistory[id].length > 0;

                  return (
                    <tr key={id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
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
                        {assignedFaculty ? (
                          <div 
                            className={`transition-colors duration-200 ${isHovered ? 'bg-blue-50 rounded-lg p-2' : ''}`}
                            onMouseEnter={() => setHoveredFaculty(id)}
                            onMouseLeave={() => setHoveredFaculty(null)}
                          >
                            <p className="text-sm font-medium text-[#080C68]">{assignedFaculty.name}</p>
                            <p className="text-xs text-gray-500">{assignedFaculty.branch}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                          <button 
                            onClick={() => handleViewStudent(student)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye size={15} className="sm:w-4 sm:h-4" />
                          </button>
                          {(riskLevel === 'High' || riskLevel === 'Medium') && !assignedFaculty && (
                            <button 
                              onClick={() => handleAssignFaculty(student)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
                              title="Assign Mentor"
                            >
                              <UserPlus size={15} className="sm:w-4 sm:h-4" />
                            </button>
                          )}
                          {assignedFaculty && (
                            <button 
                              onClick={() => handleOpenCounseling(student)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-purple-600 hover:bg-purple-50 transition-colors relative"
                              title="Counseling Notes"
                            >
                              <FileText size={15} className="sm:w-4 sm:h-4" />
                              {hasNotes && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                              )}
                            </button>
                          )}
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

      {/* Assign Mentor Modal */}
      {showAssignModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#080C68]">Assign Mentor</h2>
              <button 
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedFaculty('');
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Assign a mentor to <span className="font-semibold text-[#080C68]">{selectedStudent.name}</span>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Mentor</label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
                >
                  <option value="">Select a mentor</option>
                  {faculty.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} - {f.branch || f.department || 'Faculty'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={confirmAssignFaculty}
                  className="flex-1 px-4 py-2.5 bg-[#00A9E0] text-white rounded-lg hover:bg-[#008FC2] transition-colors"
                >
                  Assign Mentor
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedFaculty('');
                  }}
                  className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Counseling Notes Modal */}
      {showCounselingModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-[#080C68] flex items-center gap-2">
                  <FileText size={20} className="text-purple-600" />
                  Counseling Notes
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedStudent.name} - {selectedStudent.usn}
                  {getAssignedFacultyName(selectedStudent._id) && (
                    <span className="ml-2 text-xs text-green-600">
                      Mentor: {getAssignedFacultyName(selectedStudent._id)?.name}
                    </span>
                  )}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowCounselingModal(false);
                  setCounselingNotes('');
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Add New Note */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Add New Note
                  </label>
                  <button
                    onClick={handleAIPolish}
                    disabled={isPolishing}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {isPolishing ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Wand2 size={14} />
                    )}
                    AI Polish
                  </button>
                </div>
                <textarea
                  value={counselingNotes}
                  onChange={(e) => setCounselingNotes(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors resize-none text-sm"
                  placeholder="Click 'AI Polish' to generate notes based on student's real data, or type your own notes..."
                />
                <button
                  onClick={saveCounselingNote}
                  disabled={!counselingNotes.trim()}
                  className="mt-2 px-6 py-2 bg-[#00A9E0] text-white rounded-lg hover:bg-[#008FC2] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  Send
                </button>
              </div>

              {/* Previous Notes */}
              {counselingHistory[selectedStudent._id] && counselingHistory[selectedStudent._id].length > 0 ? (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    Previous Notes ({counselingHistory[selectedStudent._id].length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {counselingHistory[selectedStudent._id].map((note, index) => (
                      <div key={note._id || index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.notes}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(note.date || note.createdAt)}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteCounselingNote(selectedStudent._id, note._id)}
                            className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Delete Note"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-4 text-center text-gray-500 text-sm">
                  No previous counseling notes
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00A9E0] flex items-center justify-center text-white font-bold">
                  {selectedStudent.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#080C68]">{selectedStudent.name}</h2>
                  <p className="text-sm text-gray-500">{selectedStudent.usn}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
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
                    <p className="text-xs text-gray-500">Assigned Mentor</p>
                    <p className="font-medium text-[#080C68]">
                      {getAssignedFacultyName(selectedStudent._id)?.name || 'Not assigned'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Prediction */}
              {predictionResults[selectedStudent._id || selectedStudent.id] && (
                <>
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

                  {/* Academic Stats */}
                  {predictionResults[selectedStudent._id || selectedStudent.id]?.stats && (
                    <div>
                      <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                        <BarChart3 size={16} className="text-[#00A9E0]" />
                        Academic Performance
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500">Attendance</p>
                          <p className="text-lg font-bold text-[#080C68]">
                            {predictionResults[selectedStudent._id || selectedStudent.id]?.stats?.attendance || 0}%
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500">GPA</p>
                          <p className="text-lg font-bold text-[#080C68]">
                            {predictionResults[selectedStudent._id || selectedStudent.id]?.stats?.gpa || 0}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500">Backlogs</p>
                          <p className="text-lg font-bold text-[#080C68]">
                            {predictionResults[selectedStudent._id || selectedStudent.id]?.stats?.backlogs || 0}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500">Assignments</p>
                          <p className="text-lg font-bold text-[#080C68]">
                            {predictionResults[selectedStudent._id || selectedStudent.id]?.stats?.assignmentCompletion || 0}%
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center col-span-2 md:col-span-1">
                          <p className="text-xs text-gray-500">Engagement</p>
                          <p className="text-lg font-bold text-[#080C68]">
                            {predictionResults[selectedStudent._id || selectedStudent.id]?.stats?.engagement || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {predictionResults[selectedStudent._id || selectedStudent.id] && (
                    <div>
                      <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-600" />
                        Counseling Recommendations
                      </h3>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <ul className="space-y-2">
                          {getRecommendations(
                            predictionResults[selectedStudent._id || selectedStudent.id]?.riskLevel
                          ).map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-purple-600 mt-0.5">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-3">
                    {!getAssignedFacultyName(selectedStudent._id) && 
                     (predictionResults[selectedStudent._id || selectedStudent.id]?.riskLevel === 'High' || 
                      predictionResults[selectedStudent._id || selectedStudent.id]?.riskLevel === 'Medium') && (
                      <button
                        onClick={() => {
                          setShowModal(false);
                          handleAssignFaculty(selectedStudent);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                      >
                        <UserPlus size={16} />
                        Assign Mentor
                      </button>
                    )}
                    {getAssignedFacultyName(selectedStudent._id) && (
                      <button
                        onClick={() => {
                          setShowModal(false);
                          handleOpenCounseling(selectedStudent);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                      >
                        <FileText size={16} />
                        Counseling Notes
                      </button>
                    )}
                  </div>
                </>
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

export default Counselor;