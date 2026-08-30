import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  User,
  Calendar,
  Bell,
  FileText,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, path: '/student/courses' },
    { id: 'attendance', label: 'Attendance', icon: Calendar, path: '/student/attendance' },
    { id: 'performance', label: 'Performance', icon: BarChart3, path: '/student/performance' },
    { id: 'assignments', label: 'Assignments', icon: FileText, path: '/student/assignments' },
    { id: 'profile', label: 'Profile', icon: User, path: '/student/profile' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, path: '/student/help' },
  ];

  const handleNavigation = (id, path) => {
    setActiveTab(id);
    navigate(path);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full w-72 bg-[#080C68] shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:z-10
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-[#24348A]">
          <div className="flex items-center gap-2">
            <GraduationCap size={32} className="text-[#00A9E0]" />
            <span className="text-white font-bold text-lg">StudentDrop AI</span>
          </div>
          <button 
            className="lg:hidden text-white hover:text-[#00A9E0]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-[#24348A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00A9E0] flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Student</p>
              <p className="text-gray-400 text-xs">student@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-4 py-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id, item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                    transition-all duration-200 text-sm
                    ${activeTab === item.id 
                      ? 'bg-[#00A9E0] text-white shadow-md' 
                      : 'text-gray-300 hover:bg-[#24348A] hover:text-white'
                    }
                  `}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-4 border-t border-[#24348A]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-[#24348A] hover:text-white transition-all duration-200 text-sm"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;