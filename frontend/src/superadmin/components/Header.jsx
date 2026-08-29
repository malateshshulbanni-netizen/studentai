import React, { useState } from 'react';
import { Menu, LogOut, ChevronDown } from 'lucide-react';

const Header = ({ toggleSidebar, onLogout, isCollapsed }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-600 hover:text-[#00A9E0] transition-colors"
          >
            <Menu size={24} />
          </button>
          
          {/* Show StudentDrop AI when sidebar is collapsed on desktop */}
          {isCollapsed && (
            <h1 className="hidden lg:block text-xl font-bold text-[#080C68]">
              StudentDrop <span style={{ color: '#00A9E0' }}>AI</span>
            </h1>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#00A9E0] flex items-center justify-center text-white font-semibold">
                SA
              </div>
              <span className="text-sm font-medium text-[#080C68] hidden sm:block">
                Super Admin
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100">
                <button 
                  onClick={onLogout}
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

export default Header;