import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Building2,
  ArrowRight,
  AlertCircle,
  School,
  Hash,
  Phone,
  MapPin,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../config/api';

const Login = ({ isOpen, onClose }) => {
  // States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form data
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Register form data
  const [registerData, setRegisterData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  // Toast configuration
  const toastConfig = {
    position: "top-right",
    autoClose: 4000,
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

  // Handle login input changes
  const handleLoginChange = (e) => {
    console.log('📝 Login input change:', e.target.name, e.target.value);
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  // Handle register input changes
  const handleRegisterChange = (e) => {
    console.log('📝 Register input change:', e.target.name, e.target.value);
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('🔑 Login form submitted');
    setLoading(true);
    setError('');
    setSuccess('');

    if (!loginData.email || !loginData.password) {
      console.log('❌ Login validation failed: Missing fields');
      setError('Please fill in all fields');
      toast.error('Please fill in all fields', toastConfig);
      setLoading(false);
      return;
    }

    console.log('📤 Sending login request to:', `${API_BASE_URL}/api/auth/login`);
    console.log('📤 Login payload:', {
      email: loginData.email,
      password: '***hidden***',
      role: 'INSTITUTION_ADMIN'
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
          role: 'INSTITUTION_ADMIN',
        }),
      });

      console.log('📥 Login response status:', response.status);
      console.log('📥 Login response headers:', response.headers);

      const data = await response.json();
      console.log('📥 Login response data:', data);

      if (response.ok) {
        console.log('✅ Login successful');
        console.log('👤 User data:', data.user);
        console.log('🔑 Token received:', data.token ? 'Yes' : 'No');
        
        // Check if institution is active
        if (!data.user.active) {
          console.log('⚠️ Institution is not active');
          toast.warning('⏳ Your account is not activated yet. Please contact Super Admin.', toastConfig);
          setLoading(false);
          return;
        }

        console.log('✅ Institution is active, proceeding with login');
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('💾 Token and user data stored in localStorage');
        
        setSuccess('Login successful! Redirecting...');
        toast.success('✅ Login successful!', toastConfig);
        
        setTimeout(() => {
          console.log('🔄 Redirecting to dashboard');
          onClose();
          window.location.href = '/admin/dashboard';
        }, 1000);
      } else {
        console.log('❌ Login failed:', data.message);
        const errorMessage = data.message || 'Invalid credentials';
        setError(errorMessage);
        toast.error(errorMessage, toastConfig);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error stack:', error.stack);
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.', toastConfig);
    } finally {
      setLoading(false);
      console.log('🔒 Login process completed');
    }
  };

  // Handle registration submission
  const handleRegister = async (e) => {
    e.preventDefault();
    console.log('📝 Registration form submitted');
    setLoading(true);
    setError('');
    setSuccess('');

    const { name, code, email, phone, address, password, confirmPassword } = registerData;
    console.log('📋 Registration data:', { name, code, email, phone, address });
    
    if (!name || !code || !email || !phone || !address || !password || !confirmPassword) {
      console.log('❌ Registration validation failed: Missing fields');
      setError('Please fill in all fields');
      toast.error('Please fill in all fields', toastConfig);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      console.log('❌ Registration validation failed: Passwords do not match');
      setError('Passwords do not match');
      toast.error('Passwords do not match', toastConfig);
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      console.log('❌ Registration validation failed: Password too short');
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters', toastConfig);
      setLoading(false);
      return;
    }

    console.log('📤 Sending registration request to:', `${API_BASE_URL}/api/auth/register`);
    console.log('📤 Registration payload:', {
      name,
      code,
      email,
      phone,
      address,
      password: '***hidden***'
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          code: code,
          email: email,
          phone: phone,
          address: address,
          password: password,
        }),
      });

      console.log('📥 Registration response status:', response.status);
      console.log('📥 Registration response headers:', response.headers);

      const data = await response.json();
      console.log('📥 Registration response data:', data);

      if (response.ok) {
        console.log('✅ Registration successful');
        console.log('📦 Institution data:', data.data);
        console.log('📝 Message:', data.message);
        
        setSuccess('Institution registered successfully!');
        toast.success('✅ Institution registered successfully! Please wait for Super Admin activation.', {
          ...toastConfig,
          autoClose: 5000,
        });
        
        setTimeout(() => {
          console.log('🔄 Switching to login mode');
          setIsRegisterMode(false);
          setSuccess('');
          setLoginData({ email: registerData.email, password: '' });
          setRegisterData({
            name: '',
            code: '',
            email: '',
            phone: '',
            address: '',
            password: '',
            confirmPassword: '',
          });
          console.log('✅ Registration form reset, switched to login');
        }, 2000);
      } else {
        console.log('❌ Registration failed:', data.message);
        const errorMessage = data.message || 'Failed to register institution';
        setError(errorMessage);
        toast.error(errorMessage, toastConfig);
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error stack:', error.stack);
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.', toastConfig);
    } finally {
      setLoading(false);
      console.log('📝 Registration process completed');
    }
  };

  // Toggle between login and register
  const toggleRegisterMode = () => {
    console.log('🔄 Toggling between login and register modes');
    console.log('Current mode:', isRegisterMode ? 'Register' : 'Login');
    console.log('New mode:', isRegisterMode ? 'Login' : 'Register');
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setSuccess('');
    setLoginData({ email: '', password: '' });
    setRegisterData({
      name: '',
      code: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
    });
    console.log('✅ Forms reset');
  };

  if (!isOpen) {
    console.log('❌ Login modal is closed');
    return null;
  }

  console.log('🔓 Login modal is open, current mode:', isRegisterMode ? 'Register' : 'Login');

  // Dynamic width based on mode
  const modalWidth = isRegisterMode 
    ? 'max-w-[480px] sm:max-w-[520px] lg:max-w-[1000px]'
    : 'max-w-[480px] sm:max-w-[520px] lg:max-w-[520px]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
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
        onClick={() => {
          console.log('🔴 Backdrop clicked, closing modal');
          onClose();
        }}
      />

      {/* Modal - Dynamic width based on mode */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${modalWidth} max-h-[90vh] overflow-y-auto animate-fadeIn`}>
        {/* Close Button */}
        <button
          onClick={() => {
            console.log('❌ Close button clicked');
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-6 text-center border-b border-gray-100">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-[#EEF9FF] flex items-center justify-center">
              {isRegisterMode ? (
                <Building2 size={32} className="text-[#00A9E0]" />
              ) : (
                <Lock size={32} className="text-[#00A9E0]" />
              )}
            </div>
          </div>
          
          {isRegisterMode ? (
            <>
              <h2 className="text-2xl font-bold text-[#080C68]">Register Institution</h2>
              <p className="text-sm text-gray-500 mt-1">Create a new institution account</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-[#080C68]">Admin Portal</h2>
              <p className="text-sm text-gray-500 mt-1">Secure Access</p>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 sm:mx-8 lg:mx-10 mt-4 p-3 rounded-lg bg-red-50 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mx-6 sm:mx-8 lg:mx-10 mt-4 p-3 rounded-lg bg-green-50 flex items-center gap-2 text-green-600 text-sm">
            <span>{success}</span>
          </div>
        )}

        {/* Login Form */}
        {!isRegisterMode && (
          <form onSubmit={handleLogin} className="px-6 sm:px-8 lg:px-10 py-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                ADMIN EMAIL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="admin@gmit.edu.in"
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
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    console.log('👁️ Password visibility toggled:', !showPassword);
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#080C68] hover:bg-[#05094f] text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
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

            {/* Register Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                Need a new admin account?{' '}
                <button
                  type="button"
                  onClick={toggleRegisterMode}
                  className="text-[#00A9E0] hover:text-[#008FC2] font-semibold transition-colors"
                >
                  Register Here
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Register Form */}
        {isRegisterMode && (
          <form onSubmit={handleRegister} className="px-6 sm:px-8 lg:px-10 py-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Institution Name */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                  INSTITUTION NAME <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <School size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    placeholder="Enter institution name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20 transition-all"
                  />
                </div>
              </div>

              {/* Institution Code */}
              <div>
                <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                  INSTITUTION CODE <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="code"
                    value={registerData.code}
                    onChange={handleRegisterChange}
                    placeholder="Example: GMIT001"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                  EMAIL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    placeholder="admin@institution.edu"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                  PHONE NUMBER <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20 transition-all"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                  ADDRESS <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={registerData.address}
                    onChange={handleRegisterChange}
                    placeholder="City, State"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                  PASSWORD <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      console.log('👁️ Password visibility toggled:', !showPassword);
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                  CONFIRM PASSWORD <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      console.log('👁️ Confirm password visibility toggled:', !showConfirmPassword);
                      setShowConfirmPassword(!showConfirmPassword);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Register Institution</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Back to Login Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={toggleRegisterMode}
                  className="text-[#00A9E0] hover:text-[#008FC2] font-semibold transition-colors"
                >
                  Login Here
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;