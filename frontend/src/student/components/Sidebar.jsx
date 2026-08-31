import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  LogOut,
  X,
  User,
  ClipboardList,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { id: 'interventions', label: 'Interventions Report', icon: ClipboardList, path: '/student/interventions' },
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

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
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
          fixed top-0 left-0 h-full bg-[#080C68] shadow-xl z-50
          transform transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-16' : 'w-56'}
          lg:translate-x-0 lg:z-10
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 h-14 border-b border-[#24348A] flex-shrink-0`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2">
                <GraduationCap size={24} className="text-[#00A9E0]" />
                <span className="text-white font-bold text-base">StudentDrop AI</span>
              </div>
              <button 
                className="lg:hidden text-white hover:text-[#00A9E0]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <GraduationCap size={24} className="text-[#00A9E0]" />
          )}
        </div>

        {/* User Info */}
        <div className={`${isCollapsed ? 'px-2 py-3' : 'px-4 py-3'} border-b border-[#24348A] flex-shrink-0`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
            <div className="w-8 h-8 rounded-full bg-[#00A9E0] flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-white font-medium text-xs truncate">Student</p>
                <p className="text-gray-400 text-[10px] truncate">student@gmail.com</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`${isCollapsed ? 'px-2' : 'px-3'} py-3 flex-1 overflow-y-auto`}>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id, item.path)}
                  className={`
                    w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 rounded-lg
                    transition-all duration-200 text-sm
                    ${activeTab === item.id 
                      ? 'bg-[#00A9E0] text-white shadow-md' 
                      : 'text-gray-300 hover:bg-[#24348A] hover:text-white'
                    }
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon size={isCollapsed ? 20 : 18} />
                  {!isCollapsed && <span className="text-sm">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <div className="px-2 py-2 border-t border-[#24348A] flex-shrink-0 bg-[#080C68]">
          <button
            onClick={toggleCollapse}
            className={`
              w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-end'} px-2 py-1.5 rounded-lg
              text-gray-400 hover:bg-[#24348A] hover:text-white transition-all duration-200
            `}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Logout */}
        <div className={`${isCollapsed ? 'px-2' : 'px-3'} py-3 border-t border-[#24348A] flex-shrink-0 bg-[#080C68]`}>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 rounded-lg
              text-gray-300 hover:bg-[#24348A] hover:text-white transition-all duration-200 text-sm
            `}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={isCollapsed ? 20 : 18} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;