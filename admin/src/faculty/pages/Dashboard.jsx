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
import API_BASE_URL from '../../config/api';
import RobotMascot from '../../assets/studentdrop-ai-robot.png';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myStudentsCount, setMyStudentsCount] = useState(0);
  const [predictionResults, setPredictionResults] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchAssignedStudents();
    fetchRecentActivities();
    fetchUpcomingDeadlines();
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
              const riskValue = data.data.risk_level || data.data.prediction || 'Low';
              results[id] = {
                prediction: riskValue,
                probability: data.data.probability || 0,
                riskLevel: riskValue
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

  // Fetch upcoming deadlines
  const fetchUpcomingDeadlines = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch student activities with upcoming deadlines
      const response = await fetch(`${API_BASE_URL}/api/student-activities?status=Draft&limit=3&sortBy=submissionDate&sortOrder=asc`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.activities) {
          const deadlines = data.data.activities.map(activity => ({
            title: `${activity.studentName || 'Student'} - Activity`,
            dueDate: new Date(activity.submissionDate || activity.createdAt).toLocaleDateString(),
            priority: activity.engagement === 'High' ? 'High' : activity.engagement === 'Medium' ? 'Medium' : 'Low',
            studentName: activity.studentName || 'Unknown'
          }));
          setUpcomingDeadlines(deadlines.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error fetching upcoming deadlines:', error);
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

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
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

      {/* Recent Activity & Deadlines */}
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

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold text-[#080C68]">Upcoming Deadlines</h3>
            {upcomingDeadlines.length > 0 && (
              <button className="text-xs md:text-sm text-[#00A9E0] hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            )}
          </div>
          
          {upcomingDeadlines.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <Calendar size={32} className="mx-auto text-gray-300 mb-2 md:mb-3" />
              <p className="text-sm text-gray-500">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-medium text-[#080C68] truncate">{deadline.title}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 truncate">Student: {deadline.studentName}</p>
                    <p className="text-[10px] md:text-xs text-gray-400">Due: {deadline.dueDate}</p>
                  </div>
                  <span className={`text-[10px] md:text-xs font-semibold ${getPriorityColor(deadline.priority)} flex-shrink-0`}>
                    {deadline.priority}
                  </span>
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