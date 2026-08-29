import React, { useState } from 'react';
import {
  Building2,
  Code2,
  ArrowRight,
  School
} from 'lucide-react';
import Login from '../admin/components/Login';
import FacultyLogin from '../faculty/components/FacultyLogin';

const Homepage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showFacultyLogin, setShowFacultyLogin] = useState(false);

  const handleAdminLogin = () => {
    setShowLogin(true);
  };

  const handleFacultyLogin = () => {
    setShowFacultyLogin(true);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5FBFF] to-[#EEF9FF] px-4 sm:px-6 py-8 sm:py-10">

        {/* Main Container */}
        <div className="w-full max-w-[1192px]">

          {/* Header */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16">

            {/* School Icon */}
            <div className="flex justify-center mb-4 sm:mb-5">
              <div className="flex items-center justify-center">
                <School
                  size={48}
                  strokeWidth={2}
                  className="text-[#00A9E0] sm:w-[56px] sm:h-[56px] md:w-[64px] md:h-[64px]"
                />
              </div>
            </div>

            {/* Logo */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-[#080C68]">
                STUDENTDROP
              </span>{' '}
              <span className="text-[#00A9E0]">
                AI
              </span>
            </h1>

            <p className="text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.35em] uppercase mt-4 sm:mt-6 font-medium text-gray-500">
              Centralized Institution Management System
            </p>
          </div>

          {/* Portal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-[44px]">

            {/* Admin Portal */}
            <div className="bg-white rounded-[24px] sm:rounded-[30px] md:rounded-[34px] shadow-lg p-6 sm:p-8 md:p-[52px] min-h-[380px] sm:min-h-[420px] md:min-h-[520px] border border-gray-100 hover:shadow-xl transition-all duration-300">

              <div className="flex flex-col h-full">

                {/* Icon */}
                <div className="mb-6 sm:mb-8 md:mb-10">
                  <div className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] md:w-[108px] md:h-[108px] rounded-[20px] sm:rounded-[24px] md:rounded-[28px] bg-[#F5F8FC] flex items-center justify-center">
                    <Building2
                      size={36}
                      strokeWidth={1.8}
                      className="text-[#080C68] sm:w-[44px] sm:h-[44px] md:w-[52px] md:h-[52px]"
                    />
                  </div>
                </div>

                {/* Content */}
                <h2 className="text-2xl sm:text-[26px] md:text-[30px] font-bold text-[#080C68] mb-2 sm:mb-3 md:mb-4">
                  Admin Portal
                </h2>

                <p className="text-sm sm:text-[15px] md:text-[17px] leading-6 sm:leading-7 md:leading-8 max-w-[480px] text-gray-500">
                  Manage institutional data, faculty, students,
                  and monitor risk analytics.
                </p>

                {/* Button */}
                <div className="mt-auto pt-6 sm:pt-8 md:pt-10">
                  <button
                    onClick={handleAdminLogin}
                    className="w-full h-[60px] sm:h-[72px] md:h-[84px] flex items-center justify-center gap-2 sm:gap-3 bg-[#080C68] hover:bg-[#05094f] text-white rounded-[16px] sm:rounded-[18px] md:rounded-[20px] font-semibold text-[15px] sm:text-[16px] md:text-[18px] shadow-lg transition-all duration-300 group"
                  >
                    <span>Authorize Access</span>

                    <ArrowRight
                      size={18}
                      className="sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px] group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>

              </div>
            </div>

            {/* Faculty Portal */}
            <div className="bg-white rounded-[24px] sm:rounded-[30px] md:rounded-[34px] shadow-lg p-6 sm:p-8 md:p-[52px] min-h-[380px] sm:min-h-[420px] md:min-h-[520px] border border-gray-100 hover:shadow-xl transition-all duration-300">

              <div className="flex flex-col h-full">

                {/* Icon */}
                <div className="mb-6 sm:mb-8 md:mb-10">
                  <div className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] md:w-[108px] md:h-[108px] rounded-[20px] sm:rounded-[24px] md:rounded-[28px] bg-[#EEF5FF] flex items-center justify-center">
                    <Code2
                      size={36}
                      strokeWidth={1.8}
                      className="text-[#2563EB] sm:w-[44px] sm:h-[44px] md:w-[52px] md:h-[52px]"
                    />
                  </div>
                </div>

                {/* Content */}
                <h2 className="text-2xl sm:text-[26px] md:text-[30px] font-bold text-[#080C68] mb-2 sm:mb-3 md:mb-4">
                  Faculty Portal
                </h2>

                <p className="text-sm sm:text-[15px] md:text-[17px] leading-6 sm:leading-7 md:leading-8 max-w-[480px] text-gray-500">
                  Access assigned students, view risk profiles,
                  and manage interventions.
                </p>

                {/* Button */}
                <div className="mt-auto pt-6 sm:pt-8 md:pt-10">
                  <button
                    onClick={handleFacultyLogin}
                    className="w-full h-[60px] sm:h-[72px] md:h-[84px] flex items-center justify-center gap-2 sm:gap-3 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-[16px] sm:rounded-[18px] md:rounded-[20px] font-semibold text-[15px] sm:text-[16px] md:text-[18px] shadow-lg transition-all duration-300 group"
                  >
                    <span>Authorize Access</span>

                    <ArrowRight
                      size={18}
                      className="sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px] group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>

              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="text-center mt-8 sm:mt-10 md:mt-12">
            <p className="text-[10px] sm:text-xs text-gray-400 tracking-wide">
              © 2026 StudentDrop AI. All rights reserved.
            </p>
          </div>

        </div>
      </div>

      {/* Admin Login Modal */}
      <Login isOpen={showLogin} onClose={() => setShowLogin(false)} />

      {/* Faculty Login Modal */}
      <FacultyLogin isOpen={showFacultyLogin} onClose={() => setShowFacultyLogin(false)} />
    </>
  );
};

export default Homepage;