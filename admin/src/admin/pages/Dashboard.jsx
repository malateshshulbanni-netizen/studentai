import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Clock,
  Sparkles,
  Loader2,
  Brain,
  Activity,
  Target,
  Award,
  FileText
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import API_BASE_URL from '../../config/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { icon: Users, title: 'Total Students', value: '0', change: '0%', color: '#EEF9FF' },
    { icon: GraduationCap, title: 'Total Faculty', value: '0', change: '0%', color: '#EEF9FF' },
    { icon: BookOpen, title: 'Total Courses', value: '0', change: '0%', color: '#EEF9FF' },
    { icon: AlertTriangle, title: 'At-Risk Students', value: '0', change: '0%', color: '#FEE2E2' },
    { icon: UserCheck, title: 'Active Students', value: '0', change: '0%', color: '#EEF9FF' },
    { icon: TrendingUp, title: 'Retention Rate', value: '0%', change: '0%', color: '#EEF9FF' },
  ]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [overview, setOverview] = useState({
    attendance: 0,
    assignmentCompletion: 0,
    engagement: 0,
    interventionSuccess: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    fetchDashboardData();
  }, []);

  // ============================================
  // FETCH ALL DASHBOARD DATA
  // ============================================
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [
        studentsRes,
        facultyRes,
        activitiesRes,
        predictionsRes,
        trainingHistoryRes
      ] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/students`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/faculty`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/student-activities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/predict/all-predictions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/student-activities/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      // ============================================
      // PARSE STUDENTS
      // ============================================
      let studentsData = [];
      if (studentsRes.status === 'fulfilled' && studentsRes.value.ok) {
        const data = await studentsRes.value.json();
        studentsData = data.data || [];
      }
      const totalStudents = studentsData.length;
      const activeStudents = studentsData.filter(s => s.active !== false).length;

      // ============================================
      // PARSE FACULTY
      // ============================================
      let facultyData = [];
      if (facultyRes.status === 'fulfilled' && facultyRes.value.ok) {
        const data = await facultyRes.value.json();
        facultyData = data.data || [];
      }
      const totalFaculty = facultyData.length;

      // ============================================
      // PARSE ACTIVITIES
      // ============================================
      let activitiesData = [];
      let summaryData = null;
      if (activitiesRes.status === 'fulfilled' && activitiesRes.value.ok) {
        const data = await activitiesRes.value.json();
        activitiesData = data.data?.activities || [];
        summaryData = data.data?.summary;
      }

      // ============================================
      // PARSE PREDICTIONS
      // ============================================
      let predictionsData = [];
      if (predictionsRes.status === 'fulfilled' && predictionsRes.value.ok) {
        const data = await predictionsRes.value.json();
        predictionsData = data.data || data.predictions || [];
      }

      // ============================================
      // CALCULATE STATS
      // ============================================

      // At-Risk Students (from predictions)
      let atRiskCount = 0;
      if (Array.isArray(predictionsData) && predictionsData.length > 0) {
        atRiskCount = predictionsData.filter(p => {
          const risk = (p.risk_level || p.prediction || '').toString().toLowerCase();
          return risk.includes('high') || risk === '1';
        }).length;
      } else {
        // Fallback: count from activities with low attendance/backlogs
        atRiskCount = activitiesData.filter(a => {
          const attendance = a.attendancePercentage || 0;
          const backlogs = a.backlogs || 0;
          return attendance < 50 || backlogs >= 3;
        }).length;
      }

      // Total Courses (unique from students)
      const uniqueCourses = new Set(
        studentsData.map(s => s.course).filter(Boolean)
      );
      const totalCourses = uniqueCourses.size;

      // Retention Rate
      const retentionRate = totalStudents > 0 
        ? Math.round(((totalStudents - atRiskCount) / totalStudents) * 100)
        : 0;

      // ============================================
      // CALCULATE OVERVIEW METRICS
      // ============================================
      let avgAttendance = 0;
      let avgAssignment = 0;
      let avgEngagement = 0;

      if (activitiesData.length > 0) {
        const attendanceSum = activitiesData.reduce((sum, a) => 
          sum + (a.attendancePercentage || 0), 0);
        avgAttendance = Math.round(attendanceSum / activitiesData.length);

        const assignmentSum = activitiesData.reduce((sum, a) => 
          sum + (a.assignmentCompletion || 0), 0);
        avgAssignment = Math.round(assignmentSum / activitiesData.length);

        // Engagement calculation
        const highEngagement = activitiesData.filter(a => 
          a.engagement === 'High').length;
        const mediumEngagement = activitiesData.filter(a => 
          a.engagement === 'Medium').length;
        const lowEngagement = activitiesData.filter(a => 
          a.engagement === 'Low').length;

        if (activitiesData.length > 0) {
          avgEngagement = Math.round(
            ((highEngagement * 100) + (mediumEngagement * 60) + (lowEngagement * 30)) 
            / activitiesData.length
          );
        }
      } else if (summaryData) {
        avgAttendance = Math.round(summaryData.averageAttendance || 0);
        avgAssignment = Math.round(summaryData.averageAssignmentCompletion || 0);
        
        const totalEng = (summaryData.highEngagement || 0) + 
                        (summaryData.mediumEngagement || 0) + 
                        (summaryData.lowEngagement || 0);
        if (totalEng > 0) {
          avgEngagement = Math.round(
            ((summaryData.highEngagement * 100) + 
             (summaryData.mediumEngagement * 60) + 
             (summaryData.lowEngagement * 30)) / totalEng
          );
        }
      }

      // Intervention success (based on low backlog students)
      const studentsWithImprovement = activitiesData.filter(a => 
        (a.attendancePercentage || 0) >= 75 && (a.backlogs || 0) === 0
      ).length;
      const interventionSuccess = activitiesData.length > 0 
        ? Math.round((studentsWithImprovement / activitiesData.length) * 100)
        : 0;

      // ============================================
      // UPDATE STATE
      // ============================================
      setStats([
        { 
          icon: Users, 
          title: 'Total Students', 
          value: totalStudents.toLocaleString(), 
          change: '+0%', 
          color: '#EEF9FF' 
        },
        { 
          icon: GraduationCap, 
          title: 'Total Faculty', 
          value: totalFaculty.toLocaleString(), 
          change: '+0%', 
          color: '#EEF9FF' 
        },
        { 
          icon: BookOpen, 
          title: 'Total Courses', 
          value: totalCourses.toLocaleString(), 
          change: '+0%', 
          color: '#EEF9FF' 
        },
        { 
          icon: AlertTriangle, 
          title: 'At-Risk Students', 
          value: atRiskCount.toLocaleString(), 
          change: atRiskCount > 0 ? '!' : '✓', 
          color: '#FEE2E2' 
        },
        { 
          icon: UserCheck, 
          title: 'Active Students', 
          value: activeStudents.toLocaleString(), 
          change: '+0%', 
          color: '#EEF9FF' 
        },
        { 
          icon: TrendingUp, 
          title: 'Retention Rate', 
          value: `${retentionRate}%`, 
          change: '+0%', 
          color: '#EEF9FF' 
        },
      ]);

      setOverview({
        attendance: avgAttendance,
        assignmentCompletion: avgAssignment,
        engagement: avgEngagement,
        interventionSuccess: interventionSuccess,
      });

      // ============================================
      // BUILD RECENT ACTIVITIES
      // ============================================
      const recent = [];

      // Get recent student activities
      const sortedActivities = [...activitiesData]
        .sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.submissionDate || 0);
          const dateB = new Date(b.updatedAt || b.submissionDate || 0);
          return dateB - dateA;
        })
        .slice(0, 5);

      sortedActivities.forEach(activity => {
        recent.push({
          user: activity.studentName || 'Unknown Student',
          action: `data updated (Attendance: ${activity.attendancePercentage || 0}%, GPA: ${activity.gpa || 0})`,
          time: getTimeAgo(activity.updatedAt || activity.submissionDate),
          type: 'activity'
        });
      });

      // If no activities, show recent students
      if (recent.length === 0 && studentsData.length > 0) {
        const recentStudents = [...studentsData]
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
          })
          .slice(0, 4);

        recentStudents.forEach(student => {
          recent.push({
            user: student.name,
            action: `registered in ${student.course || 'institution'}`,
            time: getTimeAgo(student.createdAt),
            type: 'student'
          });
        });
      }

      // If still no activities, show faculty
      if (recent.length === 0 && facultyData.length > 0) {
        const recentFaculty = [...facultyData]
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
          })
          .slice(0, 4);

        recentFaculty.forEach(fac => {
          recent.push({
            user: fac.fullName,
            action: `joined as ${fac.designation || 'faculty'}`,
            time: getTimeAgo(fac.createdAt),
            type: 'faculty'
          });
        });
      }

      // Fallback if nothing
      if (recent.length === 0) {
        recent.push({
          user: 'Welcome!',
          action: 'Start by adding students and faculty',
          time: 'just now',
          type: 'info'
        });
      }

      setRecentActivities(recent);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HELPER: Time ago formatter
  // ============================================
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'just now';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch {
      return 'just now';
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="text-[#00A9E0] animate-spin mb-4" />
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
        <p className="text-gray-400 text-sm mt-1">Fetching real-time data from database</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8 bg-gradient-to-r from-[#F5FBFF] to-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#00A9E0] flex items-center justify-center text-white font-semibold">
            <Sparkles size={20} />
          </div>
          <h1 className="text-2xl font-bold text-[#080C68]">
            Welcome back, <span style={{ color: '#00A9E0' }}>{user?.name || 'Admin'}</span>
          </h1>
        </div>
        <p className="text-gray-500">
          Here's what's happening with your institution today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            color={stat.color}
          />
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#080C68]">Quick Overview</h3>
            <button
              onClick={fetchDashboardData}
              className="text-xs text-[#00A9E0] hover:text-[#008FC2] font-medium transition"
            >
              Refresh
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Student Attendance</span>
                <span className="font-medium text-[#080C68]">{overview.attendance}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00A9E0] rounded-full transition-all duration-500" 
                  style={{ width: `${overview.attendance}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Assignment Completion</span>
                <span className="font-medium text-[#080C68]">{overview.assignmentCompletion}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#080C68] rounded-full transition-all duration-500" 
                  style={{ width: `${overview.assignmentCompletion}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Student Engagement</span>
                <span className="font-medium text-[#080C68]">{overview.engagement}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00A9E0] rounded-full transition-all duration-500" 
                  style={{ width: `${overview.engagement}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Intervention Success</span>
                <span className="font-medium text-[#080C68]">{overview.interventionSuccess}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-500" 
                  style={{ width: `${overview.interventionSuccess}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-[#080C68] mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No recent activity</p>
              </div>
            ) : (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF9FF] flex items-center justify-center flex-shrink-0">
                    {activity.type === 'activity' && <FileText size={16} className="text-[#00A9E0]" />}
                    {activity.type === 'student' && <Users size={16} className="text-[#00A9E0]" />}
                    {activity.type === 'faculty' && <GraduationCap size={16} className="text-[#00A9E0]" />}
                    {activity.type === 'info' && <Sparkles size={16} className="text-[#00A9E0]" />}
                    {!activity.type && <Clock size={16} className="text-[#00A9E0]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#080C68] truncate">{activity.user}</p>
                    <p className="text-xs text-gray-500 truncate">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;