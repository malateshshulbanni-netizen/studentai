import React, { useState } from 'react';
import { Menu, X, LogIn, ChevronDown, Shield, Users } from 'lucide-react';
import LoginModal from './LoginModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const scrollToSection = (sectionId) => {
    setIsMenuOpen(false);
    const section = document.getElementById(sectionId);
    if (section) {
      const navbarHeight = document.querySelector('nav').offsetHeight;
      const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({
        top: sectionPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    setIsMenuOpen(false);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleLoginClick = (role) => {
    closeDropdown();
    setSelectedRole(role);
    setIsLoginModalOpen(true);
  };

  return (
    <>
      <div className="fixed w-full top-0 z-50 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-5">
        <nav 
          className="mx-auto rounded-2xl shadow-lg"
          style={{ 
            backgroundColor: '#080C68',
            maxWidth: '1280px',
            width: '95%'
          }}
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-12 md:h-16">
              {/* Logo */}
              <div 
                className="flex items-center cursor-pointer"
                onClick={scrollToTop}
              >
                <div className="flex-shrink-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                    StudentDrop <span style={{ color: '#00A9E0' }}>AI</span>
                  </h1>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                <button 
                  onClick={scrollToTop}
                  className="text-white/80 hover:text-[#00A9E0] transition-colors font-medium text-sm lg:text-base"
                >
                  Home
                </button>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-white/80 hover:text-[#00A9E0] transition-colors font-medium text-sm lg:text-base"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="text-white/80 hover:text-[#00A9E0] transition-colors font-medium text-sm lg:text-base"
                >
                  About
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="text-white/80 hover:text-[#00A9E0] transition-colors font-medium text-sm lg:text-base"
                >
                  Contact
                </button>
              </div>

              {/* Desktop Buttons - Only Login with Dropdown */}
              <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
                <div 
                  className="relative"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <button 
                    className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-[#00A9E0] transition-colors font-medium text-sm lg:text-base"
                  >
                    <LogIn size={18} />
                    Login
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-2" style={{ backgroundColor: '#080C68', border: '1px solid #24348A' }}>
                      <button 
                        onClick={() => handleLoginClick('superadmin')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-white/80 hover:text-[#00A9E0] hover:bg-white/5 transition-colors text-sm"
                      >
                        <Shield size={18} style={{ color: '#00A9E0' }} />
                        <span>Super Admin Login</span>
                      </button>
                      <div className="border-t" style={{ borderColor: '#24348A' }}></div>
                      <button 
                        onClick={() => handleLoginClick('counsellor')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-white/80 hover:text-[#00A9E0] hover:bg-white/5 transition-colors text-sm"
                      >
                        <Users size={18} style={{ color: '#00A9E0' }} />
                        <span>Counsellor Login</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={toggleMenu}
                  className="text-white hover:text-[#00A9E0] transition-colors"
                >
                  {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden" style={{ backgroundColor: '#080C68' }}>
              <div className="px-4 pt-2 pb-4 space-y-3 border-t" style={{ borderColor: '#24348A' }}>
                <button 
                  onClick={() => {
                    scrollToTop();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-white/80 hover:text-[#00A9E0] transition-colors font-medium py-2"
                >
                  Home
                </button>
                <button 
                  onClick={() => {
                    scrollToSection('features');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-white/80 hover:text-[#00A9E0] transition-colors font-medium py-2"
                >
                  Features
                </button>
                <button 
                  onClick={() => {
                    scrollToSection('about');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-white/80 hover:text-[#00A9E0] transition-colors font-medium py-2"
                >
                  About
                </button>
                <button 
                  onClick={() => {
                    scrollToSection('contact');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-white/80 hover:text-[#00A9E0] transition-colors font-medium py-2"
                >
                  Contact
                </button>
                
                {/* Mobile Login Options */}
                <div className="pt-2 space-y-2">
                  <button 
                    onClick={() => {
                      handleLoginClick('superadmin');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-white/80 hover:text-[#00A9E0] hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Shield size={18} style={{ color: '#00A9E0' }} />
                    <span>Super Admin Login</span>
                  </button>
                  <button 
                    onClick={() => {
                      handleLoginClick('counsellor');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-white/80 hover:text-[#00A9E0] hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Users size={18} style={{ color: '#00A9E0' }} />
                    <span>Counsellor Login</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        role={selectedRole}
      />
    </>
  );
};

export default Navbar;