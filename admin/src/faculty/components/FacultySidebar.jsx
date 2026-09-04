import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Activity,
  CalendarCheck,
  Bell,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HandHelping,
  Video // Added Video icon for meetings
} from 'lucide-react';
import API_BASE_URL from '../../config/api';

const FacultySidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const [hasHighRisk, setHasHighRisk] = useState(false);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { path: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/faculty/alerts', icon: Bell, label: 'Alerts' },
    { path: '/faculty/interventions', icon: HandHelping, label: 'Interventions' },
    { path: '/faculty/my-students', icon: Users, label: 'My Students' },
    { path: '/faculty/activities', icon: Activity, label: 'Activities' },
    { path: '/faculty/attendance', icon: CalendarCheck, label: 'Attendance' },
    { path: '/faculty/meetings', icon: Video, label: 'Meetings' }, // ✅ NEW: Meetings link
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

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

  // Fetch students and check for high risk
  const checkHighRiskStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch students
      const studentsResponse = await fetch(`${API_BASE_URL}/api/students/my-students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!studentsResponse.ok) {
        setLoading(false);
        return;
      }

      const studentsData = await studentsResponse.json();
      const studentList = studentsData.data || [];
      
      let highRiskFound = false;

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
                  highRiskFound = true;
                  break; // Stop checking once we find one high risk student
                }
              }
            }
          }
        }
      }

      setHasHighRisk(highRiskFound);

    } catch (error) {
      console.error('Error checking high risk students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check high risk students on mount
  useEffect(() => {
    checkHighRiskStudents();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      checkHighRiskStudents();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`
          fixed top-0 left-0 z-50 h-full bg-[#080C68] transition-all duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          lg:translate-x-0 lg:z-40
        `}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-white/60 hover:text-white lg:hidden"
        >
          <X size={24} />
        </button>

        <div className={`p-4 border-b border-[#24348A] flex items-center ${isCollapsed ? 'lg:justify-between' : 'lg:justify-between'}`}>
          {isCollapsed ? (
            <>
              <div className="flex items-center justify-center w-full">
                <span className="text-2xl font-bold text-white">
                  <span style={{ color: '#00A9E0' }}>S</span>D
                </span>
              </div>
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex w-8 h-8 bg-[#00A9E0] text-white rounded-lg items-center justify-center shadow-lg hover:bg-[#008FC2] transition-all hover:scale-105 flex-shrink-0 ml-2"
              >
                <ChevronRight size={18} />
              </button>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  StudentDrop <span style={{ color: '#00A9E0' }}>AI</span>
                </h1>
                <p className="text-xs text-white/60 mt-1">Faculty Panel</p>
              </div>
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex w-8 h-8 bg-[#00A9E0] text-white rounded-lg items-center justify-center shadow-lg hover:bg-[#008FC2] transition-all hover:scale-105 flex-shrink-0"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          )}
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isAlertsItem = item.path === '/faculty/alerts';
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative
                  ${isActive 
                    ? 'bg-[#00A9E0] text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }
                  ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                `}
                title={isCollapsed ? item.label : ''}
              >
                <div className="relative">
                  <item.icon size={20} className="flex-shrink-0" />
                  {/* Red bell indicator for high risk alerts */}
                  {isAlertsItem && hasHighRisk && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-[#080C68]"></span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#24348A]">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all
              ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
            `}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default FacultySidebar;