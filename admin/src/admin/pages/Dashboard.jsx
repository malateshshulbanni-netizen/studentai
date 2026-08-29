import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import StatsCard from '../components/StatsCard';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const stats = [
    { icon: Users, title: 'Total Students', value: '1,284', change: '+12%', color: '#EEF9FF' },
    { icon: GraduationCap, title: 'Total Faculty', value: '48', change: '+4%', color: '#EEF9FF' },
    { icon: BookOpen, title: 'Total Courses', value: '32', change: '+2%', color: '#EEF9FF' },
    { icon: AlertTriangle, title: 'At-Risk Students', value: '32', change: '-5%', color: '#FEE2E2' },
    { icon: UserCheck, title: 'Active Students', value: '892', change: '+8%', color: '#EEF9FF' },
    { icon: TrendingUp, title: 'Retention Rate', value: '92%', change: '+3%', color: '#EEF9FF' },
  ];

  const recentActivities = [
    { user: 'John Doe', action: 'submitted assignment', time: '2 hours ago' },
    { user: 'Jane Smith', action: 'joined the course', time: '4 hours ago' },
    { user: 'Mike Johnson', action: 'completed module 3', time: '6 hours ago' },
    { user: 'Sarah Wilson', action: 'requested counseling', time: '1 day ago' },
  ];

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
          <h3 className="text-lg font-semibold text-[#080C68] mb-4">Quick Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Student Attendance</span>
                <span className="font-medium text-[#080C68]">78%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#00A9E0] rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Assignment Completion</span>
                <span className="font-medium text-[#080C68]">65%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#080C68] rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Student Engagement</span>
                <span className="font-medium text-[#080C68]">82%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#00A9E0] rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Intervention Success</span>
                <span className="font-medium text-[#080C68]">71%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '71%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-[#080C68] mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-lg bg-[#EEF9FF] flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-[#00A9E0]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#080C68]">{activity.user}</p>
                  <p className="text-xs text-gray-500">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;