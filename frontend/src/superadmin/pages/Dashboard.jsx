import React from 'react';
import { 
  Building2, 
  Users, 
  Brain, 
  TrendingUp,
  BarChart3,
  UserCheck,
  AlertTriangle,
  Activity,
  Sparkles,
  User,
  ArrowRight
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import RecentActivity from '../components/RecentActivity';
// Import the robot image
import RobotMascot from '../../assets/studentdrop-ai-robot.png';

const Dashboard = () => {
  const stats = [
    { icon: Building2, title: 'Institutions', value: '12', subtitle: '+2 this month', color: '#EEF9FF' },
    { icon: Users, title: 'Total Users', value: '1,284', subtitle: '+56 this month', color: '#EEF9FF' },
    { icon: Brain, title: 'ML Models', value: '3', subtitle: '1 new', color: '#EEF9FF' },
    { icon: AlertTriangle, title: 'High Risk Students', value: '32', subtitle: '-5 this week', color: '#FEE2E2' },
    { icon: UserCheck, title: 'Active Counsellors', value: '18', subtitle: '+4 new', color: '#EEF9FF' },
    { icon: Activity, title: 'System Uptime', value: '99.9%', subtitle: 'All systems go', color: '#EEF9FF' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section - Similar to Student Dashboard with Robot */}
      <div className="mb-8 bg-gradient-to-r from-[#F5FBFF] to-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#00A9E0] flex items-center justify-center text-white font-semibold">
                <User size={20} />
              </div>
              <h1 className="text-2xl font-bold text-[#080C68]">
                Welcome back, <span style={{ color: '#00A9E0' }}>Super Admin</span>
              </h1>
            </div>
            <p className="text-gray-500">
              Here's what's happening across your platform
            </p>
            <button className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition-all hover:scale-105 shadow-md" style={{ backgroundColor: '#00A9E0' }}>
              <Sparkles size={18} />
              View Platform Analytics →
            </button>
          </div>
          
          {/* Robot Image - No Animation */}
          <div className="flex-shrink-0">
            <img 
              src={RobotMascot} 
              alt="StudentDrop AI Robot" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain"
              style={{ 
                filter: 'drop-shadow(0 10px 20px rgba(0, 169, 224, 0.15))'
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            color={stat.color}
          />
        ))}
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#080C68]">Platform Overview</h3>
            <TrendingUp size={20} style={{ color: '#00A9E0' }} />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Institutions</span>
                <span className="font-medium text-[#080C68]">12</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#00A9E0] rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Users</span>
                <span className="font-medium text-[#080C68]">1,284</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#080C68] rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Active Students</span>
                <span className="font-medium text-[#080C68]">892</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#00A9E0] rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Intervention Success Rate</span>
                <span className="font-medium text-[#080C68]">78%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;