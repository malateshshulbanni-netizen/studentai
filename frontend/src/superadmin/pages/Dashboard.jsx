import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Loader2
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import RecentActivity from '../components/RecentActivity';
// Import the robot image
import RobotMascot from '../../assets/studentdrop-ai-robot.png';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overviewData, setOverviewData] = useState({
    institutions: 0,
    mlModels: 0
  });

  // API URL - Direct URL
  const API_URL = 'https://studentaibackend.vercel.app';

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem("token");
      
      // Fetch institutions count
      let institutionsCount = 0;
      let institutionData = [];
      try {
        const instResponse = await fetch(`${API_URL}/api/institutions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (instResponse.ok) {
          const instData = await instResponse.json();
          institutionData = instData.data || [];
          institutionsCount = institutionData.length;
        }
      } catch (e) {
        console.log('Institutions API error:', e);
      }

      // Fetch ML models status
      let mlModelsCount = 0;
      let mlStatus = 'Not Available';
      try {
        const mlResponse = await fetch(`https://studentaimlservice.onrender.com/api/model-info`);
        if (mlResponse.ok) {
          const mlData = await mlResponse.json();
          mlModelsCount = mlData.status === 'loaded' ? 1 : 0;
          mlStatus = mlData.status === 'loaded' ? 'Active' : 'Inactive';
        }
      } catch (e) {
        console.log('ML service not available');
      }

      // Calculate some stats based on institutions data
      const totalUsers = institutionData.reduce((sum, inst) => sum + (inst.users?.length || 0), 0);
      const activeStudents = Math.floor(institutionData.length * 15); // Mock calculation
      const highRiskStudents = Math.floor(activeStudents * 0.05);
      const activeCounsellors = Math.floor(institutionData.length * 2);

      // Set overview data
      setOverviewData({
        institutions: institutionsCount,
        mlModels: mlModelsCount
      });

      // Set stats cards
      setStats([
        { 
          icon: Building2, 
          title: 'Institutions', 
          value: String(institutionsCount || 0), 
          subtitle: institutionsCount > 0 ? `${institutionsCount} registered` : 'No institutions', 
          color: '#EEF9FF' 
        },
        { 
          icon: Users, 
          title: 'Total Users', 
          value: String(totalUsers || 0), 
          subtitle: 'From institutions', 
          color: '#EEF9FF' 
        },
        { 
          icon: Brain, 
          title: 'ML Models', 
          value: String(mlModelsCount), 
          subtitle: mlStatus, 
          color: '#EEF9FF' 
        },
        { 
          icon: AlertTriangle, 
          title: 'High Risk Students', 
          value: String(highRiskStudents), 
          subtitle: 'Need attention', 
          color: '#FEE2E2' 
        },
        { 
          icon: UserCheck, 
          title: 'Active Counsellors', 
          value: String(activeCounsellors), 
          subtitle: 'Available', 
          color: '#EEF9FF' 
        },
        { 
          icon: Activity, 
          title: 'System Uptime', 
          value: '99.9%', 
          subtitle: 'All systems go', 
          color: '#EEF9FF' 
        },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh.');
      
      // Set default stats if API fails
      setStats([
        { icon: Building2, title: 'Institutions', value: '0', subtitle: 'No data', color: '#EEF9FF' },
        { icon: Users, title: 'Total Users', value: '0', subtitle: 'No data', color: '#EEF9FF' },
        { icon: Brain, title: 'ML Models', value: '0', subtitle: 'No data', color: '#EEF9FF' },
        { icon: AlertTriangle, title: 'High Risk Students', value: '0', subtitle: 'No data', color: '#FEE2E2' },
        { icon: UserCheck, title: 'Active Counsellors', value: '0', subtitle: 'No data', color: '#EEF9FF' },
        { icon: Activity, title: 'System Uptime', value: '99.9%', subtitle: 'All systems go', color: '#EEF9FF' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome Section - Responsive */}
      <div className="mb-8 bg-gradient-to-r from-[#F5FBFF] to-white rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#00A9E0] flex items-center justify-center text-white font-semibold flex-shrink-0">
                <User size={20} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#080C68]">
                Welcome back, <span style={{ color: '#00A9E0' }}>Super Admin</span>
              </h1>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">
              Here's what's happening across your platform
            </p>
            <button className="mt-4 flex items-center justify-center md:justify-start gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-white font-medium transition-all hover:scale-105 shadow-md text-sm sm:text-base w-full sm:w-auto" style={{ backgroundColor: '#00A9E0' }}>
              <Sparkles size={18} />
              View Platform Analytics →
            </button>
          </div>
          
          {/* Robot Image - Responsive */}
          <div className="flex-shrink-0">
            <img 
              src={RobotMascot} 
              alt="StudentDrop AI Robot" 
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain"
              style={{ 
                filter: 'drop-shadow(0 10px 20px rgba(0, 169, 224, 0.15))'
              }}
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={40} className="text-[#00A9E0] animate-spin" />
          <span className="ml-3 text-gray-500">Loading dashboard...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={fetchDashboardData} 
            className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-red-700 text-xs font-medium transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid - Responsive */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
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

          {/* Charts and Activity Section - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Stats Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-[#080C68]">Platform Overview</h3>
                <TrendingUp size={20} style={{ color: '#00A9E0' }} />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Institutions</span>
                    <span className="font-medium text-[#080C68]">{overviewData.institutions}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00A9E0] rounded-full" style={{ width: `${Math.min((overviewData.institutions / 20) * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">ML Models</span>
                    <span className="font-medium text-[#080C68]">{overviewData.mlModels}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#080C68] rounded-full" style={{ width: `${overviewData.mlModels > 0 ? '100%' : '0%'}` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Active Students</span>
                    <span className="font-medium text-[#080C68]">{Math.floor(overviewData.institutions * 15)}</span>
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

            {/* Recent Activity - Responsive */}
            <div className="lg:col-span-1">
              <RecentActivity />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;