import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const StudentLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content - Full width with proper margin */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Fixed position with left margin matching sidebar */}
        <Header 
          toggleMobileMenu={toggleMobileMenu}
          isCollapsed={isCollapsed}
        />

        {/* Page Content - Adjust padding based on sidebar state */}
        <main 
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isCollapsed ? 'ml-16' : 'ml-56'
          } mt-16 p-4 md:p-6`}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;