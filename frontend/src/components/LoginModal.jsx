import React, { useState } from 'react';
import { X, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';

const LoginModal = ({ isOpen, onClose, role }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API URL - Use localhost or deployed
  const API_URL = 'https://studentaibackend.vercel.app';  // For local backend
  // const API_URL = 'https://studentaibackend.vercel.app';  // For deployed backend

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🚀 Login attempt started');
    console.log('📧 Email:', email);
    console.log('🔑 Role:', role);
    console.log('🔗 API URL:', API_URL);

    try {
      // Build login data based on role
      let loginData = {
        email,
        password,
      };

      // Set role based on user selection
      if (role === 'superadmin') {
        loginData.role = 'SUPER_ADMIN';
        console.log('👑 Super Admin login detected');
      } else if (role === 'student') {
        loginData.role = 'STUDENT';
        console.log('🎓 Student login detected');
      } else {
        console.log('⚠️ No role provided, sending without role');
      }

      console.log('📤 Sending login request:', { 
        email: loginData.email, 
        role: loginData.role || 'No role sent',
        passwordLength: loginData.password?.length || 0
      });

      // Call backend API
      console.log('🌐 Fetching:', `${API_URL}/api/auth/login`);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response status text:', response.statusText);

      const data = await response.json();
      console.log('📦 Full response data:', JSON.stringify(data, null, 2));

      if (response.ok) {
        console.log('✅ Login successful!');
        console.log('👤 User data:', data.user);
        console.log('🔑 Token received:', data.token ? 'Yes' : 'No');
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('💾 Token and user data saved to localStorage');
        
        // Redirect based on role
        console.log('🔄 Redirecting based on role:', data.user.role);
        if (data.user.role === 'SUPER_ADMIN') {
          console.log('🏠 Redirecting to: /super-admin/dashboard');
          window.location.href = '/super-admin/dashboard';
        } else if (data.user.role === 'STUDENT') {
          console.log('🏠 Redirecting to: /student/dashboard');
          window.location.href = '/student/dashboard';
        } else {
          console.log('🏠 Redirecting to: /dashboard');
          window.location.href = '/dashboard';
        }
        
        onClose();
      } else {
        console.error('❌ Login failed with status:', response.status);
        console.error('❌ Error data:', data);
        
        if (response.status === 401) {
          console.log('🔒 Unauthorized - Invalid credentials');
          setError('Invalid email or password. Please try again.');
        } else if (response.status === 404) {
          console.log('🔍 User not found');
          setError('User not found. Please check your credentials.');
        } else if (response.status === 500) {
          console.log('💥 Server error');
          setError('Server error. Please try again later.');
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
        console.error('Login error:', data);
      }
    } catch (err) {
      console.error('❌ NETWORK ERROR:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error stack:', err.stack);
      
      if (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED')) {
        console.log('🌐 Network connection failed - Backend not running');
        setError('Cannot connect to server. Please make sure the backend is running on port 5000.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      console.log('🏁 Login attempt completed');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  console.log('🔄 LoginModal is open for role:', role);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EEF9FF' }}>
              <Shield size={32} style={{ color: '#00A9E0' }} />
            </div>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#080C68' }}>
            {role === 'superadmin' ? 'Super Admin Login' : 'Student Login'}
          </h2>
          <p className="text-sm mt-1" style={{ color: '#52617A' }}>
            Enter your credentials to access the dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#080C68' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
              style={{ backgroundColor: '#F5FBFF' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#080C68' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
                style={{ backgroundColor: '#F5FBFF' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-medium text-white transition-all hover:scale-105 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#00A9E0' }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm mt-4" style={{ color: '#52617A' }}>
          Contact admin if you forgot your credentials
        </p>
      </div>
    </div>
  );
};

export default LoginModal;