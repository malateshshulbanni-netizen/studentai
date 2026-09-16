import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  Building2, 
  Hash,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000';

  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      width: '320px',
      minHeight: '60px',
      padding: '10px 16px',
      fontSize: '14px',
      borderRadius: '8px',
    },
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse user data:', e);
        toast.error('Failed to load profile data', toastConfig);
      }
    }
    setLoading(false);
  }, []);

  // Back button handler
  const handleBack = () => {
    navigate(-1); // goes to previous page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="text-[#00A9E0] animate-spin" />
        <span className="ml-3 text-gray-500">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ width: '320px' }}
        toastStyle={{
          minHeight: '60px',
          padding: '10px 16px',
          fontSize: '14px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      />

      {/* Header with Back Button */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex-shrink-0"
            title="Go back"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-[#080C68]">My Profile</h1>
        </div>
        <p className="text-gray-500 ml-12">View your personal information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#F5FBFF] to-white p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-[#00A9E0] flex items-center justify-center flex-shrink-0">
              <User size={40} className="text-white" />
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h2 className="text-xl font-bold text-[#080C68] truncate">
                {user?.name || 'Student'}
              </h2>
              <p className="text-sm text-gray-500 truncate">
                {user?.email || 'student@example.com'}
              </p>
              {user?.usn && (
                <span className="inline-block mt-2 px-3 py-1 bg-[#00A9E0]/10 text-[#00A9E0] text-xs font-semibold rounded-full">
                  USN: {user.usn}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-[#080C68] mb-4 flex items-center gap-2">
            <User size={16} className="text-[#00A9E0]" />
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Full Name
              </label>
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span className="text-[#080C68] font-medium">{user?.name || '-'}</span>
              </div>
            </div>

            {/* USN */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                USN / Roll Number
              </label>
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-gray-400" />
                <span className="text-[#080C68] font-medium">{user?.usn || '-'}</span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Email Address
              </label>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                <span className="text-[#080C68] font-medium truncate">{user?.email || '-'}</span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Phone Number
              </label>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <span className="text-[#080C68] font-medium">{user?.phone || '-'}</span>
              </div>
            </div>

            {/* Course */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Course
              </label>
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-gray-400" />
                <span className="text-[#080C68] font-medium">{user?.course || '-'}</span>
              </div>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Branch
              </label>
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-gray-400" />
                <span className="text-[#080C68] font-medium">{user?.branch || '-'}</span>
              </div>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Semester
              </label>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-[#080C68] font-medium">
                  {user?.semester ? `Semester ${user.semester}` : '-'}
                </span>
              </div>
            </div>

            {/* Institution */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Institution
              </label>
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-gray-400" />
                <span className="text-[#080C68] font-medium">
                  {user?.institutionName || 'Your Institution'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;