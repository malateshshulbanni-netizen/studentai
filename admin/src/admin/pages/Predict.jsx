import React, { useState } from 'react';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Activity,
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Loader2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Upload,
  FileText,
  Download,
  Search,
  Users
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../config/api';

const Predict = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [batchResults, setBatchResults] = useState([]);
  const [error, setError] = useState('');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    semester: '',
    attendance: '',
    gpa: '',
    backlogs: '',
    assignment_completion: '',
    engagement: 'Medium'
  });

  const [errors, setErrors] = useState({});

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

  const handleChange = (e) => {
    setStudentData({
      ...studentData,
      [e.target.name]: e.target.value
    });
    setError('');
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!studentData.name.trim()) newErrors.name = 'Name is required';
    if (!studentData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(studentData.email)) newErrors.email = 'Valid email is required';
    if (!studentData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(studentData.phone)) newErrors.phone = 'Valid 10-digit phone is required';
    if (!studentData.course.trim()) newErrors.course = 'Course is required';
    if (!studentData.semester.trim()) newErrors.semester = 'Semester is required';
    if (!studentData.attendance) newErrors.attendance = 'Attendance is required';
    else if (studentData.attendance < 0 || studentData.attendance > 100) newErrors.attendance = 'Attendance must be between 0-100';
    if (!studentData.gpa) newErrors.gpa = 'GPA is required';
    else if (studentData.gpa < 0 || studentData.gpa > 10) newErrors.gpa = 'GPA must be between 0-10';
    if (studentData.backlogs === '') newErrors.backlogs = 'Backlogs is required';
    else if (studentData.backlogs < 0) newErrors.backlogs = 'Backlogs cannot be negative';
    if (!studentData.assignment_completion) newErrors.assignment_completion = 'Assignment completion is required';
    else if (studentData.assignment_completion < 0 || studentData.assignment_completion > 100) {
      newErrors.assignment_completion = 'Assignment completion must be between 0-100';
    }
    if (!studentData.engagement) newErrors.engagement = 'Engagement is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    
    setError('');
    
    if (!validateForm()) {
      toast.error('Please fix all validation errors', toastConfig);
      return;
    }

    setLoading(true);
    setResult(null);
    setBatchResults([]);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again', toastConfig);
        setLoading(false);
        return;
      }

      const payload = {
        attendance: parseFloat(studentData.attendance),
        gpa: parseFloat(studentData.gpa),
        backlogs: parseInt(studentData.backlogs),
        assignment_completion: parseFloat(studentData.assignment_completion),
        engagement: studentData.engagement
      };

      console.log('📤 Sending prediction request:', payload);

      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('📥 Prediction response:', data);

      if (response.ok) {
        setResult({
          ...data.data,
          studentInfo: {
            name: studentData.name,
            email: studentData.email,
            phone: studentData.phone,
            course: studentData.course,
            semester: studentData.semester
          }
        });
        toast.success('✅ Prediction completed successfully!', toastConfig);
      } else {
        const errorMsg = data.message || data.detail || 'Prediction failed';
        setError(errorMsg);
        toast.error(errorMsg, toastConfig);
        
        if (response.status === 503) {
          toast.error('ML Service is not available. Please contact administrator.', {
            ...toastConfig,
            autoClose: 6000
          });
        }
      }
    } catch (error) {
      console.error('❌ Prediction error:', error);
      setError('Network error. Please check your connection.');
      toast.error('Network error. Please try again.', toastConfig);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file', toastConfig);
      return;
    }

    setSelectedFile(file);
    setUploading(true);
    setBatchResults([]);
    setError('');

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Check required columns
      const requiredColumns = ['attendance', 'gpa', 'backlogs', 'assignment_completion', 'engagement'];
      const missingColumns = requiredColumns.filter(col => !headers.some(h => h.toLowerCase().includes(col)));
      
      if (missingColumns.length > 0) {
        toast.error(`Missing columns: ${missingColumns.join(', ')}`, toastConfig);
        setUploading(false);
        return;
      }

      // Parse CSV
      const students = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.trim());
        const student = {};
        headers.forEach((header, index) => {
          const value = values[index] || '';
          const headerLower = header.toLowerCase();
          if (headerLower.includes('attendance')) student.attendance = parseFloat(value) || 0;
          else if (headerLower.includes('gpa')) student.gpa = parseFloat(value) || 0;
          else if (headerLower.includes('backlog')) student.backlogs = parseInt(value) || 0;
          else if (headerLower.includes('assignment') || headerLower.includes('completion')) {
            student.assignment_completion = parseFloat(value) || 0;
          } else if (headerLower.includes('engagement')) student.engagement = value || 'Medium';
          else if (headerLower.includes('name')) student.name = value || `Student ${i}`;
          else if (headerLower.includes('email')) student.email = value || `student${i}@example.com`;
          else if (headerLower.includes('phone')) student.phone = value || '9876543210';
          else if (headerLower.includes('course')) student.course = value || 'BE - Computer Science';
          else if (headerLower.includes('semester')) student.semester = value || '3';
        });
        
        // Ensure required fields have default values
        if (!student.name) student.name = `Student ${i}`;
        if (!student.email) student.email = `student${i}@example.com`;
        if (!student.phone) student.phone = '9876543210';
        if (!student.course) student.course = 'BE - Computer Science';
        if (!student.semester) student.semester = '3';
        if (!student.engagement) student.engagement = 'Medium';
        
        students.push(student);
      }

      if (students.length === 0) {
        toast.error('No valid student data found in CSV', toastConfig);
        setUploading(false);
        return;
      }

      toast.info(`Processing ${students.length} students...`, toastConfig);
      
      // Process batch predictions
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again', toastConfig);
        setUploading(false);
        return;
      }

      const results = [];
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        try {
          const payload = {
            attendance: parseFloat(student.attendance) || 0,
            gpa: parseFloat(student.gpa) || 0,
            backlogs: parseInt(student.backlogs) || 0,
            assignment_completion: parseFloat(student.assignment_completion) || 0,
            engagement: student.engagement || 'Medium'
          };

          const response = await fetch(`${API_BASE_URL}/api/predict`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });

          const data = await response.json();
          
          if (response.ok) {
            results.push({
              ...data.data,
              studentInfo: {
                name: student.name || `Student ${i + 1}`,
                email: student.email || `student${i+1}@example.com`,
                phone: student.phone || '9876543210',
                course: student.course || 'BE - Computer Science',
                semester: student.semester || '3'
              }
            });
          } else {
            results.push({
              error: data.message || 'Prediction failed',
              studentInfo: {
                name: student.name || `Student ${i + 1}`,
                email: student.email || `student${i+1}@example.com`
              }
            });
          }
        } catch (err) {
          results.push({
            error: 'Network error',
            studentInfo: {
              name: student.name || `Student ${i + 1}`,
              email: student.email || `student${i+1}@example.com`
            }
          });
        }
      }

      setBatchResults(results);
      toast.success(`✅ Processed ${results.length} students successfully!`, toastConfig);
      
    } catch (error) {
      console.error('❌ File upload error:', error);
      toast.error('Error processing CSV file', toastConfig);
    } finally {
      setUploading(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'HIGH': return 'text-red-500 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-green-500 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch(level) {
      case 'HIGH': return <AlertTriangle size={20} className="text-red-500" />;
      case 'MEDIUM': return <TrendingUp size={20} className="text-yellow-500" />;
      case 'LOW': return <CheckCircle size={20} className="text-green-500" />;
      default: return <Activity size={20} className="text-gray-500" />;
    }
  };

  const getRiskRecommendations = (level) => {
    switch(level) {
      case 'HIGH':
        return [
          'Schedule immediate counseling session',
          'Assign a mentor for regular check-ins',
          'Create personalized academic support plan',
          'Contact parents/guardians',
          'Monitor attendance and performance daily'
        ];
      case 'MEDIUM':
        return [
          'Monitor attendance and performance weekly',
          'Encourage participation in study groups',
          'Provide additional academic resources',
          'Schedule a meeting with student'
        ];
      case 'LOW':
        return [
          'Continue regular monitoring',
          'Encourage advanced learning opportunities',
          'Maintain engagement activities',
          'Provide positive reinforcement'
        ];
      default:
        return ['No recommendations available'];
    }
  };

  const filteredResults = batchResults.filter(result =>
    result.studentInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.studentInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskBadgeColor = (level) => {
    switch(level) {
      case 'HIGH': return 'bg-red-100 text-red-600';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-600';
      case 'LOW': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const exportResults = () => {
    if (batchResults.length === 0) return;
    
    let csv = 'Name,Email,Risk Level,Probability\n';
    batchResults.forEach(r => {
      if (!r.error) {
        csv += `${r.studentInfo.name},${r.studentInfo.email},${r.risk_level},${(r.probability * 100).toFixed(1)}%\n`;
      }
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prediction_results.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('✅ Results exported successfully!', toastConfig);
  };

  return (
    <div>
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

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#080C68] flex items-center gap-2">
              <Brain size={28} className="text-[#00A9E0]" />
              Predict Dropout Risk
            </h1>
            <p className="text-gray-500 mt-1">Enter student details or upload CSV for batch prediction</p>
          </div>
          <button
            onClick={() => setIsBatchMode(!isBatchMode)}
            className={`px-4 py-2 rounded-lg font-semibold transition shadow-sm ${
              isBatchMode 
                ? 'bg-[#080C68] text-white hover:bg-[#05094f]' 
                : 'bg-[#00A9E0] text-white hover:bg-[#008FC2]'
            }`}
          >
            {isBatchMode ? 'Single Student' : 'Batch Upload'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-600 font-medium">Prediction Error</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
          <button 
            onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Single Student Mode */}
      {!isBatchMode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-[#080C68] mb-4">Student Details</h2>
            
            <form onSubmit={handlePredict} className="space-y-4">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#080C68] mb-1">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={studentData.name}
                    onChange={handleChange}
                    placeholder="Enter name"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#080C68] mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={studentData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#080C68] mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={studentData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#080C68] mb-1">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="course"
                    value={studentData.course}
                    onChange={handleChange}
                    placeholder="Enter course"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.course ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#080C68] mb-1">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="semester"
                    value={studentData.semester}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.semester ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8</option>
                  </select>
                  {errors.semester && <p className="text-red-500 text-xs mt-1">{errors.semester}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#080C68] mb-1">
                    Engagement Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="engagement"
                    value={studentData.engagement}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.engagement ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  {errors.engagement && <p className="text-red-500 text-xs mt-1">{errors.engagement}</p>}
                </div>
              </div>

              {/* Academic Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#080C68] mb-1">
                    Attendance (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="attendance"
                    value={studentData.attendance}
                    onChange={handleChange}
                    placeholder="0-100"
                    min="0"
                    max="100"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.attendance ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.attendance && <p className="text-red-500 text-xs mt-1">{errors.attendance}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#080C68] mb-1">
                    GPA (0-10) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="gpa"
                    value={studentData.gpa}
                    onChange={handleChange}
                    placeholder="0-10"
                    min="0"
                    max="10"
                    step="0.1"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.gpa ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.gpa && <p className="text-red-500 text-xs mt-1">{errors.gpa}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#080C68] mb-1">
                    Backlogs <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="backlogs"
                    value={studentData.backlogs}
                    onChange={handleChange}
                    placeholder="Number of backlogs"
                    min="0"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.backlogs ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.backlogs && <p className="text-red-500 text-xs mt-1">{errors.backlogs}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#080C68] mb-1">
                    Assignment Completion (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="assignment_completion"
                    value={studentData.assignment_completion}
                    onChange={handleChange}
                    placeholder="0-100"
                    min="0"
                    max="100"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.assignment_completion ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.assignment_completion && <p className="text-red-500 text-xs mt-1">{errors.assignment_completion}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <Brain size={20} />
                    Predict Dropout Risk
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-[#080C68] mb-4">Prediction Result</h2>
            
            {result ? (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-[#080C68] mb-2">Student Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> <span className="font-medium">{result.studentInfo.name}</span></p>
                    <p><span className="text-gray-500">Email:</span> <span className="font-medium">{result.studentInfo.email}</span></p>
                    <p><span className="text-gray-500">Course:</span> <span className="font-medium">{result.studentInfo.course}</span></p>
                    <p><span className="text-gray-500">Semester:</span> <span className="font-medium">{result.studentInfo.semester}</span></p>
                  </div>
                </div>

                {/* Risk Result */}
                <div className={`border-2 rounded-xl p-6 text-center ${getRiskColor(result.risk_level)}`}>
                  <div className="flex flex-col items-center">
                    {getRiskIcon(result.risk_level)}
                    <h3 className="text-2xl font-bold mt-3">Risk Level: {result.risk_level}</h3>
                    <p className="text-sm mt-1">Probability: {(result.probability * 100).toFixed(1)}%</p>
                    <p className="text-sm mt-2">
                      {result.risk_level === 'HIGH' && '⚠️ Student is at high risk of dropping out. Immediate intervention needed!'}
                      {result.risk_level === 'MEDIUM' && '📊 Student shows medium risk. Monitor progress and provide support.'}
                      {result.risk_level === 'LOW' && '✅ Student is on track. Continue current support and monitoring.'}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h4 className="font-medium text-[#080C68] flex items-center gap-2">
                    <Sparkles size={18} className="text-[#00A9E0]" />
                    Recommendations
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    {getRiskRecommendations(result.risk_level).map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-gray-400">
                <div>
                  <Brain size={64} className="mx-auto mb-4 opacity-20" />
                  <p>Enter student details and click</p>
                  <p className="font-medium">"Predict Dropout Risk"</p>
                  <p className="text-sm">to see results here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Batch Upload Mode */}
      {isBatchMode && (
        <div className="grid grid-cols-1 gap-6">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-[#080C68] mb-4 flex items-center gap-2">
              <Upload size={20} className="text-[#00A9E0]" />
              Upload CSV for Batch Prediction
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Upload a CSV file with student data. Required columns: attendance, gpa, backlogs, assignment_completion, engagement
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
              />
              <button
                onClick={() => document.querySelector('input[type="file"]').click()}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition shadow-sm"
              >
                <FileText size={18} />
                Choose File
              </button>
            </div>
            {selectedFile && (
              <p className="text-sm text-green-600 mt-2">📄 Selected: {selectedFile.name}</p>
            )}
            {uploading && (
              <div className="mt-4 flex items-center gap-2 text-gray-500">
                <Loader2 size={20} className="animate-spin" />
                Processing students...
              </div>
            )}
          </div>

          {/* Results Section */}
          {batchResults.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#080C68] flex items-center gap-2">
                  <Users size={20} className="text-[#00A9E0]" />
                  Prediction Results ({batchResults.length} students)
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={exportResults}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-sm"
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
                />
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F8FAFF] border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#080C68]">Student</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#080C68]">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#080C68]">Risk Level</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#080C68]">Probability</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#080C68]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                          {searchTerm ? 'No students found matching your search' : 'No results to display'}
                        </td>
                      </tr>
                    ) : (
                      filteredResults.map((result, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-[#080C68] text-sm">{result.studentInfo.name}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{result.studentInfo.email}</td>
                          <td className="px-4 py-3">
                            {result.error ? (
                              <span className="text-xs text-red-500">Error</span>
                            ) : (
                              <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getRiskBadgeColor(result.risk_level)}`}>
                                {result.risk_level}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {result.error ? '-' : `${(result.probability * 100).toFixed(1)}%`}
                          </td>
                          <td className="px-4 py-3">
                            {result.error ? (
                              <span className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle size={14} />
                                {result.error}
                              </span>
                            ) : (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle size={14} />
                                Completed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Predict;