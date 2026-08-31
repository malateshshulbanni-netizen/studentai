import React, { useState, useEffect } from 'react';
import { Menu, LogOut, ChevronDown, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';

const FacultyHeader = ({ toggleSidebar, isCollapsed }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [highRiskCount, setHighRiskCount] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    checkHighRiskStudents();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      checkHighRiskStudents();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Helper function to map risk levels
  const getRiskLevel = (risk) => {
    if (typeof risk === 'number') {
      if (risk === 0) return 'Low';
      if (risk === 1) return 'Medium';
      if (risk === 2) return 'High';
      return 'Unknown';
    }
    if (typeof risk === 'string') {
      const lower = risk.toLowerCase();
      if (lower.includes('low')) return 'Low';
      if (lower.includes('medium')) return 'Medium';
      if (lower.includes('high')) return 'High';
      return 'Unknown';
    }
    return 'Unknown';
  };

  // Check for high risk students
  const checkHighRiskStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch students
      const studentsResponse = await fetch(`${API_BASE_URL}/api/students/my-students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!studentsResponse.ok) return;

      const studentsData = await studentsResponse.json();
      const studentList = studentsData.data || [];
      
      let highRiskCount = 0;

      // Check each student for high risk
      for (const student of studentList) {
        const id = student._id || student.id;
        
        // Fetch student activities
        const activitiesResponse = await fetch(`${API_BASE_URL}/api/student-activities?studentId=${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          let attendance = 0, gpa = 0, backlogs = 0, assignmentCompletion = 0, engagement = 'Medium';
          
          if (activitiesData.data && activitiesData.data.activities && activitiesData.data.activities.length > 0) {
            const latest = activitiesData.data.activities[0];
            attendance = latest.attendancePercentage || 0;
            gpa = latest.gpa || 0;
            backlogs = latest.backlogs || 0;
            assignmentCompletion = latest.assignmentCompletion || 0;
            engagement = latest.engagement || 'Medium';
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
                const riskLevel = getRiskLevel(riskValue);
                if (riskLevel === 'High') {
                  highRiskCount++;
                }
              }
            }
          }
        }
      }

      setHighRiskCount(highRiskCount);

    } catch (error) {
      console.error('Error checking high risk students:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // Navigate to alerts page
  const handleBellClick = () => {
    navigate('/faculty/alerts');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-600 hover:text-[#00A9E0] transition-colors"
          >
            <Menu size={24} />
          </button>
          
          {isCollapsed && (
            <h1 className="hidden lg:block text-xl font-bold text-[#080C68]">
              StudentDrop <span style={{ color: '#00A9E0' }}>AI</span>
            </h1>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleBellClick}
            className="relative text-gray-600 hover:text-[#00A9E0] transition-colors cursor-pointer"
            title={highRiskCount > 0 ? `${highRiskCount} high-risk students detected` : 'No high-risk students'}
          >
            <Bell size={22} />
            {highRiskCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-3 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
                {highRiskCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#00A9E0] flex items-center justify-center text-white font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
              </div>
              <span className="text-sm font-medium text-[#080C68] hidden sm:block">
                {user?.name || 'Faculty'}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#00A9E0] transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default FacultyHeader;