import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  GraduationCap,
  ArrowRight,
  AlertCircle,
  User
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../config/api';

const FacultyLogin = ({ isOpen, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Toast configuration - Small width and height
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

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields');
      toast.error('Please fill in all fields', toastConfig);
      setLoading(false);
      return;
    }

    try {
      // Use the main auth login endpoint with FACULTY role
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
          role: 'FACULTY',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (!data.user.active) {
          toast.warning('⏳ Your account is not activated yet. Please contact Admin.', toastConfig);
          setLoading(false);
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccess('Login successful! Redirecting...');
        toast.success('✅ Login successful!', toastConfig);
        
        setTimeout(() => {
          onClose();
          window.location.href = '/faculty/dashboard';
        }, 1000);
      } else {
        setError(data.message || 'Invalid credentials');
        toast.error(data.message || 'Invalid credentials', toastConfig);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.', toastConfig);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Toast Container */}
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

      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-[#EEF9FF] flex items-center justify-center">
              <GraduationCap size={32} className="text-[#00A9E0]" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-[#080C68]">Faculty Portal</h2>
          <p className="text-sm text-gray-500 mt-1">Secure Access</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-4 p-3 rounded-lg bg-red-50 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mx-8 mt-4 p-3 rounded-lg bg-green-50 flex items-center gap-2 text-green-600 text-sm">
            <span>{success}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="px-8 py-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
              FACULTY EMAIL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleChange}
                placeholder="faculty@institution.edu"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
              PASSWORD <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={loginData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Secure Login</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-500">
              Contact admin if you forgot your credentials
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyLogin;