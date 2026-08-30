import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users
} from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Fetch student data
      const response = await fetch(`https://studentaibackend.vercel.app/api/students/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudentData(data.data);
        
        // Set stats
        setStats([
          { icon: BookOpen, title: 'Enrolled Courses', value: '4', subtitle: '2 in progress', color: '#EEF9FF', iconColor: '#00A9E0' },
          { icon: Calendar, title: 'Attendance', value: '92%', subtitle: '+2% this week', color: '#EEF9FF', iconColor: '#00A9E0' },
          { icon: BarChart3, title: 'Average CGPA', value: '8.5', subtitle: '+0.3 this sem', color: '#EEF9FF', iconColor: '#00A9E0' },
          { icon: Award, title: 'Achievements', value: '12', subtitle: '3 new this month', color: '#F5FBFF', iconColor: '#00A9E0' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      // Set default stats if API fails
      setStats([
        { icon: BookOpen, title: 'Enrolled Courses', value: '4', subtitle: '2 in progress', color: '#EEF9FF', iconColor: '#00A9E0' },
        { icon: Calendar, title: 'Attendance', value: '92%', subtitle: '+2% this week', color: '#EEF9FF', iconColor: '#00A9E0' },
        { icon: BarChart3, title: 'Average CGPA', value: '8.5', subtitle: '+0.3 this sem', color: '#EEF9FF', iconColor: '#00A9E0' },
        { icon: Award, title: 'Achievements', value: '12', subtitle: '3 new this month', color: '#F5FBFF', iconColor: '#00A9E0' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Quick actions
  const quickActions = [
    { title: 'View Courses', icon: BookOpen, color: '#00A9E0' },
    { title: 'Check Attendance', icon: Calendar, color: '#080C68' },
    { title: 'View Grades', icon: BarChart3, color: '#00A9E0' },
    { title: 'Submit Assignment', icon: Clock, color: '#080C68' },
  ];

  // Recent activities
  const recentActivities = [
    { title: 'Completed Module 3', course: 'Computer Science', time: '2 hours ago', status: 'completed' },
    { title: 'Submitted Assignment', course: 'Mathematics', time: '5 hours ago', status: 'submitted' },
    { title: 'Attendance marked', course: 'Physics', time: '1 day ago', status: 'present' },
    { title: 'New announcement', course: 'Chemistry', time: '2 days ago', status: 'new' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8 bg-gradient-to-r from-[#F5FBFF] to-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#080C68]">
              Welcome back, {studentData?.name || 'Student'} 👋
            </h1>
            <p className="text-gray-500 mt-1">
              Here's your academic overview for this semester
            </p>
          </div>
          <div className="flex items-center gap-3 bg-[#00A9E0]/10 px-4 py-2 rounded-lg">
            <TrendingUp size={20} className="text-[#00A9E0]" />
            <span className="text-sm font-medium text-[#080C68]">
              Semester: {studentData?.semester || '1'}
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={40} className="text-[#00A9E0] animate-spin" />
          <span className="ml-3 text-gray-500">Loading dashboard...</span>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color }}>
                    <stat.icon size={22} style={{ color: stat.iconColor }} />
                  </div>
                  <span className="text-2xl font-bold text-[#080C68]">{stat.value}</span>
                </div>
                <h3 className="text-sm font-medium text-[#080C68]">{stat.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-8">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all hover:scale-105"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${action.color}20` }}>
                  <action.icon size={20} color={action.color} />
                </div>
                <span className="text-xs font-medium text-[#080C68]">{action.title}</span>
              </button>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#080C68]">Recent Activity</h3>
              <button className="text-sm text-[#00A9E0] hover:underline">View All</button>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivities.map((activity, index) => (
                <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {activity.status === 'completed' && <CheckCircle size={18} className="text-green-500" />}
                    {activity.status === 'submitted' && <CheckCircle size={18} className="text-blue-500" />}
                    {activity.status === 'present' && <CheckCircle size={18} className="text-green-500" />}
                    {activity.status === 'new' && <AlertCircle size={18} className="text-yellow-500" />}
                    <div>
                      <p className="text-sm font-medium text-[#080C68]">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.course}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;