import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  User, 
  ChevronDown,
  LogOut
} from 'lucide-react';

const Header = ({ toggleMobileMenu, isCollapsed }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/student/profile');
  };

  const leftOffset = isMobile ? 0 : (isCollapsed ? 64 : 224);

  return (
    <header 
      className="
        fixed top-0 right-0 z-30 bg-white border-b border-gray-200 
        h-14 md:h-16 
        px-3 sm:px-4 md:px-6 
        flex items-center justify-between 
        transition-all duration-300 
      "
      style={{ left: `${leftOffset}px` }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden text-gray-600 hover:text-[#00A9E0] transition-colors p-1.5 -ml-1 rounded-lg hover:bg-gray-50 flex-shrink-0"
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
        {/* Notifications */}
        <button 
          className="relative p-1.5 sm:p-2 text-gray-600 hover:text-[#00A9E0] transition-colors rounded-lg hover:bg-gray-50"
          aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} new)` : ''}`}
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 sm:gap-2 text-gray-700 hover:text-[#080C68] transition-colors p-1 rounded-lg hover:bg-gray-50"
            aria-label="Open user menu"
            aria-expanded={isDropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-[#00A9E0] flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-white" />
            </div>
            <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
              {user?.name || 'Student'}
            </span>
            <ChevronDown 
              size={16} 
              className={`hidden sm:block transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {isDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
              role="menu"
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-[#080C68] truncate">
                  {user?.name || 'Student'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'student@gmail.com'}
                </p>
              </div>

              {/* Profile only — Settings removed */}
              <button 
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                role="menuitem"
              >
                <User size={16} className="flex-shrink-0" />
                <span>Profile</span>
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                role="menuitem"
              >
                <LogOut size={16} className="flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;