import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserCheck,
  UserX,
  Clock,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Eye,
  X,
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../config/api';

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [faculty, setFaculty] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [predictionResults, setPredictionResults] = useState({});
  const [predicting, setPredicting] = useState(false);
  const [predictingStudentId, setPredictingStudentId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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

  // Get faculty info from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setFaculty(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    fetchAssignedStudents();
  }, []);

  // Fetch students assigned to this faculty
  const fetchAssignedStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
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
        // Auto-fetch predictions for all students
        await fetchPredictions(studentList);
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

  // Fetch predictions for students - Auto runs on load
  const fetchPredictions = async (studentList) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const results = {};
      let predictedCount = 0;

      for (const student of studentList) {
        const id = student._id || student.id;
        try {
          // Get student stats first
          const statsResponse = await fetch(`${API_BASE_URL}/api/student-activities?studentId=${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          let attendance = 0, gpa = 0, backlogs = 0, assignmentCompletion = 0, engagement = 'Medium';
          
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            if (statsData.data && statsData.data.activities && statsData.data.activities.length > 0) {
              const latest = statsData.data.activities[0];
              attendance = latest.attendancePercentage || 0;
              gpa = latest.gpa || 0;
              backlogs = latest.backlogs || 0;
              assignmentCompletion = latest.assignmentCompletion || 0;
              engagement = latest.engagement || 'Medium';
            }
          }

          // Only predict if student has data
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
            
            const data = await predictResponse.json();
            
            if (predictResponse.ok && data.success) {
              const riskValue = data.data.risk_level || data.data.prediction || 'Low';
              const mappedRisk = mapRiskLevel(riskValue);
              
              results[id] = {
                prediction: mappedRisk,
                probability: data.data.probability || 0,
                riskLevel: getRiskLevel(riskValue)
              };
              predictedCount++;
            }
          }
        } catch (error) {
          console.error(`Error predicting for student ${id}:`, error);
        }
      }
      
      setPredictionResults(results);
      if (predictedCount > 0) {
        console.log(`✅ Auto-predicted ${predictedCount} students`);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  // Handle Refresh - only refresh the page data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAssignedStudents();
      toast.success('Data refreshed successfully!', toastConfig);
    } catch (error) {
      console.error('Error refreshing:', error);
      toast.error('Failed to refresh data', toastConfig);
    } finally {
      setRefreshing(false);
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

      toast.info('Running prediction...', toastConfig);

      // Get student stats first
      const statsResponse = await fetch(`${API_BASE_URL}/api/student-activities?studentId=${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let attendance = 0, gpa = 0, backlogs = 0, assignmentCompletion = 0, engagement = 'Medium';
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.data && statsData.data.activities && statsData.data.activities.length > 0) {
          const latest = statsData.data.activities[0];
          attendance = latest.attendancePercentage || 0;
          gpa = latest.gpa || 0;
          backlogs = latest.backlogs || 0;
          assignmentCompletion = latest.assignmentCompletion || 0;
          engagement = latest.engagement || 'Medium';
        }
      }

      const payload = {
        attendance: attendance,
        gpa: gpa,
        backlogs: backlogs,
        assignment_completion: assignmentCompletion,
        engagement: engagement
      };

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

  // View student details
  const handleView = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  // Get risk color
  const getRiskColor = (risk) => {
    const level = risk?.toLowerCase();
    if (level === 'high' || level === 'high risk') {
      return 'bg-red-100 text-red-700';
    } else if (level === 'medium' || level === 'medium risk') {
      return 'bg-yellow-100 text-yellow-700';
    } else if (level === 'low' || level === 'low risk') {
      return 'bg-green-100 text-green-700';
    }
    return 'bg-gray-100 text-gray-600';
  };

  const getRiskIcon = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'high' || level === 'high risk') {
      return <AlertTriangle size={16} className="text-red-600" />;
    } else if (level === 'medium' || level === 'medium risk') {
      return <Activity size={16} className="text-yellow-600" />;
    } else if (level === 'low' || level === 'low risk') {
      return <CheckCircle size={16} className="text-green-600" />;
    }
    return <Activity size={16} className="text-gray-400" />;
  };

  // Calculate stats from actual data with predictions
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.active !== false).length;
  
  // Calculate risk stats from predictions
  const highRiskStudents = students.filter(s => {
    const pred = predictionResults[s._id || s.id];
    return pred && (pred.riskLevel === 'High' || pred.prediction === 'High Risk');
  }).length;
  
  const mediumRiskStudents = students.filter(s => {
    const pred = predictionResults[s._id || s.id];
    return pred && (pred.riskLevel === 'Medium' || pred.prediction === 'Medium Risk');
  }).length;

  const stats = [
    { icon: Users, label: 'Total Students', value: totalStudents, color: '#EEF9FF' },
    { icon: UserCheck, label: 'Active', value: activeStudents, color: '#DCFCE7' },
    { icon: UserX, label: 'High Risk', value: highRiskStudents, color: '#FEE2E2' },
    { icon: Clock, label: 'Medium Risk', value: mediumRiskStudents, color: '#FEF3C7' },
  ];

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.usn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.branch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If no students assigned, show empty state
  if (!loading && students.length === 0) {
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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#080C68]">My Students</h1>
            <p className="text-gray-500 mt-1">View and manage your assigned students</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} className={`text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-[#080C68] mb-2">No Students Assigned</h3>
          <p className="text-sm sm:text-base text-gray-500">You haven't been assigned any students yet.</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Contact your institution admin for assignments.</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-[#080C68]">My Students</h1>
          <p className="text-gray-500 mt-1">View and manage your assigned students</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Welcome, <span className="font-semibold text-[#080C68]">{faculty?.fullName || 'Faculty'}</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={`text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
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

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search students by name, USN, course or branch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors text-sm"
        />
      </div>

      {/* Table */}
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
              {searchTerm ? 'No students found matching your search' : 'No students assigned to you'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-[#F8FAFF] border-b border-gray-100">
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Student</th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">USN</th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Course</th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Branch</th>
                  <th className="text-center px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Risk Level</th>
                  <th className="text-center px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Probability</th>
                  <th className="text-center px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const id = student._id || student.id;
                  const prediction = predictionResults[id];
                  const isPredicting = predictingStudentId === id;

                  return (
                    <tr key={student._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div>
                          <p className="font-semibold text-[#080C68] text-sm sm:text-base">{student.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{student.email}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{student.usn}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{student.course}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{student.branch}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex justify-center">
                          {prediction ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(prediction.riskLevel)}`}>
                              {getRiskIcon(prediction.riskLevel)}
                              {prediction.prediction}
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePredictSingle(id)}
                              disabled={isPredicting}
                              className={`px-3 py-1 text-xs rounded-full transition ${
                                isPredicting 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                              }`}
                            >
                              {isPredicting ? (
                                <Loader2 size={12} className="animate-spin inline" />
                              ) : (
                                'Predict'
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                        {prediction && prediction.probability > 0 ? (
                          <span className="text-sm font-semibold text-[#080C68]">
                            {(prediction.probability * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-center">
                          <button 
                            onClick={() => handleView(student)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Student"
                          >
                            <Eye size={16} />
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

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-[#080C68]">Student Details</h2>
                <p className="text-sm text-gray-500 mt-1">View student information</p>
              </div>
              <button 
                onClick={() => setShowViewModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-semibold text-[#080C68]">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">USN/Roll No</p>
                  <p className="font-semibold text-[#080C68]">{selectedStudent.usn}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-[#080C68]">{selectedStudent.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold text-[#080C68]">{selectedStudent.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-semibold text-[#080C68]">{selectedStudent.course}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Branch</p>
                  <p className="font-semibold text-[#080C68]">{selectedStudent.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Semester</p>
                  <p className="font-semibold text-[#080C68]">Sem {selectedStudent.semester}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Institution</p>
                  <p className="font-semibold text-[#080C68]">{selectedStudent.institutionName}</p>
                </div>
              </div>

              {/* Risk Prediction Section */}
              {predictionResults[selectedStudent._id || selectedStudent.id] && (
                <div className="border-t border-gray-100 pt-4">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStudents;