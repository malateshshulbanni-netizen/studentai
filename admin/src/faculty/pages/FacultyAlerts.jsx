import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Clock, 
  Eye,
  Users,
  TrendingUp,
  TrendingDown,
  Brain,
  Sparkles,
  Loader2,
  RefreshCw,
  UserCheck,
  UserX,
  Calendar,
  BookOpen,
  GraduationCap,
  Mail,
  Phone,
  Activity,
  BarChart3
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../config/api';

const FacultyAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, high, medium, low
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [predictionResults, setPredictionResults] = useState({});
  const [predicting, setPredicting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    noData: 0
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

  // Helper function to map risk levels
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

  const getRiskLevel = (risk) => {
    const mapped = mapRiskLevel(risk);
    if (mapped === 'Low Risk') return 'Low';
    if (mapped === 'Medium Risk') return 'Medium';
    if (mapped === 'High Risk') return 'High';
    return 'Unknown';
  };

  // Fetch students assigned to faculty
  const fetchAssignedStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return [];
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
        return studentList;
      } else {
        toast.error(data.message || 'Failed to fetch students', toastConfig);
        return [];
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Network error. Please try again.', toastConfig);
      return [];
    }
  };

  // Fetch student activities/stats
  const fetchStudentActivities = async (studentId) => {
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
          return data.data.activities[0];
        }
      }
      return null;
    } catch (error) {
      console.error(`Error fetching activities for student ${studentId}:`, error);
      return null;
    }
  };

  // Predict risk for a student
  const predictStudentRisk = async (studentId, studentData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      // Get student stats
      let attendance = 0, gpa = 0, backlogs = 0, assignmentCompletion = 0, engagement = 'Medium';
      
      // If we have student data from activities
      if (studentData) {
        attendance = studentData.attendancePercentage || 0;
        gpa = studentData.gpa || 0;
        backlogs = studentData.backlogs || 0;
        assignmentCompletion = studentData.assignmentCompletion || 0;
        engagement = studentData.engagement || 'Medium';
      }

      // Only predict if student has some data
      if (attendance === 0 && gpa === 0 && backlogs === 0 && assignmentCompletion === 0) {
        return {
          prediction: 'No Data',
          probability: 0,
          riskLevel: 'No Data',
          hasData: false
        };
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
        
        return {
          prediction: mappedRisk,
          probability: data.data.probability || 0,
          riskLevel: getRiskLevel(riskValue),
          hasData: true,
          stats: {
            attendance,
            gpa,
            backlogs,
            assignmentCompletion,
            engagement
          }
        };
      }
      return null;
    } catch (error) {
      console.error(`Error predicting student ${studentId}:`, error);
      return null;
    }
  };

  // Generate recommendations based on risk level
  const getRecommendations = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'high' || level === 'high risk') {
      return [
        'Schedule immediate one-on-one counseling session',
        'Assign a mentor for regular academic check-ins',
        'Create a personalized academic support plan',
        'Monitor attendance and performance on a daily basis',
        'Contact parents/guardians to discuss progress',
        'Provide additional learning resources and tutoring'
      ];
    } else if (level === 'medium' || level === 'medium risk') {
      return [
        'Monitor attendance and performance on a weekly basis',
        'Encourage participation in study groups and peer learning',
        'Provide additional academic resources and support materials',
        'Schedule regular progress review meetings',
        'Set achievable short-term academic goals'
      ];
    } else if (level === 'low' || level === 'low risk') {
      return [
        'Continue regular monitoring of academic progress',
        'Encourage advanced learning opportunities',
        'Maintain engagement activities and participation',
        'Recognize and reward consistent performance'
      ];
    }
    return ['No recommendations available at this time'];
  };

  // Calculate alert priority
  const getAlertPriority = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'high' || level === 'high risk') return 'Critical';
    if (level === 'medium' || level === 'medium risk') return 'Medium';
    if (level === 'low' || level === 'low risk') return 'Low';
    return 'Low';
  };

  // Process all students and generate alerts
  const processAlerts = async (studentList) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const alertsList = [];
      const predictions = {};
      let highCount = 0, mediumCount = 0, lowCount = 0, noDataCount = 0;

      // Process each student
      for (const student of studentList) {
        const id = student._id || student.id;
        
        // Fetch student activities
        const activityData = await fetchStudentActivities(id);
        
        // Predict risk
        const prediction = await predictStudentRisk(id, activityData);
        
        if (prediction) {
          predictions[id] = prediction;
          
          // Count stats
          if (prediction.riskLevel === 'High') highCount++;
          else if (prediction.riskLevel === 'Medium') mediumCount++;
          else if (prediction.riskLevel === 'Low') lowCount++;
          else noDataCount++;

          // Create alert for high and medium risk students
          if (prediction.riskLevel === 'High' || prediction.riskLevel === 'Medium') {
            const alertData = {
              id: `alert-${id}-${Date.now()}`,
              studentId: id,
              student: student,
              type: prediction.riskLevel === 'High' ? 'critical' : 'warning',
              title: `${prediction.riskLevel} Risk Alert: ${student.name}`,
              message: `${student.name} (${student.usn}) has been identified as ${prediction.riskLevel.toLowerCase()} risk student. 
                       ${prediction.riskLevel === 'High' ? 'Immediate attention required.' : 'Requires monitoring and support.'}`,
              timestamp: new Date().toISOString(),
              isRead: false,
              riskLevel: prediction.riskLevel,
              probability: prediction.probability,
              priority: getAlertPriority(prediction.riskLevel),
              stats: prediction.stats || {},
              recommendations: getRecommendations(prediction.riskLevel),
              course: student.course,
              branch: student.branch,
              semester: student.semester,
              usn: student.usn,
              email: student.email,
              phone: student.phone
            };
            alertsList.push(alertData);
          }
        }
      }

      // Sort alerts by priority (Critical first, then Medium)
      alertsList.sort((a, b) => {
        const priorityOrder = { Critical: 0, High: 0, Medium: 1, Low: 2 };
        return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      });

      setAlerts(alertsList);
      setPredictionResults(predictions);
      setStats({
        total: studentList.length,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        noData: noDataCount
      });

      // Show notification for high risk alerts
      const highRiskAlerts = alertsList.filter(a => a.riskLevel === 'High');
      if (highRiskAlerts.length > 0) {
        toast.warning(`⚠️ ${highRiskAlerts.length} high-risk student(s) detected!`, {
          ...toastConfig,
          autoClose: 5000
        });
      }

    } catch (error) {
      console.error('Error processing alerts:', error);
      toast.error('Failed to process alerts', toastConfig);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const studentList = await fetchAssignedStudents();
      if (studentList && studentList.length > 0) {
        await processAlerts(studentList);
      } else {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle refresh - only the refresh icon rotates
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const studentList = await fetchAssignedStudents();
      if (studentList && studentList.length > 0) {
        await processAlerts(studentList);
        toast.success('Alerts refreshed successfully!', toastConfig);
      } else {
        setAlerts([]);
        setStats({ total: 0, high: 0, medium: 0, low: 0, noData: 0 });
        toast.info('No students found', toastConfig);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
      toast.error('Failed to refresh alerts', toastConfig);
    } finally {
      setRefreshing(false);
    }
  };

  // View alert details
  const viewAlertDetails = (alert) => {
    setSelectedAlert(alert);
    setShowDetailModal(true);
  };

  // Get filtered alerts
  const getFilteredAlerts = () => {
    if (filter === 'all') return alerts;
    if (filter === 'high') return alerts.filter(a => a.riskLevel === 'High');
    if (filter === 'medium') return alerts.filter(a => a.riskLevel === 'Medium');
    if (filter === 'low') return alerts.filter(a => a.riskLevel === 'Low');
    return alerts;
  };

  const filteredAlerts = getFilteredAlerts();
  const unreadCount = alerts.filter(a => !a.isRead).length;

  // Get risk color
  const getRiskColor = (risk) => {
    const level = risk?.toLowerCase();
    if (level === 'high' || level === 'high risk') return 'bg-red-100 text-red-700 border-red-300';
    if (level === 'medium' || level === 'medium risk') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (level === 'low' || level === 'low risk') return 'bg-green-100 text-green-700 border-green-300';
    return 'bg-gray-100 text-gray-600 border-gray-300';
  };

  const getRiskBgColor = (risk) => {
    const level = risk?.toLowerCase();
    if (level === 'high' || level === 'high risk') return 'bg-red-50 border-red-200';
    if (level === 'medium' || level === 'medium risk') return 'bg-yellow-50 border-yellow-200';
    if (level === 'low' || level === 'low risk') return 'bg-green-50 border-green-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getRiskIcon = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'high' || level === 'high risk') {
      return <AlertTriangle className="text-red-600" size={24} />;
    } else if (level === 'medium' || level === 'medium risk') {
      return <Activity className="text-yellow-600" size={24} />;
    } else if (level === 'low' || level === 'low risk') {
      return <CheckCircle className="text-green-600" size={24} />;
    }
    return <Info className="text-gray-400" size={24} />;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      Critical: 'bg-red-100 text-red-700',
      High: 'bg-red-100 text-red-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      Low: 'bg-green-100 text-green-700'
    };
    return colors[priority] || colors.Low;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <Loader2 size={48} className="mx-auto text-[#00A9E0] animate-spin" />
          <p className="mt-4 text-gray-600 text-lg">Loading alerts...</p>
          <p className="text-sm text-gray-400">Analyzing student data and calculating risks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#080C68] flex items-center gap-3">
              <Bell className="text-[#00A9E0]" size={32} />
              Risk Alerts
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">
              {alerts.length > 0 
                ? `${alerts.length} students requiring attention` 
                : 'All students are in good standing'}
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw 
                size={18} 
                className={`transition-all duration-500 ${
                  refreshing 
                    ? 'animate-spin text-[#00A9E0]' 
                    : 'text-gray-500 hover:text-[#00A9E0]'
                }`}
              />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#080C68]">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Students</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <UserX size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-600">{stats.high}</p>
                <p className="text-xs text-gray-500">High Risk</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Activity size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-yellow-600">{stats.medium}</p>
                <p className="text-xs text-gray-500">Medium Risk</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <UserCheck size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-600">{stats.low}</p>
                <p className="text-xs text-gray-500">Low Risk</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                <BarChart3 size={20} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">{stats.noData}</p>
                <p className="text-xs text-gray-500">No Data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-[#00A9E0] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'high' 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            High Risk ({alerts.filter(a => a.riskLevel === 'High').length})
          </button>
          <button
            onClick={() => setFilter('medium')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'medium' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Medium Risk ({alerts.filter(a => a.riskLevel === 'Medium').length})
          </button>
        </div>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-[#080C68] mb-2">No Alerts</h3>
            <p className="text-gray-500">
              All your students are in good standing. No risk alerts at this time.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {stats.total} students analyzed
            </p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <Info size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-[#080C68] mb-2">No {filter} Risk Alerts</h3>
            <p className="text-gray-500">No {filter.toLowerCase()} risk students found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-xl shadow-sm p-4 md:p-6 border-l-4 transition-all hover:shadow-md cursor-pointer ${
                  alert.riskLevel === 'High' ? 'border-l-red-500' : 'border-l-yellow-500'
                } ${!alert.isRead ? 'bg-blue-50/30' : ''}`}
                onClick={() => viewAlertDetails(alert)}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-shrink-0">
                    {getRiskIcon(alert.riskLevel)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                      <h3 className="font-semibold text-[#080C68] text-lg">
                        {alert.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getRiskColor(alert.riskLevel)}`}>
                          {alert.riskLevel} Risk
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getPriorityBadge(alert.priority)}`}>
                          {alert.priority}
                        </span>
                        {!alert.isRead && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm md:text-base">
                      {alert.message}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatTimestamp(alert.timestamp)}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap size={14} />
                        {alert.course || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} />
                        Sem {alert.semester || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {alert.usn || 'N/A'}
                      </span>
                      {alert.probability > 0 && (
                        <span className="flex items-center gap-1 font-semibold text-[#080C68]">
                          <Brain size={14} />
                          {(alert.probability * 100).toFixed(1)}% probability
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alert Detail Modal */}
        {showDetailModal && selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fadeIn">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  {getRiskIcon(selectedAlert.riskLevel)}
                  <div>
                    <h2 className="text-xl font-bold text-[#080C68]">Alert Details</h2>
                    <p className="text-sm text-gray-500">{selectedAlert.student?.name || 'Student'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAlert(null);
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Alert Summary */}
                <div className={`rounded-lg p-4 border ${getRiskBgColor(selectedAlert.riskLevel)}`}>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`text-sm px-3 py-1 rounded-full font-semibold ${getRiskColor(selectedAlert.riskLevel)}`}>
                      {selectedAlert.riskLevel} Risk
                    </span>
                    <span className={`text-sm px-3 py-1 rounded-full font-semibold ${getPriorityBadge(selectedAlert.priority)}`}>
                      {selectedAlert.priority} Priority
                    </span>
                    {selectedAlert.probability > 0 && (
                      <span className="text-sm font-semibold text-[#080C68] flex items-center gap-1">
                        <Brain size={16} />
                        {(selectedAlert.probability * 100).toFixed(1)}% Probability
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{selectedAlert.message}</p>
                </div>

                {/* Student Information */}
                <div>
                  <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                    <Users size={16} className="text-[#00A9E0]" />
                    Student Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium text-[#080C68]">{selectedAlert.student?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">USN</p>
                      <p className="font-medium text-[#080C68]">{selectedAlert.usn || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-[#080C68]">{selectedAlert.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-[#080C68]">{selectedAlert.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Course</p>
                      <p className="font-medium text-[#080C68]">{selectedAlert.course || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Branch</p>
                      <p className="font-medium text-[#080C68]">{selectedAlert.branch || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Semester</p>
                      <p className="font-medium text-[#080C68]">Sem {selectedAlert.semester || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Alert Time</p>
                      <p className="font-medium text-[#080C68]">{formatTimestamp(selectedAlert.timestamp)}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Stats */}
                {selectedAlert.stats && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                      <BarChart3 size={16} className="text-[#00A9E0]" />
                      Academic Performance
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Attendance</p>
                        <p className="text-lg font-bold text-[#080C68]">
                          {selectedAlert.stats.attendance || 0}%
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">GPA</p>
                        <p className="text-lg font-bold text-[#080C68]">
                          {selectedAlert.stats.gpa || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Backlogs</p>
                        <p className="text-lg font-bold text-[#080C68]">
                          {selectedAlert.stats.backlogs || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Assignments</p>
                        <p className="text-lg font-bold text-[#080C68]">
                          {selectedAlert.stats.assignmentCompletion || 0}%
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center col-span-2 md:col-span-1">
                        <p className="text-xs text-gray-500">Engagement</p>
                        <p className="text-lg font-bold text-[#080C68]">
                          {selectedAlert.stats.engagement || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedAlert.recommendations && selectedAlert.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                      <Sparkles size={16} className="text-purple-600" />
                      Recommendations
                    </h3>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <ul className="space-y-2">
                        {selectedAlert.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-purple-600 mt-0.5">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

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

export default FacultyAlerts;