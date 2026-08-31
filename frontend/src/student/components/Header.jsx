import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  User, 
  Search,
  ChevronDown,
  LogOut,
  Settings
} from 'lucide-react';

const Header = ({ toggleMobileMenu, isCollapsed }) => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <header 
      className={`fixed top-0 right-0 z-30 bg-white border-b border-gray-200 h-16 px-4 md:px-6 flex items-center justify-between transition-all duration-300 ${
        isCollapsed ? 'left-16' : 'left-56'
      }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden text-gray-600 hover:text-[#00A9E0] transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="relative hidden md:block">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] text-sm w-64"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:text-[#00A9E0] transition-colors">
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-gray-700 hover:text-[#080C68] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#00A9E0] flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <span className="hidden md:block text-sm font-medium">
              {user?.name || 'Student'}
            </span>
            <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-[#080C68]">{user?.name || 'Student'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'student@gmail.com'}</p>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <User size={16} />
                Profile
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings size={16} />
                Settings
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;