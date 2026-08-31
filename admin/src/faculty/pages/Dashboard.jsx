import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  UserCheck,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Activity,
  Loader2,
  Eye,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import RobotMascot from '../../assets/studentdrop-ai-robot.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myStudentsCount, setMyStudentsCount] = useState(0);
  const [predictionResults, setPredictionResults] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [atRiskStudentsList, setAtRiskStudentsList] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchAssignedStudents();
    fetchRecentActivities();
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
        setMyStudentsCount(studentList.length);
        
        // Fetch predictions for students
        await fetchPredictions(studentList);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch predictions for students
  const fetchPredictions = async (studentList) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const results = {};
      const atRiskList = [];

      for (const student of studentList) {
        const id = student._id || student.id;
        try {
          // Fetch student activities first
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

            if (predictResponse.ok) {
              const predictData = await predictResponse.json();
              if (predictData.success) {
                const riskValue = predictData.data.risk_level || predictData.data.prediction || 'Low';
                const riskLevel = typeof riskValue === 'string' ? riskValue : 
                  riskValue === 0 ? 'Low' : riskValue === 1 ? 'Medium' : riskValue === 2 ? 'High' : 'Low';
                
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

                // Add to at-risk list if High or Medium risk
                if (riskLevel === 'High' || riskLevel === 'Medium' || riskLevel === 'HIGH' || riskLevel === 'MEDIUM') {
                  atRiskList.push({
                    ...student,
                    riskLevel: riskLevel,
                    probability: predictData.data.probability || 0,
                    stats: {
                      attendance,
                      gpa,
                      backlogs,
                      assignmentCompletion,
                      engagement
                    }
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching prediction for student ${id}:`, error);
        }
      }

      // Sort at-risk students: High risk first, then Medium
      atRiskList.sort((a, b) => {
        const riskOrder = { 'High': 0, 'HIGH': 0, 'Medium': 1, 'MEDIUM': 1 };
        return (riskOrder[a.riskLevel] || 2) - (riskOrder[b.riskLevel] || 2);
      });

      setPredictionResults(results);
      setAtRiskStudentsList(atRiskList.slice(0, 5)); // Show top 5 at-risk students

    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch recent student activities
      const response = await fetch(`${API_BASE_URL}/api/student-activities?limit=5&sortBy=submissionDate&sortOrder=desc`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.activities) {
          const activities = data.data.activities.map(activity => ({
            student: activity.studentName || 'Unknown Student',
            action: activity.status === 'Submitted' ? 'submitted activity' : 'updated activity',
            time: new Date(activity.submissionDate || activity.createdAt).toLocaleDateString(),
            type: activity.status || 'Update'
          }));
          setRecentActivities(activities.slice(0, 5));
        }
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  // Calculate stats
  const totalStudents = myStudentsCount;
  const activeStudents = students.filter(s => s.active !== false).length;
  
  // Calculate risk stats from predictions
  const atRiskStudents = students.filter(s => {
    const pred = predictionResults[s._id || s.id];
    return pred && (pred.riskLevel === 'High' || pred.riskLevel === 'HIGH' || pred.riskLevel === 'High Risk');
  }).length;

  const stats = [
    { icon: Users, title: 'My Students', value: totalStudents, change: '+0', color: '#EEF9FF' },
    { icon: BookOpen, title: 'Courses', value: students.length > 0 ? new Set(students.map(s => s.course)).size : '0', change: '+0', color: '#EEF9FF' },
    { icon: UserCheck, title: 'Active Students', value: activeStudents, change: '+0', color: '#EEF9FF' },
    { icon: TrendingUp, title: 'At-Risk Students', value: atRiskStudents, change: '-0', color: '#FEE2E2' },
  ];

  // Get risk color
  const getRiskColor = (risk) => {
    const level = risk?.toLowerCase();
    if (level === 'high' || level === 'high risk') {
      return 'text-red-600 bg-red-50';
    } else if (level === 'medium' || level === 'medium risk') {
      return 'text-yellow-600 bg-yellow-50';
    } else if (level === 'low' || level === 'low risk') {
      return 'text-green-600 bg-green-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  const getRiskBadgeColor = (risk) => {
    const level = risk?.toLowerCase();
    if (level === 'high' || level === 'high risk') {
      return 'bg-red-100 text-red-700 border-red-200';
    } else if (level === 'medium' || level === 'medium risk') {
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getRiskIcon = (risk) => {
    const level = risk?.toLowerCase();
    if (level === 'high' || level === 'high risk') {
      return <AlertTriangle size={16} className="text-red-600" />;
    } else if (level === 'medium' || level === 'medium risk') {
      return <Activity size={16} className="text-yellow-600" />;
    }
    return <CheckCircle size={16} className="text-green-600" />;
  };

  // Navigate to alerts page
  const handleViewAllAlerts = () => {
    navigate('/faculty/alerts');
  };

  return (
    <div>
      {/* Welcome Section with Robot Image */}
      <div className="mb-6 md:mb-8 bg-gradient-to-r from-[#F5FBFF] to-white rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          {/* Left Content */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#00A9E0] flex items-center justify-center text-white font-semibold flex-shrink-0">
                <Sparkles size={16} className="md:w-5 md:h-5" />
              </div>
              <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-[#080C68]">
                Welcome back, <span className="text-[#00A9E0]">{user?.fullName || user?.name || 'Faculty'}</span>
              </h1>
            </div>
            <p className="text-sm md:text-base text-gray-500">
              Here's what's happening with your students today
            </p>
          </div>

          {/* Robot Image */}
          <div className="flex-shrink-0">
            <img 
              src={RobotMascot} 
              alt="StudentDrop AI Robot" 
              className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 object-contain"
              style={{ 
                filter: 'drop-shadow(0 10px 20px rgba(0, 169, 224, 0.15))'
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-4 md:p-5 lg:p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 mb-1">{stat.title}</p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-[#080C68] truncate">{stat.value}</p>
                <p className={`text-[10px] md:text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change} from last month
                </p>
              </div>
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-2"
                style={{ backgroundColor: stat.color }}
              >
                <stat.icon size={18} className="md:w-6 md:h-6 text-[#00A9E0]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & At-Risk Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold text-[#080C68]">Recent Activity</h3>
            {recentActivities.length > 0 && (
              <button className="text-xs md:text-sm text-[#00A9E0] hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            )}
          </div>
          
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <Clock size={32} className="mx-auto text-gray-300 mb-2 md:mb-3" />
              <p className="text-sm text-gray-500">No recent activities</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-2 md:gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-[#EEF9FF] flex items-center justify-center flex-shrink-0">
                    {activity.type === 'Submitted' ? (
                      <CheckCircle size={14} className="md:w-4 md:h-4 text-[#00A9E0]" />
                    ) : (
                      <Clock size={14} className="md:w-4 md:h-4 text-[#00A9E0]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-[#080C68] truncate">{activity.student}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 truncate">{activity.action}</p>
                  </div>
                  <span className="text-[10px] md:text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* At-Risk Students - From My Students */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold text-[#080C68] flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              At-Risk Students
            </h3>
            {atRiskStudentsList.length > 0 && (
              <button 
                onClick={handleViewAllAlerts}
                className="text-xs md:text-sm text-[#00A9E0] hover:underline flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </button>
            )}
          </div>
          
          {atRiskStudentsList.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <CheckCircle size={32} className="mx-auto text-green-400 mb-2 md:mb-3" />
              <p className="text-sm text-gray-500">No at-risk students</p>
              <p className="text-xs text-gray-400 mt-1">All your students are in good standing</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {atRiskStudentsList.map((student, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-l-red-400">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm font-medium text-[#080C68] truncate">
                        {student.name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getRiskBadgeColor(student.riskLevel)}`}>
                        {student.riskLevel}
                      </span>
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-500 truncate">USN: {student.usn}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-[9px] md:text-[10px] text-gray-400">Attendance: {student.stats?.attendance || 0}%</span>
                      <span className="text-[9px] md:text-[10px] text-gray-400">GPA: {student.stats?.gpa || 0}</span>
                      <span className="text-[9px] md:text-[10px] text-gray-400">Backlogs: {student.stats?.backlogs || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {student.probability > 0 && (
                      <span className="text-[10px] md:text-xs font-semibold text-[#080C68]">
                        {(student.probability * 100).toFixed(1)}%
                      </span>
                    )}
                    <button className="p-1 hover:bg-[#00A9E0]/10 rounded-lg transition-colors">
                      <Eye size={16} className="text-gray-400 hover:text-[#00A9E0]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Summary */}
      {students.length > 0 && (
        <div className="mt-6 md:mt-8 bg-white rounded-xl shadow-sm p-4 md:p-5 lg:p-6 border border-gray-100">
          <h3 className="text-base md:text-lg font-semibold text-[#080C68] mb-3 md:mb-4">Risk Distribution</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-green-50 rounded-lg p-3 md:p-4 text-center">
              <CheckCircle size={20} className="mx-auto text-green-600 mb-1 md:mb-2" />
              <p className="text-lg md:text-2xl font-bold text-green-600">
                {students.filter(s => {
                  const pred = predictionResults[s._id || s.id];
                  return pred && (pred.riskLevel === 'Low' || pred.riskLevel === 'LOW' || pred.riskLevel === 'Low Risk');
                }).length}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">Low Risk</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 md:p-4 text-center">
              <Activity size={20} className="mx-auto text-yellow-600 mb-1 md:mb-2" />
              <p className="text-lg md:text-2xl font-bold text-yellow-600">
                {students.filter(s => {
                  const pred = predictionResults[s._id || s.id];
                  return pred && (pred.riskLevel === 'Medium' || pred.riskLevel === 'MEDIUM' || pred.riskLevel === 'Medium Risk');
                }).length}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">Medium Risk</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 md:p-4 text-center">
              <AlertTriangle size={20} className="mx-auto text-red-600 mb-1 md:mb-2" />
              <p className="text-lg md:text-2xl font-bold text-red-600">
                {students.filter(s => {
                  const pred = predictionResults[s._id || s.id];
                  return pred && (pred.riskLevel === 'High' || pred.riskLevel === 'HIGH' || pred.riskLevel === 'High Risk');
                }).length}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">High Risk</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;