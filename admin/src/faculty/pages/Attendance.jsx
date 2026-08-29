import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck,
  Users,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  X,
  UserCheck,
  UserX,
  Building2,
  BookOpen,
  GraduationCap,
  Save,
  RefreshCw,
  Filter,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Lock
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../config/api';

const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [institution, setInstitution] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [markedToday, setMarkedToday] = useState({});
  const [formData, setFormData] = useState({
    course: '',
    semester: '',
    branch: '',
  });
  const [debugInfo, setDebugInfo] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  
  // Semester date range
  const [semesterStart, setSemesterStart] = useState('');
  const [semesterEnd, setSemesterEnd] = useState('');

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

  // Fetch students from API - Faculty Institution Students
  const fetchStudents = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found');
        setLoading(false);
        return;
      }

      console.log('📤 Fetching faculty institution students from API...');
      const response = await fetch(`${API_BASE_URL}/api/students/faculty/institution-students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('📥 API Response Status:', response.status);
      console.log('📥 API Response Data:', data);

      if (response.ok) {
        const studentList = data.data || [];
        console.log(`✅ Found ${studentList.length} students in institution`);
        
        if (studentList.length > 0) {
          console.log('📋 Student data sample:', studentList[0]);
        }
        
        setStudents(studentList);
        setFilteredStudents(studentList);
        
        const initialAttendance = {};
        const initialMarked = {};
        const today = new Date().toISOString().split('T')[0];
        studentList.forEach(student => {
          const id = student._id || student.id;
          initialAttendance[id] = 'Present';
          initialMarked[id] = false;
        });
        setAttendanceData(initialAttendance);
        setMarkedToday(initialMarked);
      } else {
        console.log('❌ Failed to fetch students:', data.message);
        setFetchError(data.message || 'Failed to fetch students');
        toast.error(data.message || 'Failed to fetch students', toastConfig);
        if (students.length === 0) {
          loadSampleData();
        }
      }
    } catch (error) {
      console.error('❌ Fetch students error:', error);
      setFetchError(error.message);
      toast.error('Network error. Please try again.', toastConfig);
      if (students.length === 0) {
        loadSampleData();
      }
    } finally {
      setLoading(false);
    }
  };

  // Load sample data as fallback
  const loadSampleData = () => {
    console.log('📊 Loading sample student data...');
    const sampleStudents = [
      { _id: 1, name: 'Rahul Sharma', usn: '1BG21CS001', course: 'BE - Computer Science', semester: '4', branch: 'Computer Science and Engineering' },
      { _id: 2, name: 'Priya Patel', usn: '1BG21CS002', course: 'BE - Computer Science', semester: '4', branch: 'Computer Science and Engineering' },
      { _id: 3, name: 'Arjun Reddy', usn: '1BG21CS003', course: 'BE - Information Science', semester: '4', branch: 'Information Science and Engineering' },
      { _id: 4, name: 'Sneha Kumar', usn: '1BG21CS004', course: 'BE - Computer Science', semester: '4', branch: 'Computer Science and Engineering' },
      { _id: 5, name: 'Ravi Kumar', usn: '1BG21CS005', course: 'BE - Electronics & Communication', semester: '4', branch: 'Electronics and Communication Engineering' },
      { _id: 6, name: 'Ananya Singh', usn: '1BG21CS006', course: 'BE - Computer Science', semester: '4', branch: 'Computer Science and Engineering' },
      { _id: 7, name: 'Vikram Raj', usn: '1BG21CS007', course: 'BE - Information Science', semester: '4', branch: 'Information Science and Engineering' },
      { _id: 8, name: 'Kavya Nair', usn: '1BG21CS008', course: 'BE - Computer Science', semester: '4', branch: 'Computer Science and Engineering' },
      { _id: 9, name: 'Deepak Sharma', usn: '1BG21CS009', course: 'BE - Electronics & Communication', semester: '4', branch: 'Electronics and Communication Engineering' },
      { _id: 10, name: 'Meera Iyer', usn: '1BG21CS010', course: 'BE - Computer Science', semester: '4', branch: 'Computer Science and Engineering' },
    ];
    setStudents(sampleStudents);
    setFilteredStudents(sampleStudents);
    const initialAttendance = {};
    const initialMarked = {};
    sampleStudents.forEach(student => {
      initialAttendance[student._id] = 'Present';
      initialMarked[student._id] = false;
    });
    setAttendanceData(initialAttendance);
    setMarkedToday(initialMarked);
    console.log('✅ Sample data loaded:', sampleStudents.length, 'students');
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setInstitution(user);
        console.log('🏫 Institution:', user.name);
        console.log('🏫 Institution ID:', user.institutionId);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    fetchStudents();
    
    // Set default semester dates
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    setSemesterStart(startDate.toISOString().split('T')[0]);
    setSemesterEnd(today.toISOString().split('T')[0]);
  }, []);

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
    setDebugInfo('');

    const currentStudents = students.length > 0 ? students : [];
    
    if (currentStudents.length === 0) {
      console.log('⚠️ No students in the list');
      setDebugInfo('No students available. Please refresh or check database.');
      setLoading(false);
      toast.warning('No students available in the system', toastConfig);
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
    
    const initialAttendance = {};
    const initialMarked = {};
    filtered.forEach(student => {
      const id = student._id || student.id;
      initialAttendance[id] = 'Present';
      initialMarked[id] = false;
    });
    setAttendanceData(initialAttendance);
    setMarkedToday(initialMarked);
    
    setLoading(false);
    
    if (filtered.length === 0) {
      const msg = 'No students found for the selected filters';
      console.log(`❌ ${msg}`);
      setDebugInfo(`Filters applied: Course=${formData.course || 'All'}, Semester=${formData.semester || 'All'}, Branch=${formData.branch || 'All'}`);
      toast.info(msg, toastConfig);
    } else {
      toast.success(`Found ${filtered.length} students`, toastConfig);
      setShowFilters(false);
    }
  };

  const handleBackToFilters = () => {
    setShowFilters(true);
    setFilteredStudents(students);
    const initialAttendance = {};
    const initialMarked = {};
    students.forEach(student => {
      const id = student._id || student.id;
      initialAttendance[id] = 'Present';
      initialMarked[id] = false;
    });
    setAttendanceData(initialAttendance);
    setMarkedToday(initialMarked);
  };

  const handleAttendanceChange = (studentId, status) => {
    // Check if already marked for today
    if (markedToday[studentId]) {
      toast.warning('⛔ Attendance already marked for today! Cannot change.', toastConfig);
      return;
    }
    
    // Only allow marking for today
    const today = new Date();
    const currentDate = new Date(selectedYear, selectedMonth, new Date().getDate());
    today.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    
    // Only allow if viewing today's month/year
    if (today.getMonth() !== selectedMonth || today.getFullYear() !== selectedYear) {
      toast.warning('⛔ You can only mark attendance for today!', toastConfig);
      return;
    }
    
    // Check if the date is today
    const todayDate = today.getDate();
    const currentDay = new Date().getDate();
    
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
    
    // Mark as locked for today
    setMarkedToday(prev => ({
      ...prev,
      [studentId]: true
    }));
    
    toast.success(`✅ Attendance marked as ${status} for today`, toastConfig);
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getDayName = (date, month, year) => {
    return new Date(year, month, date).toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Check if a date is in the future
  const isFutureDate = (date, month, year) => {
    const today = new Date();
    const currentDate = new Date(year, month, date);
    today.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    return currentDate > today;
  };

  // Check if date is today
  const isToday = (date, month, year) => {
    const today = new Date();
    const currentDate = new Date(year, month, date);
    today.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    return currentDate.getTime() === today.getTime();
  };

  // Check if Sunday (holiday)
  const isSunday = (date, month, year) => {
    return getDayName(date, month, year) === 'Sun';
  };

  // Check if date is past
  const isPastDate = (date, month, year) => {
    const today = new Date();
    const currentDate = new Date(year, month, date);
    today.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    return currentDate < today;
  };

  // Check if date is within semester range
  const isWithinSemester = (date, month, year) => {
    if (!semesterStart || !semesterEnd) return true;
    const currentDate = new Date(year, month, date);
    const start = new Date(semesterStart);
    const end = new Date(semesterEnd);
    currentDate.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return currentDate >= start && currentDate <= end;
  };

  // Check if date is markable (only today and not marked yet)
  const isMarkable = (date, month, year) => {
    // Must be today
    if (!isToday(date, month, year)) return false;
    // Must not be Sunday (holiday)
    if (isSunday(date, month, year)) return false;
    // Must be within semester
    if (!isWithinSemester(date, month, year)) return false;
    return true;
  };

  // Calculate attendance percentage for a student
  const calculateAttendancePercentage = (studentId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let totalClasses = 0;
    let attendedClasses = 0;
    
    // Get all dates in the month up to today
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const currentDay = Math.min(today.getDate(), daysInMonth);
    
    for (let i = 1; i <= currentDay; i++) {
      const date = new Date(selectedYear, selectedMonth, i);
      date.setHours(0, 0, 0, 0);
      
      // Skip if date is before semester start or after semester end
      if (!isWithinSemester(i, selectedMonth, selectedYear)) continue;
      
      // Skip Sundays (holiday)
      if (isSunday(i, selectedMonth, selectedYear)) continue;
      
      // Skip future dates
      if (date > today) continue;
      
      totalClasses++;
      
      // Check if student was present (Present or Late counts as attended)
      // For past dates, we assume they were marked if not explicitly marked
      const status = attendanceData[studentId];
      if (status === 'Present' || status === 'Late') {
        attendedClasses++;
      }
    }
    
    if (totalClasses === 0) return 0;
    return Math.round((attendedClasses / totalClasses) * 100);
  };

  const handleSubmitAttendance = () => {
    const totalStudents = filteredStudents.length;
    const presentCount = Object.values(attendanceData).filter(status => status === 'Present').length;
    const absentCount = Object.values(attendanceData).filter(status => status === 'Absent').length;
    const lateCount = Object.values(attendanceData).filter(status => status === 'Late').length;
    
    toast.success(`✅ Attendance saved! Present: ${presentCount}, Absent: ${absentCount}, Late: ${lateCount}`, toastConfig);
    setShowMarkModal(false);
    setShowFilters(true);
  };

  // Update stats based on filtered students
  const stats = [
    { icon: Users, label: 'Total Students', value: filteredStudents.length || 0, color: '#EEF9FF' },
    { icon: CheckCircle, label: 'Present Today', value: Object.values(attendanceData).filter(s => s === 'Present').length || 0, color: '#DCFCE7' },
    { icon: XCircle, label: 'Absent', value: Object.values(attendanceData).filter(s => s === 'Absent').length || 0, color: '#FEE2E2' },
    { icon: AlertCircle, label: 'Late', value: Object.values(attendanceData).filter(s => s === 'Late').length || 0, color: '#FEF3C7' },
  ];

  // Sample attendance data for display
  const attendanceDataDisplay = [
    { id: 1, name: 'Rahul Sharma', usn: '1BG21CS001', status: 'Present', time: '9:00 AM' },
    { id: 2, name: 'Priya Patel', usn: '1BG21CS002', status: 'Absent', time: '-' },
    { id: 3, name: 'Arjun Reddy', usn: '1BG21CS003', status: 'Present', time: '9:05 AM' },
    { id: 4, name: 'Sneha Kumar', usn: '1BG21CS004', status: 'Late', time: '9:30 AM' },
    { id: 5, name: 'Ravi Kumar', usn: '1BG21CS005', status: 'Present', time: '8:55 AM' },
    { id: 6, name: 'Ananya Singh', usn: '1BG21CS006', status: 'Absent', time: '-' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Present': return 'bg-green-100 text-green-600';
      case 'Absent': return 'bg-red-100 text-red-600';
      case 'Late': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Present': return <CheckCircle size={16} className="text-green-500" />;
      case 'Absent': return <XCircle size={16} className="text-red-500" />;
      case 'Late': return <Clock size={16} className="text-yellow-500" />;
      default: return null;
    }
  };

  const filteredAttendance = attendanceDataDisplay.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.usn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const monthName = new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' });

  // Navigate month
  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#080C68]">Attendance</h1>
          <p className="text-gray-500 mt-1">Manage student attendance for your courses</p>
        </div>
        <button 
          onClick={() => setShowMarkModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition shadow-sm"
        >
          <CalendarCheck size={20} />
          Mark Attendance
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color }}>
                <stat.icon size={20} className="text-[#00A9E0]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#080C68]">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
          />
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors sm:w-48"
        />
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors sm:w-48"
        >
          <option value="">All Courses</option>
          <option value="CS">Computer Science</option>
          <option value="IS">Information Science</option>
          <option value="EC">Electronics & Communication</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFF] border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">Student</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">USN</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">Time</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-[#080C68]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-[#080C68]">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.usn}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.usn}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full font-semibold ${getStatusColor(student.status)}`}>
                      {getStatusIcon(student.status)}
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.time}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        student.status === 'Absent' 
                          ? 'text-red-500 hover:bg-red-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}>
                        <AlertCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#080C68] mb-4">Attendance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Overall Attendance</p>
            <p className="text-2xl font-bold text-[#080C68]">78%</p>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-[#00A9E0] rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">This Week</p>
            <p className="text-2xl font-bold text-[#080C68]">82%</p>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Last Week</p>
            <p className="text-2xl font-bold text-[#080C68]">74%</p>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '74%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-[#080C68] flex items-center gap-2">
                  <CalendarCheck size={24} className="text-[#00A9E0]" />
                  Mark Attendance
                </h2>
                <p className="text-sm text-gray-500 mt-1">Select course, semester, branch and mark attendance</p>
              </div>
              <button 
                onClick={() => setShowMarkModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Filter Section - Only show if showFilters is true */}
              {showFilters ? (
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-sm font-semibold text-[#080C68] mb-4 flex items-center gap-2">
                    <Filter size={16} className="text-[#00A9E0]" />
                    Filter Students
                  </h3>
                  
                  {/* Semester Date Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-[#080C68] mb-1.5">
                        <CalendarDays size={14} className="inline mr-1" />
                        Semester Start Date
                      </label>
                      <input
                        type="date"
                        value={semesterStart}
                        onChange={(e) => setSemesterStart(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#080C68] mb-1.5">
                        <CalendarDays size={14} className="inline mr-1" />
                        Semester End Date
                      </label>
                      <input
                        type="date"
                        value={semesterEnd}
                        onChange={(e) => setSemesterEnd(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#080C68] mb-1.5">Institution</label>
                      <input
                        type="text"
                        value={institution?.name || 'Your Institution'}
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#080C68] mb-1.5">Course</label>
                      <select
                        value={formData.course}
                        onChange={(e) => setFormData({...formData, course: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
                      >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#080C68] mb-1.5">Semester</label>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({...formData, semester: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
                      >
                        <option value="">Select Semester</option>
                        {semesters.map((sem) => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#080C68] mb-1.5">Branch</label>
                      <select
                        value={formData.branch}
                        onChange={(e) => setFormData({...formData, branch: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
                      >
                        <option value="">Select Branch</option>
                        {branches.map((branch) => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      onClick={handleFilterStudents}
                      disabled={loading}
                      className="px-6 py-2.5 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition shadow-sm flex items-center gap-2 disabled:opacity-70"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                      {loading ? 'Filtering...' : 'Filter Students'}
                    </button>
                    <button
                      onClick={() => setShowMarkModal(false)}
                      className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handleBackToFilters}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-[#080C68] transition-colors"
                  >
                    <ArrowLeft size={18} />
                    Back to Filters
                  </button>
                  <div className="text-sm text-gray-500">
                    Showing {filteredStudents.length} students
                  </div>
                </div>
              )}

              {/* Students List with Attendance Table - Always visible when students exist */}
              {filteredStudents.length > 0 && (
                <div className="overflow-x-auto">
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 className="text-sm font-semibold text-[#080C68]">
                      <Users size={16} className="inline mr-2 text-[#00A9E0]" />
                      Students: {filteredStudents.length}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={prevMonth}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <ChevronLeft size={18} className="text-gray-600" />
                      </button>
                      <span className="text-sm font-medium text-[#080C68] min-w-[100px] text-center">
                        {monthName} {selectedYear}
                      </span>
                      <button
                        onClick={nextMonth}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <ChevronRight size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="bg-[#080C68] text-white">
                          <th className="text-left px-3 py-2 text-xs font-semibold sticky left-0 bg-[#080C68] min-w-[120px] z-10">Student</th>
                          <th className="text-left px-3 py-2 text-xs font-semibold sticky left-[120px] bg-[#080C68] min-w-[80px] z-10">USN</th>
                          {Array.from({length: daysInMonth}, (_, i) => {
                            const date = i + 1;
                            const dayName = getDayName(date, selectedMonth, selectedYear);
                            const isHoliday = isSunday(date, selectedMonth, selectedYear);
                            const isFuture = isFutureDate(date, selectedMonth, selectedYear);
                            const isPast = isPastDate(date, selectedMonth, selectedYear);
                            const isTodayDate = isToday(date, selectedMonth, selectedYear);
                            const isWithinRange = isWithinSemester(date, selectedMonth, selectedYear);
                            const canMark = isMarkable(date, selectedMonth, selectedYear);
                            
                            let statusText = '';
                            let statusColor = '';
                            
                            if (isHoliday) {
                              statusText = '⛔';
                              statusColor = 'text-red-400';
                            } else if (isFuture) {
                              statusText = '🔒';
                              statusColor = 'text-gray-400';
                            } else if (isPast) {
                              statusText = '🔒';
                              statusColor = 'text-gray-400';
                            } else if (isTodayDate && canMark) {
                              statusText = '📝';
                              statusColor = 'text-green-400';
                            } else {
                              statusText = '🔒';
                              statusColor = 'text-gray-400';
                            }
                            
                            return (
                              <th key={i} className={`text-center px-1 py-2 text-xs font-semibold min-w-[70px] ${!isTodayDate || isHoliday || isFuture || isPast ? 'opacity-40' : ''}`}>
                                <div className="flex flex-col items-center">
                                  <span>{i + 1}</span>
                                  <span className="text-[8px] sm:text-[10px] font-normal">
                                    {dayName.slice(0, 3)}
                                    {isTodayDate && <span className="ml-1 text-green-400">●</span>}
                                    <span className={`ml-1 ${statusColor}`}>{statusText}</span>
                                  </span>
                                </div>
                              </th>
                            );
                          })}
                          <th className="text-center px-3 py-2 text-xs font-semibold min-w-[60px] bg-[#080C68]">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => {
                          const studentId = student._id || student.id;
                          const percentage = calculateAttendancePercentage(studentId);
                          const isMarked = markedToday[studentId] || false;
                          
                          return (
                            <tr key={studentId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="px-3 py-2 text-xs sm:text-sm font-medium text-[#080C68] sticky left-0 bg-white min-w-[100px] z-10">
                                {student.name || student.fullName}
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-600 sticky left-[100px] bg-white min-w-[80px] z-10">
                                {student.usn || student.rollNo}
                              </td>
                              {Array.from({length: daysInMonth}, (_, i) => {
                                const date = i + 1;
                                const isHoliday = isSunday(date, selectedMonth, selectedYear);
                                const isFuture = isFutureDate(date, selectedMonth, selectedYear);
                                const isPast = isPastDate(date, selectedMonth, selectedYear);
                                const isTodayDate = isToday(date, selectedMonth, selectedYear);
                                const isWithinRange = isWithinSemester(date, selectedMonth, selectedYear);
                                const canMark = isMarkable(date, selectedMonth, selectedYear) && !isMarked;
                                
                                // Determine if the date is blocked
                                const isBlocked = isHoliday || isFuture || isPast || !isWithinRange || isMarked || !isTodayDate;
                                
                                return (
                                  <td key={i} className="text-center px-1 py-1">
                                    {isBlocked ? (
                                      <span className="text-gray-300 text-xs">
                                        {isHoliday ? '⛔' : 
                                         isFuture ? '🔒' : 
                                         isPast ? '🔒' : 
                                         isMarked ? '✅' : '🔒'}
                                      </span>
                                    ) : (
                                      <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1">
                                        <button
                                          onClick={() => handleAttendanceChange(studentId, 'Present')}
                                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors ${
                                            attendanceData[studentId] === 'Present' 
                                              ? 'bg-green-500 text-white' 
                                              : 'bg-gray-100 hover:bg-green-100 text-gray-400'
                                          }`}
                                        >
                                          <CheckCircle size={11} className="sm:w-[14px] sm:h-[14px]" />
                                        </button>
                                        <button
                                          onClick={() => handleAttendanceChange(studentId, 'Absent')}
                                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors ${
                                            attendanceData[studentId] === 'Absent' 
                                              ? 'bg-red-500 text-white' 
                                              : 'bg-gray-100 hover:bg-red-100 text-gray-400'
                                          }`}
                                        >
                                          <XCircle size={11} className="sm:w-[14px] sm:h-[14px]" />
                                        </button>
                                        <button
                                          onClick={() => handleAttendanceChange(studentId, 'Late')}
                                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors ${
                                            attendanceData[studentId] === 'Late' 
                                              ? 'bg-yellow-500 text-white' 
                                              : 'bg-gray-100 hover:bg-yellow-100 text-gray-400'
                                          }`}
                                        >
                                          <Clock size={11} className="sm:w-[14px] sm:h-[14px]" />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                              <td className="text-center px-3 py-2 text-xs sm:text-sm font-bold text-[#080C68]">
                                {percentage}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No students found. Please filter by course, semester, or branch.</p>
                  <p className="text-sm mt-2 text-gray-400">Click "Filter Students" to load students.</p>
                  {students.length === 0 && (
                    <p className="text-sm mt-2 text-yellow-500">⚠️ No students in the system. Please add students first.</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              {filteredStudents.length > 0 && !showFilters && (
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowMarkModal(false)}
                    className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitAttendance}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition shadow-sm"
                  >
                    <Save size={18} />
                    Save Attendance
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;