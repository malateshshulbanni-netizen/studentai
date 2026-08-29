import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  FileText,
  Loader2,
  UserCheck,
  UserX,
  Calendar,
  BookOpen,
  GraduationCap,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  User,
  BarChart3,
  Target,
  Award,
  Book,
  ClipboardList,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../config/api';

const StudentData = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentStatsMap, setStudentStatsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [predictingStudentId, setPredictingStudentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentStats, setSelectedStudentStats] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [predictionResults, setPredictionResults] = useState({});
  const [filters, setFilters] = useState({
    course: '',
    semester: '',
    branch: '',
    status: ''
  });

  // Toast configuration
  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      width: '320px',
      minHeight: '60px',
      padding: '10px 16px',
      fontSize: '14px',
      borderRadius: '8px',
    },
  };

  // Helper function to map numeric risk to string
  const mapRiskLevel = (risk) => {
    if (typeof risk === 'number') {
      if (risk === 0) return 'Low Risk';
      if (risk === 1) return 'Medium Risk';
      if (risk === 2) return 'High Risk';
      return 'Unknown';
    }
    if (typeof risk === 'string') {
      const lower = risk.toLowerCase();
      if (lower.includes('low')) return 'Low Risk';
      if (lower.includes('medium')) return 'Medium Risk';
      if (lower.includes('high')) return 'High Risk';
      if (lower === '0') return 'Low Risk';
      if (lower === '1') return 'Medium Risk';
      if (lower === '2') return 'High Risk';
      return risk;
    }
    return 'Unknown';
  };

  // Helper function to get risk level for display
  const getRiskLevel = (risk) => {
    const mapped = mapRiskLevel(risk);
    if (mapped === 'Low Risk') return 'Low';
    if (mapped === 'Medium Risk') return 'Medium';
    if (mapped === 'High Risk') return 'High';
    return 'Unknown';
  };

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required', toastConfig);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/students/faculty/institution-students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        const studentList = data.data || [];
        setStudents(studentList);
        setFilteredStudents(studentList);
        
        await fetchAllStudentsStats(studentList);
        await fetchPredictions(studentList);
        
        toast.success(`Loaded ${studentList.length} students`, toastConfig);
      } else {
        toast.error(data.message || 'Failed to fetch students', toastConfig);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Network error. Please try again.', toastConfig);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats for all students
  const fetchAllStudentsStats = async (studentList) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const statsMap = {};
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
              const latestActivity = data.data.activities[0];
              statsMap[id] = {
                attendance: latestActivity.attendancePercentage || 0,
                engagement: latestActivity.engagement || 'Medium',
                gpa: latestActivity.gpa || 0,
                backlogs: latestActivity.backlogs || 0,
                assignmentCompletion: latestActivity.assignmentCompletion || 0,
                totalClasses: latestActivity.totalClasses || 0,
                attendedClasses: latestActivity.attendedClasses || 0,
                semester: latestActivity.semester || 'N/A',
                academicYear: latestActivity.academicYear || 'N/A',
                hasData: true
              };
            } else {
              statsMap[id] = {
                hasData: false,
                attendance: 0,
                engagement: 'N/A',
                gpa: 0,
                backlogs: 0,
                assignmentCompletion: 0
              };
            }
          } else {
            statsMap[id] = {
              hasData: false,
              attendance: 0,
              engagement: 'N/A',
              gpa: 0,
              backlogs: 0,
              assignmentCompletion: 0
            };
          }
        } catch (error) {
          console.error(`Error fetching stats for student ${id}:`, error);
          statsMap[id] = {
            hasData: false,
            attendance: 0,
            engagement: 'N/A',
            gpa: 0,
            backlogs: 0,
            assignmentCompletion: 0
          };
        }
      }
      setStudentStatsMap(statsMap);
    } catch (error) {
      console.error('Error fetching all students stats:', error);
    }
  };

  // Fetch predictions for students
  const fetchPredictions = async (studentList) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const results = {};
      for (const student of studentList) {
        const id = student._id || student.id;
        try {
          const response = await fetch(`${API_BASE_URL}/api/predict/student/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              // Map the risk level properly
              const riskValue = data.data.risk_level || data.data.prediction || 'Low';
              const mappedRisk = mapRiskLevel(riskValue);
              
              results[id] = {
                prediction: mappedRisk,
                probability: data.data.probability || 0,
                riskLevel: getRiskLevel(riskValue)
              };
            }
          }
        } catch (error) {
          console.error(`Error fetching prediction for student ${id}:`, error);
        }
      }
      setPredictionResults(results);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  // Handle Predict All
  const handlePredictAll = async () => {
    setPredicting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required', toastConfig);
        setPredicting(false);
        return;
      }

      toast.info('Running predictions for all students...', toastConfig);

      const results = {};
      let successCount = 0;
      let failCount = 0;

      for (const student of filteredStudents) {
        const id = student._id || student.id;
        const stats = studentStatsMap[id];
        
        if (!stats || !stats.hasData) {
          results[id] = {
            prediction: 'No Data',
            probability: 0,
            riskLevel: 'No Data'
          };
          failCount++;
          continue;
        }

        try {
          const payload = {
            attendance: stats.attendance || 0,
            gpa: stats.gpa || 0,
            backlogs: stats.backlogs || 0,
            assignment_completion: stats.assignmentCompletion || 0,
            engagement: stats.engagement || 'Medium'
          };

          console.log(`📤 Predicting for ${student.name}:`, payload);

          const response = await fetch(`${API_BASE_URL}/api/predict`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          
          const data = await response.json();
          
          if (response.ok && data.success) {
            const riskValue = data.data.risk_level || data.data.prediction || 'Low';
            const mappedRisk = mapRiskLevel(riskValue);
            
            results[id] = {
              prediction: mappedRisk,
              probability: data.data.probability || 0,
              riskLevel: getRiskLevel(riskValue)
            };
            successCount++;
          } else {
            results[id] = {
              prediction: 'Error',
              probability: 0,
              riskLevel: 'Unknown'
            };
            failCount++;
          }
        } catch (error) {
          console.error(`Error predicting for student ${id}:`, error);
          results[id] = {
            prediction: 'Error',
            probability: 0,
            riskLevel: 'Unknown'
          };
          failCount++;
        }
      }

      setPredictionResults(results);
      
      toast.success(
        `Predictions completed! Success: ${successCount}, Failed: ${failCount}`,
        toastConfig
      );
      
    } catch (error) {
      console.error('Error in predict all:', error);
      toast.error('Failed to run predictions. Please try again.', toastConfig);
    } finally {
      setPredicting(false);
    }
  };

  // Handle Predict Single Student
  const handlePredictSingle = async (studentId) => {
    setPredictingStudentId(studentId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required', toastConfig);
        setPredictingStudentId(null);
        return;
      }

      const stats = studentStatsMap[studentId];
      
      if (!stats || !stats.hasData) {
        toast.warning('No academic data found for this student. Please add data first.', toastConfig);
        setPredictionResults(prev => ({
          ...prev,
          [studentId]: {
            prediction: 'No Data',
            probability: 0,
            riskLevel: 'No Data'
          }
        }));
        setPredictingStudentId(null);
        return;
      }

      toast.info('Running prediction...', toastConfig);

      const payload = {
        attendance: stats.attendance || 0,
        gpa: stats.gpa || 0,
        backlogs: stats.backlogs || 0,
        assignment_completion: stats.assignmentCompletion || 0,
        engagement: stats.engagement || 'Medium'
      };

      console.log(`📤 Predicting for student:`, payload);

      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        const riskValue = data.data.risk_level || data.data.prediction || 'Low';
        const mappedRisk = mapRiskLevel(riskValue);
        
        const result = {
          prediction: mappedRisk,
          probability: data.data.probability || 0,
          riskLevel: getRiskLevel(riskValue)
        };
        
        setPredictionResults(prev => ({
          ...prev,
          [studentId]: result
        }));
        
        toast.success(`Prediction completed: ${result.prediction}`, toastConfig);
      } else {
        toast.error(data.message || 'Failed to predict for this student', toastConfig);
      }
    } catch (error) {
      console.error('Error predicting student:', error);
      toast.error('Failed to run prediction', toastConfig);
    } finally {
      setPredictingStudentId(null);
    }
  };

  // Fetch student stats for details view
  const fetchStudentStatsForView = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await fetch(`${API_BASE_URL}/api/student-activities?studentId=${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.activities && data.data.activities.length > 0) {
          const latestActivity = data.data.activities[0];
          return {
            attendance: latestActivity.attendancePercentage || 0,
            engagement: latestActivity.engagement || 'Medium',
            gpa: latestActivity.gpa || 0,
            backlogs: latestActivity.backlogs || 0,
            assignmentCompletion: latestActivity.assignmentCompletion || 0,
            totalClasses: latestActivity.totalClasses || 0,
            attendedClasses: latestActivity.attendedClasses || 0,
            semester: latestActivity.semester || 'N/A',
            academicYear: latestActivity.academicYear || 'N/A',
            hasData: true
          };
        }
      }
      return {
        hasData: false,
        attendance: 0,
        engagement: 'N/A',
        gpa: 0,
        backlogs: 0,
        assignmentCompletion: 0
      };
    } catch (error) {
      console.error('Error fetching student stats:', error);
      return {
        hasData: false,
        attendance: 0,
        engagement: 'N/A',
        gpa: 0,
        backlogs: 0,
        assignmentCompletion: 0
      };
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle search and filters
  useEffect(() => {
    let result = [...students];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student => 
        student.name?.toLowerCase().includes(term) ||
        student.usn?.toLowerCase().includes(term) ||
        student.email?.toLowerCase().includes(term)
      );
    }

    if (filters.course) {
      result = result.filter(student => student.course === filters.course);
    }

    if (filters.semester) {
      result = result.filter(student => student.semester === filters.semester);
    }

    if (filters.branch) {
      result = result.filter(student => student.branch === filters.branch);
    }

    setFilteredStudents(result);
  }, [searchTerm, filters, students]);

  const getUniqueValues = (key) => {
    const values = students.map(s => s[key]).filter(Boolean);
    return [...new Set(values)];
  };

  const courses = getUniqueValues('course');
  const semesters = getUniqueValues('semester');
  const branches = getUniqueValues('branch');

  // View student details with stats
  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
    
    const id = student._id || student.id;
    const stats = await fetchStudentStatsForView(id);
    setSelectedStudentStats(stats);
  };

  // Get risk color
  const getRiskColor = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'high' || level === 'high risk') {
      return 'text-red-600 bg-red-50';
    } else if (level === 'medium' || level === 'medium risk') {
      return 'text-yellow-600 bg-yellow-50';
    } else if (level === 'low' || level === 'low risk') {
      return 'text-green-600 bg-green-50';
    } else if (level === 'no data') {
      return 'text-gray-600 bg-gray-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  const getRiskIcon = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'high' || level === 'high risk') {
      return <TrendingDown size={16} className="text-red-600" />;
    } else if (level === 'medium' || level === 'medium risk') {
      return <Activity size={16} className="text-yellow-600" />;
    } else if (level === 'low' || level === 'low risk') {
      return <TrendingUp size={16} className="text-green-600" />;
    } else if (level === 'no data') {
      return <AlertCircle size={16} className="text-gray-600" />;
    }
    return <AlertCircle size={16} className="text-gray-600" />;
  };

  // Get engagement color
  const getEngagementColor = (engagement) => {
    switch(engagement?.toLowerCase()) {
      case 'high':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Get attendance color
  const getAttendanceColor = (attendance) => {
    if (attendance >= 75) return 'text-green-600';
    if (attendance >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get risk badge color for table
  const getRiskBadgeColor = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'high' || level === 'high risk') {
      return 'bg-red-100 text-red-700 border-red-200';
    } else if (level === 'medium' || level === 'medium risk') {
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    } else if (level === 'low' || level === 'low risk') {
      return 'bg-green-100 text-green-700 border-green-200';
    } else if (level === 'no data') {
      return 'bg-gray-100 text-gray-600 border-gray-200';
    }
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // Stats
  const stats = [
    { 
      icon: Users, 
      label: 'Total Students', 
      value: filteredStudents.length, 
      color: '#EEF9FF',
      iconColor: '#00A9E0'
    },
    { 
      icon: UserCheck, 
      label: 'Active Students', 
      value: filteredStudents.filter(s => s.status !== 'inactive').length, 
      color: '#DCFCE7',
      iconColor: '#22C55E'
    },
    { 
      icon: UserX, 
      label: 'Inactive Students', 
      value: filteredStudents.filter(s => s.status === 'inactive').length, 
      color: '#FEE2E2',
      iconColor: '#EF4444'
    },
    { 
      icon: Brain, 
      label: 'Predicted', 
      value: Object.keys(predictionResults).filter(id => predictionResults[id]?.prediction !== 'No Data' && predictionResults[id]?.prediction !== 'Error').length, 
      color: '#FEF3C7',
      iconColor: '#F59E0B'
    },
  ];

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ width: '320px' }}
        toastStyle={{
          minHeight: '60px',
          padding: '10px 16px',
          fontSize: '14px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#080C68]">Student Data</h1>
          <p className="text-gray-500 mt-1">Manage and view all student information with risk predictions</p>
        </div>
        <button 
          onClick={handlePredictAll}
          disabled={predicting || filteredStudents.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-sm disabled:opacity-70"
        >
          {predicting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Predicting...
            </>
          ) : (
            <>
              <Brain size={20} />
              Predict All
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stat.color }}>
                <stat.icon size={16} className="sm:w-[20px] sm:h-[20px]" style={{ color: stat.iconColor }} />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-[#080C68]">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, USN, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.course}
              onChange={(e) => setFilters({...filters, course: e.target.value})}
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors bg-white text-sm"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>

            <select
              value={filters.semester}
              onChange={(e) => setFilters({...filters, semester: e.target.value})}
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors bg-white text-sm"
            >
              <option value="">All Semesters</option>
              {semesters.map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>

            <select
              value={filters.branch}
              onChange={(e) => setFilters({...filters, branch: e.target.value})}
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors bg-white text-sm"
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>

            {(filters.course || filters.semester || filters.branch || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ course: '', semester: '', branch: '', status: '' });
                }}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="bg-[#080C68] text-white">
                <th className="text-left px-4 py-3 text-xs font-semibold sticky left-0 bg-[#080C68] min-w-[120px] z-10">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold min-w-[100px]">USN</th>
                <th className="text-center px-4 py-3 text-xs font-semibold min-w-[100px]">Attendance %</th>
                <th className="text-center px-4 py-3 text-xs font-semibold min-w-[100px]">Engagement</th>
                <th className="text-center px-4 py-3 text-xs font-semibold min-w-[80px]">GPA</th>
                <th className="text-center px-4 py-3 text-xs font-semibold min-w-[80px]">Backlogs</th>
                <th className="text-center px-4 py-3 text-xs font-semibold min-w-[100px]">Assignment %</th>
                <th className="text-center px-4 py-3 text-xs font-semibold min-w-[120px]">Predicted Risk</th>
                <th className="text-center px-4 py-3 text-xs font-semibold min-w-[100px]">Probability</th>
                <th className="text-center px-4 py-3 text-xs font-semibold min-w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-8">
                    <Loader2 size={32} className="animate-spin mx-auto text-[#00A9E0]" />
                    <p className="text-gray-500 mt-2">Loading students...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8">
                    <Users size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No students found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const id = student._id || student.id;
                  const stats = studentStatsMap[id];
                  const prediction = predictionResults[id];
                  const hasData = stats?.hasData || false;
                  const isPredicting = predictingStudentId === id;
                  
                  return (
                    <tr key={id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-[#080C68] sticky left-0 bg-white z-10">
                        {student.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.usn}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasData ? (
                          <span className={`text-sm font-semibold ${getAttendanceColor(stats.attendance)}`}>
                            {stats.attendance}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No data</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasData ? (
                          <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getEngagementColor(stats.engagement)}`}>
                            {stats.engagement}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No data</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasData ? (
                          <span className="text-sm font-semibold text-[#080C68]">
                            {stats.gpa.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No data</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasData ? (
                          <span className={`text-sm font-semibold ${stats.backlogs > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {stats.backlogs}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No data</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasData ? (
                          <span className={`text-sm font-semibold ${stats.assignmentCompletion >= 80 ? 'text-green-600' : stats.assignmentCompletion >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {stats.assignmentCompletion}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No data</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {prediction ? (
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold ${getRiskColor(prediction.riskLevel)} inline-flex items-center gap-1`}>
                            {getRiskIcon(prediction.riskLevel)}
                            {prediction.prediction || prediction.riskLevel || 'Unknown'}
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePredictSingle(id)}
                            disabled={isPredicting || !hasData}
                            className={`px-3 py-1 text-xs rounded-full transition ${
                              isPredicting 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : !hasData 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                            }`}
                          >
                            {isPredicting ? (
                              <Loader2 size={12} className="animate-spin inline" />
                            ) : !hasData ? (
                              'No Data'
                            ) : (
                              'Predict'
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {prediction && prediction.probability > 0 ? (
                          <span className="text-sm font-semibold text-[#080C68]">
                            {(prediction.probability * 100).toFixed(1)}%
                          </span>
                        ) : prediction?.prediction === 'No Data' ? (
                          <span className="text-xs text-gray-400">-</span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewStudent(student)}
                            className="p-1.5 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg transition"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-[#080C68]">{filteredStudents.length}</span> of{' '}
            <span className="font-semibold text-[#080C68]">{students.length}</span> students
            {Object.keys(predictionResults).filter(id => predictionResults[id]?.prediction !== 'No Data' && predictionResults[id]?.prediction !== 'Error').length > 0 && (
              <span className="ml-4 text-purple-600">
                • <span className="font-semibold">{Object.keys(predictionResults).filter(id => predictionResults[id]?.prediction !== 'No Data' && predictionResults[id]?.prediction !== 'Error').length}</span> predictions completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#080C68]">Student Details</h2>
              <button
                onClick={() => {
                  setShowStudentDetails(false);
                  setSelectedStudentStats(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <XCircle size={24} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Personal Information */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                  <User size={16} className="text-[#00A9E0]" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-[#00A9E0]" />
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="text-gray-900">{selectedStudent.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#00A9E0]" />
                    <span className="font-medium text-gray-700">USN:</span>
                    <span className="text-gray-900">{selectedStudent.usn}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-[#00A9E0]" />
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="text-gray-900">{selectedStudent.email || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-[#00A9E0]" />
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="text-gray-900">{selectedStudent.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-[#00A9E0]" />
                    <span className="font-medium text-gray-700">Course:</span>
                    <span className="text-gray-900">{selectedStudent.course || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#00A9E0]" />
                    <span className="font-medium text-gray-700">Semester:</span>
                    <span className="text-gray-900">{selectedStudent.semester || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-[#00A9E0]" />
                    <span className="font-medium text-gray-700">Branch:</span>
                    <span className="text-gray-900">{selectedStudent.branch || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Academic Performance */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#00A9E0]" />
                  Academic Performance
                </h3>
                {selectedStudentStats ? (
                  selectedStudentStats.hasData ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                          <Target size={14} />
                          <span className="text-xs font-medium">Attendance</span>
                        </div>
                        <p className={`text-lg font-bold ${getAttendanceColor(selectedStudentStats.attendance)}`}>
                          {selectedStudentStats.attendance}%
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {selectedStudentStats.attendedClasses}/{selectedStudentStats.totalClasses} classes
                        </p>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                          <Award size={14} />
                          <span className="text-xs font-medium">Engagement</span>
                        </div>
                        <p className={`text-lg font-bold ${getEngagementColor(selectedStudentStats.engagement)}`}>
                          {selectedStudentStats.engagement}
                        </p>
                      </div>

                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                          <Book size={14} />
                          <span className="text-xs font-medium">GPA</span>
                        </div>
                        <p className="text-lg font-bold text-[#080C68]">
                          {selectedStudentStats.gpa.toFixed(1)}
                        </p>
                        <p className="text-[10px] text-gray-500">out of 10</p>
                      </div>

                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                          <AlertCircle size={14} />
                          <span className="text-xs font-medium">Backlogs</span>
                        </div>
                        <p className={`text-lg font-bold ${selectedStudentStats.backlogs > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {selectedStudentStats.backlogs}
                        </p>
                      </div>

                      <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                          <ClipboardList size={14} />
                          <span className="text-xs font-medium">Assignment %</span>
                        </div>
                        <p className={`text-lg font-bold ${selectedStudentStats.assignmentCompletion >= 80 ? 'text-green-600' : selectedStudentStats.assignmentCompletion >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {selectedStudentStats.assignmentCompletion}%
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 rounded-lg p-8 text-center border border-yellow-200">
                      <AlertCircle size={32} className="mx-auto text-yellow-500 mb-2" />
                      <p className="text-sm font-medium text-yellow-700">No academic data found</p>
                      <p className="text-xs text-yellow-600 mt-1">This student doesn't have any activity records yet.</p>
                    </div>
                  )
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Loader2 size={24} className="animate-spin mx-auto text-[#00A9E0] mb-2" />
                    <p className="text-sm text-gray-500">Loading academic performance data...</p>
                  </div>
                )}
              </div>

              {/* Risk Prediction */}
              {predictionResults[selectedStudent._id || selectedStudent.id] && (
                <div>
                  <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                    <Brain size={16} className="text-purple-600" />
                    Risk Prediction
                  </h3>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getRiskIcon(predictionResults[selectedStudent._id || selectedStudent.id]?.riskLevel)}
                        <span className="font-medium text-gray-700">Risk Level:</span>
                        <span className={`px-3 py-1 text-sm rounded-full font-semibold ${getRiskColor(
                          predictionResults[selectedStudent._id || selectedStudent.id]?.riskLevel
                        )}`}>
                          {predictionResults[selectedStudent._id || selectedStudent.id]?.prediction || 'Unknown'}
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
                    {/* Recommendations */}
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <h4 className="text-sm font-medium text-[#080C68] flex items-center gap-2">
                        <Sparkles size={14} className="text-[#00A9E0]" />
                        Recommendations
                      </h4>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        {predictionResults[selectedStudent._id || selectedStudent.id]?.riskLevel?.toLowerCase() === 'high' ? (
                          <>
                            <li>• Schedule immediate counseling session</li>
                            <li>• Assign a mentor for regular check-ins</li>
                            <li>• Create personalized academic support plan</li>
                            <li>• Monitor attendance and performance daily</li>
                          </>
                        ) : predictionResults[selectedStudent._id || selectedStudent.id]?.riskLevel?.toLowerCase() === 'medium' ? (
                          <>
                            <li>• Monitor attendance and performance weekly</li>
                            <li>• Encourage participation in study groups</li>
                            <li>• Provide additional academic resources</li>
                          </>
                        ) : predictionResults[selectedStudent._id || selectedStudent.id]?.riskLevel?.toLowerCase() === 'low' ? (
                          <>
                            <li>• Continue regular monitoring</li>
                            <li>• Encourage advanced learning opportunities</li>
                            <li>• Maintain engagement activities</li>
                          </>
                        ) : (
                          <li>• No recommendations available</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowStudentDetails(false);
                  setSelectedStudentStats(null);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg transition">
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentData;