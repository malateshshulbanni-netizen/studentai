import React, { useState, useEffect } from 'react';
import { 
  Activity,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
  Plus,
  Search,
  Filter,
  X,
  Loader2,
  ArrowLeft,
  Building2,
  GraduationCap,
  User,
  Mail,
  Phone,
  Brain,
  TrendingUp,
  BarChart3,
  Eye,
  UserCheck,
  UserX,
  XCircle,
  Save,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../config/api';

const Activities = () => {
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [institution, setInstitution] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [submittedStudents, setSubmittedStudents] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [formData, setFormData] = useState({
    course: '',
    semester: '',
    branch: '',
  });

  const [studentStats, setStudentStats] = useState({});

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

  // Fetch existing student activity data from database
  const fetchExistingActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('📤 Fetching existing activities from database...');
      const response = await fetch(`${API_BASE_URL}/api/student-activities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Existing activities from DB:', data);
        
        if (data.data && data.data.activities && data.data.activities.length > 0) {
          const existingStats = { ...studentStats };
          const submittedIds = [];
          
          data.data.activities.forEach(activity => {
            // Get student ID - handle both populated and unpopulated
            let studentId;
            if (typeof activity.studentId === 'object' && activity.studentId._id) {
              studentId = activity.studentId._id.toString();
            } else if (activity.studentId) {
              studentId = activity.studentId.toString();
            } else {
              console.warn('⚠️ Activity missing studentId:', activity);
              return;
            }
            
            console.log(`📊 Processing activity for student: ${studentId}`);
            
            existingStats[studentId] = {
              totalClasses: activity.totalClasses || 20,
              attendedClasses: activity.attendedClasses || 0,
              engagement: activity.engagement || 'Medium',
              attendance: activity.attendancePercentage || 0,
              gpa: activity.gpa || 0,
              backlogs: activity.backlogs || 0,
              assignmentCompletion: activity.assignmentCompletion || 0,
              status: activity.status || 'Submitted',
              activityId: activity._id,
              submissionDate: activity.submissionDate,
              academicYear: activity.academicYear,
              semester: activity.semester
            };
            submittedIds.push(studentId);
          });
          
          setStudentStats(existingStats);
          setSubmittedStudents(submittedIds);
          console.log(`✅ Loaded existing activities for ${submittedIds.length} students`);
          console.log('📊 Submitted student IDs:', submittedIds);
        } else {
          console.log('ℹ️ No existing activities found in database');
        }
      } else {
        console.error('❌ Failed to fetch existing activities:', await response.text());
      }
    } catch (error) {
      console.error('❌ Error fetching existing activities:', error);
    }
  };

  // Fetch students from API
  const fetchStudents = async () => {
    setIsLoadingData(true);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found');
        setLoading(false);
        setIsLoadingData(false);
        return;
      }

      console.log('📤 Fetching students from API...');
      const response = await fetch(`${API_BASE_URL}/api/students/faculty/institution-students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('📥 API Response:', data);

      if (response.ok) {
        const studentList = data.data || [];
        console.log(`✅ Found ${studentList.length} students`);
        setStudents(studentList);
        setFilteredStudents(studentList);
        
        // Initialize student stats with default values
        const initialStats = {};
        studentList.forEach(student => {
          const id = student._id || student.id;
          initialStats[id] = {
            totalClasses: 20,
            attendedClasses: 0,
            engagement: 'Medium',
            attendance: 0,
            gpa: 0,
            backlogs: 0,
            assignmentCompletion: 0,
            status: 'Draft'
          };
        });
        setStudentStats(initialStats);
        
        // After setting students, fetch existing activities
        await fetchExistingActivities();
        
      } else {
        toast.error(data.message || 'Failed to fetch students', toastConfig);
        loadSampleData();
      }
    } catch (error) {
      console.error('❌ Fetch students error:', error);
      toast.error('Network error. Please try again.', toastConfig);
      loadSampleData();
    } finally {
      setLoading(false);
      setIsLoadingData(false);
    }
  };

  // Load sample data as fallback
  const loadSampleData = () => {
    console.log('📊 Loading sample student data...');
    const sampleStudents = [
      { _id: '6a8fc2ac3ff2415c21df2099', name: 'bcad', usn: '002', course: 'BE - Information Science', semester: '2', branch: 'Information Science and Engineering', email: 'bcad@example.com', phone: '9876543210' },
      { _id: 2, name: 'Priya Patel', usn: '1BG21CS002', course: 'BE - Computer Science', semester: '4', branch: 'Computer Science and Engineering', email: 'priya@example.com', phone: '9876543211' },
      { _id: 3, name: 'Arjun Reddy', usn: '1BG21CS003', course: 'BE - Information Science', semester: '4', branch: 'Information Science and Engineering', email: 'arjun@example.com', phone: '9876543212' },
    ];
    setStudents(sampleStudents);
    setFilteredStudents(sampleStudents);
    
    const initialStats = {};
    sampleStudents.forEach(student => {
      const id = student._id;
      initialStats[id] = {
        totalClasses: 20,
        attendedClasses: 0,
        engagement: 'Medium',
        attendance: 0,
        gpa: 0,
        backlogs: 0,
        assignmentCompletion: 0,
        status: 'Draft'
      };
    });
    setStudentStats(initialStats);
    console.log('✅ Sample data loaded:', sampleStudents.length, 'students');
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setInstitution(user);
        console.log('🏫 Institution:', user.name);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    fetchStudents();
  }, []);

  // Handle student stats input change
  const handleStatChange = (studentId, field, value) => {
    setStudentStats(prev => {
      const updated = {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [field]: value,
          status: 'Draft' // Reset status when editing
        }
      };
      
      // Auto-calculate attendance percentage
      if (field === 'totalClasses' || field === 'attendedClasses') {
        const total = field === 'totalClasses' ? Number(value) : prev[studentId]?.totalClasses || 0;
        const attended = field === 'attendedClasses' ? Number(value) : prev[studentId]?.attendedClasses || 0;
        const attendance = total > 0 ? Math.round((attended / total) * 100) : 0;
        updated[studentId].attendance = attendance;
      }
      
      return updated;
    });
  };

  // Handle submit all stats
  const handleSubmitAllStats = async () => {
    setIsSubmittingAll(true);
    
    try {
      // Validate all students data
      const errors = [];
      const activitiesData = [];
      
      filteredStudents.forEach(student => {
        const id = student._id || student.id;
        const stats = studentStats[id];
        
        if (!stats) {
          errors.push(`No data for ${student.name}`);
          return;
        }

        // Validation
        if (stats.totalClasses < 1) {
          errors.push(`${student.name}: Total classes must be at least 1`);
        }
        if (stats.attendedClasses > stats.totalClasses) {
          errors.push(`${student.name}: Attended classes cannot exceed total classes`);
        }
        if (stats.gpa < 0 || stats.gpa > 10) {
          errors.push(`${student.name}: GPA must be between 0 and 10`);
        }
        if (stats.backlogs < 0) {
          errors.push(`${student.name}: Backlogs cannot be negative`);
        }
        if (stats.assignmentCompletion < 0 || stats.assignmentCompletion > 100) {
          errors.push(`${student.name}: Assignment completion must be between 0 and 100`);
        }

        activitiesData.push({
          studentId: id,
          studentName: student.name,
          studentUsn: student.usn,
          totalClasses: stats.totalClasses,
          attendedClasses: stats.attendedClasses,
          engagement: stats.engagement,
          gpa: stats.gpa,
          backlogs: stats.backlogs,
          assignmentCompletion: stats.assignmentCompletion
        });
      });

      if (errors.length > 0) {
        errors.forEach(error => toast.error(error, toastConfig));
        setIsSubmittingAll(false);
        return;
      }

      console.log('📤 Submitting all student stats to backend:', activitiesData);

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please login again.', toastConfig);
        setIsSubmittingAll(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/student-activities/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activities: activitiesData })
      });

      const data = await response.json();

      if (response.ok) {
        // Update status of submitted students
        const updatedStats = { ...studentStats };
        filteredStudents.forEach(student => {
          const id = student._id || student.id;
          if (updatedStats[id]) {
            updatedStats[id].status = 'Submitted';
          }
        });
        setStudentStats(updatedStats);
        setSubmittedStudents(activitiesData.map(a => a.studentId));
        
        toast.success(`✅ ${data.message || 'Successfully submitted stats for all students!'}`, toastConfig);
        setEditingStudentId(null);
        
        if (data.data) {
          console.log('✅ Submission Results:', data.data);
        }
        
        // Refresh data from database
        setTimeout(async () => {
          await fetchExistingActivities();
        }, 1000);
        
      } else {
        toast.error(data.message || 'Failed to submit student stats', toastConfig);
        if (data.data?.errors && data.data.errors.length > 0) {
          data.data.errors.forEach(err => {
            toast.error(`${err.studentName}: ${err.error}`, toastConfig);
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Submit error:', error);
      toast.error('Network error. Please try again.', toastConfig);
    } finally {
      setIsSubmittingAll(false);
    }
  };

  // Reset all stats
  const handleResetAllStats = () => {
    if (window.confirm('Are you sure you want to reset all student stats?')) {
      const resetStats = {};
      filteredStudents.forEach(student => {
        const id = student._id || student.id;
        resetStats[id] = {
          totalClasses: 20,
          attendedClasses: 0,
          engagement: 'Medium',
          attendance: 0,
          gpa: 0,
          backlogs: 0,
          assignmentCompletion: 0,
          status: 'Draft'
        };
      });
      setStudentStats(resetStats);
      setEditingStudentId(null);
      setSubmittedStudents([]);
      toast.info('All stats have been reset', toastConfig);
    }
  };

  // Handle view submitted history
  const handleViewHistory = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required', toastConfig);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/student-activities/trend/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Student Trend Data:', data);
        toast.info(`Viewing history for ${students.find(s => (s._id || s.id) === studentId)?.name}`, toastConfig);
        // You can display this in a modal or expanded view
      } else {
        toast.error('Failed to fetch student history', toastConfig);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Network error', toastConfig);
    }
  };

  // Refresh data from database
  const handleRefreshData = async () => {
    toast.info('Refreshing data...', toastConfig);
    await fetchExistingActivities();
    toast.success('Data refreshed successfully!', toastConfig);
  };

  // Dynamic courses, semesters, branches from actual data
  const getUniqueValues = (key) => {
    const values = students.map(s => s[key]).filter(Boolean);
    return [...new Set(values)];
  };

  const engineeringBranches = [
    'Computer Science and Engineering',
    'Information Science and Engineering',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Artificial Intelligence and Machine Learning',
    'Data Science and Engineering',
    'Computer Engineering',
    'Aerospace Engineering',
    'Biotechnology',
    'Chemical Engineering',
    'Robotics and Automation'
  ];

  const beCourses = [
    'BE - Computer Science',
    'BE - Information Science',
    'BE - Electronics & Communication',
    'BE - Electrical & Electronics',
    'BE - Mechanical',
    'BE - Civil',
    'BE - Artificial Intelligence & ML',
    'BE - Data Science',
    'BE - Computer Engineering',
    'BE - Aerospace',
    'BE - Biotechnology',
    'BE - Chemical',
    'BE - Robotics & Automation'
  ];

  const courses = getUniqueValues('course').length > 0 ? getUniqueValues('course') : beCourses;
  const semesters = getUniqueValues('semester').length > 0 ? getUniqueValues('semester') : ['1', '2', '3', '4', '5', '6', '7', '8'];
  const branches = getUniqueValues('branch').length > 0 ? getUniqueValues('branch') : engineeringBranches;

  const handleFilterStudents = () => {
    console.log('🔍 Filtering students...');
    console.log('📋 Form Data:', formData);
    console.log('📋 All Students:', students.length);
    
    setLoading(true);

    const currentStudents = students.length > 0 ? students : [];
    
    if (currentStudents.length === 0) {
      toast.warning('No students available in the system', toastConfig);
      setLoading(false);
      return;
    }

    const filtered = currentStudents.filter(s => {
      const matchCourse = formData.course ? s.course === formData.course : true;
      const matchSemester = formData.semester ? s.semester === formData.semester : true;
      const matchBranch = formData.branch ? s.branch === formData.branch : true;
      return matchCourse && matchSemester && matchBranch;
    });

    console.log(`✅ Filtered students: ${filtered.length} out of ${currentStudents.length}`);
    
    setFilteredStudents(filtered);
    setLoading(false);
    
    if (filtered.length === 0) {
      toast.info('No students found for the selected filters', toastConfig);
    } else {
      toast.success(`Found ${filtered.length} students`, toastConfig);
      setShowFilters(false);
    }
  };

  const handleBackToFilters = () => {
    setShowFilters(true);
    setFilteredStudents(students);
    setEditingStudentId(null);
  };

  // Calculate attendance percentage
  const calculateAttendance = (studentId) => {
    const stats = studentStats[studentId];
    if (!stats) return 0;
    if (stats.totalClasses === 0) return 0;
    return Math.round((stats.attendedClasses / stats.totalClasses) * 100);
  };

  // Check if student is submitted
  const isStudentSubmitted = (studentId) => {
    return submittedStudents.includes(studentId) || studentStats[studentId]?.status === 'Submitted';
  };

  // Stats for cards
  const totalStudents = filteredStudents.length;
  const totalStats = {
    total: totalStudents,
    present: filteredStudents.filter(s => {
      const stats = studentStats[s._id || s.id];
      return stats && calculateAttendance(s._id || s.id) >= 75;
    }).length,
    absent: filteredStudents.filter(s => {
      const stats = studentStats[s._id || s.id];
      return stats && calculateAttendance(s._id || s.id) < 75;
    }).length,
    pending: filteredStudents.filter(s => {
      const stats = studentStats[s._id || s.id];
      return stats && calculateAttendance(s._id || s.id) >= 50 && calculateAttendance(s._id || s.id) < 75;
    }).length,
    submitted: submittedStudents.length,
  };

  const stats = [
    { icon: Users, label: 'Total Students', value: totalStats.total, color: '#EEF9FF' },
    { icon: CheckCircle, label: 'Good Attendance (75%+)', value: totalStats.present, color: '#DCFCE7' },
    { icon: XCircle, label: 'Low Attendance (<75%)', value: totalStats.absent, color: '#FEE2E2' },
    { icon: AlertCircle, label: 'Needs Attention (50-75%)', value: totalStats.pending, color: '#FEF3C7' },
  ];

  return (
    <div>
      {/* Toast Container */}
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#080C68]">Student Activities</h1>
          <p className="text-sm text-gray-500 mt-0.5 sm:mt-1">
            Track student engagement and performance
            {submittedStudents.length > 0 && (
              <span className="ml-2 text-green-600 font-semibold">
                ({submittedStudents.length} submitted)
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefreshData}
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition shadow-sm text-sm sm:text-base"
            title="Refresh data from database"
          >
            <RefreshCw size={18} className={isLoadingData ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={() => {
              setShowFilters(true);
              setFilteredStudents(students);
              setEditingStudentId(null);
            }}
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition shadow-sm text-sm sm:text-base"
          >
            <Filter size={18} />
            Filter Students
          </button>
          <button
            onClick={() => handleViewHistory(filteredStudents[0]?._id || filteredStudents[0]?.id)}
            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-sm text-sm sm:text-base"
          >
            <BarChart3 size={18} />
            View Trends
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 mb-4 md:mb-6">
        {stats.map((stat, index) => (
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

      {/* Filter Section */}
      {showFilters ? (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 mb-4 md:mb-6">
          <h3 className="text-sm font-semibold text-[#080C68] mb-3 sm:mb-4 flex items-center gap-2">
            <Filter size={16} className="text-[#00A9E0]" />
            Filter Students
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#080C68] mb-1 sm:mb-1.5">Institution</label>
              <input
                type="text"
                value={institution?.name || 'Your Institution'}
                disabled
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#080C68] mb-1 sm:mb-1.5">Course</label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors text-sm"
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#080C68] mb-1 sm:mb-1.5">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors text-sm"
              >
                <option value="">Select Semester</option>
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#080C68] mb-1 sm:mb-1.5">Branch</label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({...formData, branch: e.target.value})}
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors text-sm"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={handleFilterStudents}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2.5 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 text-sm sm:text-base"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              {loading ? 'Filtering...' : 'Filter Students'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
          <button
            onClick={handleBackToFilters}
            className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-[#080C68] transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Filters
          </button>
          <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            Showing {filteredStudents.length} students
            {submittedStudents.length > 0 && (
              <span className="ml-2 text-green-600">
                ({submittedStudents.length} submitted)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Student Table */}
      {!showFilters && filteredStudents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1300px]">
              <thead>
                <tr className="bg-[#080C68] text-white">
                  <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold sticky left-0 bg-[#080C68] min-w-[100px] sm:min-w-[120px] z-10">Student</th>
                  <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold sticky left-[100px] sm:left-[120px] bg-[#080C68] min-w-[70px] sm:min-w-[90px] z-10">USN</th>
                  <th className="text-center px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold min-w-[80px]">Total</th>
                  <th className="text-center px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold min-w-[80px]">Attended</th>
                  <th className="text-center px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold min-w-[80px]">%</th>
                  <th className="text-center px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold min-w-[100px]">Engagement</th>
                  <th className="text-center px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold min-w-[80px]">GPA</th>
                  <th className="text-center px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold min-w-[80px]">Backlogs</th>
                  <th className="text-center px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold min-w-[100px]">Assignment %</th>
                  <th className="text-center px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold min-w-[80px]">Status</th>
                  <th className="text-center px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold min-w-[80px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const id = student._id || student.id;
                  const stats = studentStats[id] || { 
                    totalClasses: 20, 
                    attendedClasses: 0, 
                    engagement: 'Medium', 
                    gpa: 0, 
                    backlogs: 0, 
                    assignmentCompletion: 0,
                    status: 'Draft'
                  };
                  const attendance = calculateAttendance(id);
                  const isEditing = editingStudentId === id;
                  const isSubmitted = stats.status === 'Submitted' || isStudentSubmitted(id);
                  
                  const getAttendanceColor = (att) => {
                    if (att >= 75) return 'text-green-600';
                    if (att >= 50) return 'text-yellow-600';
                    return 'text-red-600';
                  };

                  const getEngagementColor = (eng) => {
                    if (eng === 'High') return 'text-green-600 bg-green-50';
                    if (eng === 'Medium') return 'text-yellow-600 bg-yellow-50';
                    return 'text-red-600 bg-red-50';
                  };

                  return (
                    <tr key={id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSubmitted ? 'bg-green-50' : ''}`}>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-[#080C68] sticky left-0 bg-white z-10 truncate max-w-[80px] sm:max-w-none">
                        {student.name}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-sm text-gray-600 sticky left-[100px] sm:left-[120px] bg-white z-10">
                        {student.usn}
                      </td>
                      <td className="text-center px-1 sm:px-2 py-1 sm:py-2">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={stats.totalClasses}
                            onChange={(e) => handleStatChange(id, 'totalClasses', parseInt(e.target.value) || 0)}
                            className="w-14 sm:w-16 px-1 sm:px-2 py-1 border border-gray-300 rounded text-center text-xs sm:text-sm focus:outline-none focus:border-[#00A9E0]"
                          />
                        ) : (
                          <span className="text-xs sm:text-sm text-gray-600">{stats.totalClasses}</span>
                        )}
                      </td>
                      <td className="text-center px-1 sm:px-2 py-1 sm:py-2">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max={stats.totalClasses}
                            value={stats.attendedClasses}
                            onChange={(e) => handleStatChange(id, 'attendedClasses', parseInt(e.target.value) || 0)}
                            className="w-14 sm:w-16 px-1 sm:px-2 py-1 border border-gray-300 rounded text-center text-xs sm:text-sm focus:outline-none focus:border-[#00A9E0]"
                          />
                        ) : (
                          <span className="text-xs sm:text-sm text-gray-600">{stats.attendedClasses}</span>
                        )}
                      </td>
                      <td className={`text-center px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm font-bold ${getAttendanceColor(attendance)}`}>
                        {attendance}%
                      </td>
                      <td className="text-center px-1 sm:px-2 py-1 sm:py-2">
                        {isEditing ? (
                          <select
                            value={stats.engagement}
                            onChange={(e) => handleStatChange(id, 'engagement', e.target.value)}
                            className="w-24 sm:w-28 px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:border-[#00A9E0]"
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        ) : (
                          <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[8px] sm:text-xs rounded-full font-semibold ${getEngagementColor(stats.engagement)}`}>
                            {stats.engagement}
                          </span>
                        )}
                      </td>
                      <td className="text-center px-1 sm:px-2 py-1 sm:py-2">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={stats.gpa}
                            onChange={(e) => handleStatChange(id, 'gpa', parseFloat(e.target.value) || 0)}
                            className="w-14 sm:w-16 px-1 sm:px-2 py-1 border border-gray-300 rounded text-center text-xs sm:text-sm focus:outline-none focus:border-[#00A9E0]"
                          />
                        ) : (
                          <span className="text-xs sm:text-sm font-medium text-[#080C68]">{stats.gpa}</span>
                        )}
                      </td>
                      <td className="text-center px-1 sm:px-2 py-1 sm:py-2">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={stats.backlogs}
                            onChange={(e) => handleStatChange(id, 'backlogs', parseInt(e.target.value) || 0)}
                            className="w-14 sm:w-16 px-1 sm:px-2 py-1 border border-gray-300 rounded text-center text-xs sm:text-sm focus:outline-none focus:border-[#00A9E0]"
                          />
                        ) : (
                          <span className="text-xs sm:text-sm text-gray-600">{stats.backlogs}</span>
                        )}
                      </td>
                      <td className="text-center px-1 sm:px-2 py-1 sm:py-2">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={stats.assignmentCompletion}
                            onChange={(e) => handleStatChange(id, 'assignmentCompletion', parseInt(e.target.value) || 0)}
                            className="w-14 sm:w-16 px-1 sm:px-2 py-1 border border-gray-300 rounded text-center text-xs sm:text-sm focus:outline-none focus:border-[#00A9E0]"
                          />
                        ) : (
                          <span className="text-xs sm:text-sm text-gray-600">{stats.assignmentCompletion}%</span>
                        )}
                      </td>
                      <td className="text-center px-1 sm:px-2 py-1 sm:py-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          isSubmitted 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {isSubmitted ? '✓ Submitted' : 'Draft'}
                        </span>
                      </td>
                      <td className="text-center px-1 sm:px-2 py-1 sm:py-2">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditingStudentId(null)}
                              className="p-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
                              title="Cancel Edit"
                            >
                              <X size={16} />
                            </button>
                            <button
                              onClick={() => {
                                // Save individual student changes
                                const updatedStats = { ...studentStats };
                                updatedStats[id].status = 'Draft';
                                setStudentStats(updatedStats);
                                setEditingStudentId(null);
                                toast.info(`${student.name} ready for re-submission`, toastConfig);
                              }}
                              className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                              title="Save Changes"
                            >
                              <Save size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingStudentId(id)}
                            className="p-1 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg transition"
                            title={isSubmitted ? 'Edit Submitted Data' : 'Edit'}
                          >
                            <Edit size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Final Submit Button Below the Form */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-[#080C68]">{filteredStudents.length}</span> students
                {editingStudentId && (
                  <span className="ml-2 text-xs text-blue-600">
                    (Editing: {students.find(s => (s._id || s.id) === editingStudentId)?.name})
                  </span>
                )}
                {submittedStudents.length > 0 && (
                  <span className="ml-2 text-xs text-green-600">
                    ({submittedStudents.length} already submitted)
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={handleResetAllStats}
                  disabled={isSubmittingAll}
                  className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
                >
                  <XCircle size={18} />
                  Reset All
                </button>
                <button
                  onClick={handleSubmitAllStats}
                  disabled={isSubmittingAll || filteredStudents.length === 0}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 text-sm sm:text-base"
                >
                  {isSubmittingAll ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {submittedStudents.length > 0 ? 'Update All Student Data' : 'Submit All Student Data'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!showFilters && filteredStudents.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <Users size={40} className="mx-auto text-gray-300 mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-[#080C68] mb-2">No Students Found</h3>
          <p className="text-sm text-gray-500">Try adjusting your filters or click "Back to Filters" to reset.</p>
        </div>
      )}
    </div>
  );
};

export default Activities;