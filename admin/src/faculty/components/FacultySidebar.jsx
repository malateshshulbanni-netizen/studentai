import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Activity,
  CalendarCheck,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

const FacultySidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    { path: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/faculty/my-students', icon: Users, label: 'My Students' },
    { path: '/faculty/activities', icon: Activity, label: 'Activities' },
    { path: '/faculty/attendance', icon: CalendarCheck, label: 'Attendance' },
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

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
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive 
                  ? 'bg-[#00A9E0] text-white shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }
                ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
              `}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </NavLink>
          ))}
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