import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  X,
  User,
  Mail,
  Phone,
  BookOpen,
  Building2,
  Hash,
  Loader2,
  Edit,
  Trash2,
  Eye,
  Lock,
  Calendar,
  Award,
  Briefcase
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../config/api';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [nextEmployeeId, setNextEmployeeId] = useState(1);

  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    department: '',
    designation: '',
    qualification: '',
    specialization: '',
    mobile: '',
    email: '',
    dateOfJoining: '',
    facultyType: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [editFormData, setEditFormData] = useState({
    fullName: '',
    department: '',
    designation: '',
    qualification: '',
    specialization: '',
    mobile: '',
    email: '',
    dateOfJoining: '',
    facultyType: '',
    username: '',
  });

  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

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

  // Get institution from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setInstitution(user);
        setFormData(prev => ({
          ...prev,
          institution: user.name || user.institution || ''
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    fetchFaculty();
  }, []);

  // Fetch faculty
  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/faculty`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setFaculty(data.data || []);
        // Calculate next employee ID
        if (data.data && data.data.length > 0) {
          const maxId = Math.max(...data.data.map(f => parseInt(f.employeeId) || 0));
          setNextEmployeeId(maxId + 1);
        }
      } else {
        toast.error(data.message || 'Failed to fetch faculty', toastConfig);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
      toast.error('Network error. Please try again.', toastConfig);
    } finally {
      setLoading(false);
    }
  };

  // Generate employee ID
  const generateEmployeeId = () => {
    const id = String(nextEmployeeId).padStart(2, '0');
    return id;
  };

  // Open add modal
  const openAddModal = () => {
    const newEmployeeId = generateEmployeeId();
    setFormData({
      employeeId: newEmployeeId,
      fullName: '',
      department: '',
      designation: '',
      qualification: '',
      specialization: '',
      mobile: '',
      email: '',
      dateOfJoining: '',
      facultyType: '',
      username: '',
      password: '',
      confirmPassword: '',
      institution: institution?.name || ''
    });
    setErrors({});
    setShowModal(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
    if (editErrors[e.target.name]) {
      setEditErrors({
        ...editErrors,
        [e.target.name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile is required';
    else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Valid 10-digit phone is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.dateOfJoining) newErrors.dateOfJoining = 'Date of Joining is required';
    if (!formData.facultyType) newErrors.facultyType = 'Faculty Type is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate edit form
  const validateEditForm = () => {
    const newErrors = {};
    if (!editFormData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!editFormData.department.trim()) newErrors.department = 'Department is required';
    if (!editFormData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!editFormData.qualification.trim()) newErrors.qualification = 'Qualification is required';
    if (!editFormData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!editFormData.mobile.trim()) newErrors.mobile = 'Mobile is required';
    else if (!/^\d{10}$/.test(editFormData.mobile)) newErrors.mobile = 'Valid 10-digit phone is required';
    if (!editFormData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(editFormData.email)) newErrors.email = 'Valid email is required';
    if (!editFormData.dateOfJoining) newErrors.dateOfJoining = 'Date of Joining is required';
    if (!editFormData.facultyType) newErrors.facultyType = 'Faculty Type is required';
    if (!editFormData.username) newErrors.username = 'Username is required';
    
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle register faculty
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again', toastConfig);
        setLoading(false);
        return;
      }

      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const institutionId = user?.institutionId || user?._id;

      if (!institutionId) {
        toast.error('Institution ID not found. Please contact admin.', toastConfig);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/faculty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          fullName: formData.fullName,
          department: formData.department,
          designation: formData.designation,
          qualification: formData.qualification,
          specialization: formData.specialization,
          mobile: formData.mobile,
          email: formData.email,
          dateOfJoining: formData.dateOfJoining,
          facultyType: formData.facultyType,
          username: formData.username,
          password: formData.password,
          institutionId: institutionId,
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setFaculty([data.data, ...faculty]);
        setNextEmployeeId(nextEmployeeId + 1);
        setShowModal(false);
        resetForm();
        toast.success('✅ Faculty registered successfully!', toastConfig);
      } else {
        toast.error(data.message || 'Failed to register faculty', toastConfig);
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Network error. Please try again.', toastConfig);
    } finally {
      setLoading(false);
    }
  };

  // Handle update faculty
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again', toastConfig);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/faculty/${editingFaculty._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: editFormData.fullName,
          department: editFormData.department,
          designation: editFormData.designation,
          qualification: editFormData.qualification,
          specialization: editFormData.specialization,
          mobile: editFormData.mobile,
          email: editFormData.email,
          dateOfJoining: editFormData.dateOfJoining,
          facultyType: editFormData.facultyType,
          username: editFormData.username,
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setFaculty(faculty.map(f => 
          f._id === editingFaculty._id ? data.data : f
        ));
        setShowEditModal(false);
        toast.success('✅ Faculty updated successfully!', toastConfig);
      } else {
        toast.error(data.message || 'Failed to update faculty', toastConfig);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Network error. Please try again.', toastConfig);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete faculty
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/faculty/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setFaculty(faculty.filter(f => f._id !== id));
        toast.success('✅ Faculty deleted successfully!', toastConfig);
      } else {
        toast.error(data.message || 'Failed to delete faculty', toastConfig);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Network error. Please try again.', toastConfig);
    }
  };

  // View faculty
  const handleView = (facultyItem) => {
    setSelectedFaculty(facultyItem);
    setShowViewModal(true);
  };

  // Edit faculty
  const handleEdit = (facultyItem) => {
    setEditingFaculty(facultyItem);
    setEditFormData({
      fullName: facultyItem.fullName || '',
      department: facultyItem.department || '',
      designation: facultyItem.designation || '',
      qualification: facultyItem.qualification || '',
      specialization: facultyItem.specialization || '',
      mobile: facultyItem.mobile || '',
      email: facultyItem.email || '',
      dateOfJoining: facultyItem.dateOfJoining ? facultyItem.dateOfJoining.split('T')[0] : '',
      facultyType: facultyItem.facultyType || '',
      username: facultyItem.username || '',
    });
    setShowEditModal(true);
    setEditErrors({});
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      employeeId: '',
      fullName: '',
      department: '',
      designation: '',
      qualification: '',
      specialization: '',
      mobile: '',
      email: '',
      dateOfJoining: '',
      facultyType: '',
      username: '',
      password: '',
      confirmPassword: '',
      institution: institution?.name || ''
    });
    setErrors({});
  };

  // Filter faculty
  const filteredFaculty = faculty.filter(f =>
    f.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Faculty Types - Updated
  const facultyTypes = [
    'Regular',
    'Contract',
    'Guest',
    'Visiting',
    'Part-Time'
  ];

  // Departments
  const departments = [
    'Computer Science and Engineering',
    'Information Science and Engineering',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Artificial Intelligence and Machine Learning',
    'Data Science',
    'Basic Sciences',
    'Humanities'
  ];

  // Designations
  const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Senior Lecturer',
    'Lecturer',
    'Visiting Faculty',
    'Adjunct Faculty'
  ];

  // Qualifications
  const qualifications = [
    'Ph.D.',
    'M.Tech',
    'M.E.',
    'M.Sc.',
    'M.A.',
    'B.Tech',
    'B.E.',
    'B.Sc.'
  ];

  return (
    <div>
      {/* Toast Container - Small width and height */}
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

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#080C68]">Faculty</h1>
          <p className="text-gray-500 mt-1">Manage faculty and mentors</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition shadow-sm"
        >
          <Plus size={20} />
          Add Faculty
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search faculty by name, ID, department or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <Loader2 size={40} className="mx-auto text-[#00A9E0] animate-spin" />
            <p className="mt-3 text-gray-500">Loading faculty...</p>
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="p-10 text-center">
            <GraduationCap size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {searchTerm ? 'No faculty found matching your search' : 'No faculty registered yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFF] border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">Faculty</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">Employee ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">Department</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">Designation</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">Type</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-[#080C68]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.map((facultyItem) => (
                  <tr key={facultyItem._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-[#080C68]">{facultyItem.fullName}</p>
                        <p className="text-xs text-gray-500">{facultyItem.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#00A9E0]">{facultyItem.employeeId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{facultyItem.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{facultyItem.designation}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        facultyItem.facultyType === 'Regular' ? 'bg-green-100 text-green-600' :
                        facultyItem.facultyType === 'Contract' ? 'bg-blue-100 text-blue-600' :
                        facultyItem.facultyType === 'Guest' ? 'bg-purple-100 text-purple-600' :
                        facultyItem.facultyType === 'Visiting' ? 'bg-yellow-100 text-yellow-600' :
                        facultyItem.facultyType === 'Part-Time' ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {facultyItem.facultyType || 'Regular'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleView(facultyItem)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Faculty"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(facultyItem)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                          title="Edit Faculty"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(facultyItem._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete Faculty"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Faculty Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-[#080C68]">Add Faculty</h2>
                <p className="text-sm text-gray-500 mt-1">Register a new faculty member</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Personal Information */}
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                    <User size={16} className="text-[#00A9E0]" />
                    Personal Information
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Auto-generated sequential ID</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Institution <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution || institution?.name || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.fullName ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="faculty@email.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.mobile ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                </div>

                {/* Professional Information */}
                <div className="md:col-span-2 mt-2">
                  <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                    <Briefcase size={16} className="text-[#00A9E0]" />
                    Professional Information
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.department ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.designation ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Designation</option>
                    {designations.map((desig) => (
                      <option key={desig} value={desig}>{desig}</option>
                    ))}
                  </select>
                  {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Qualification <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.qualification ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Qualification</option>
                    {qualifications.map((qual) => (
                      <option key={qual} value={qual}>{qual}</option>
                    ))}
                  </select>
                  {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="Enter specialization"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.specialization ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Faculty Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="facultyType"
                    value={formData.facultyType}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.facultyType ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Faculty Type</option>
                    {facultyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.facultyType && <p className="text-red-500 text-xs mt-1">{errors.facultyType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Date of Joining <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    value={formData.dateOfJoining}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.dateOfJoining ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.dateOfJoining && <p className="text-red-500 text-xs mt-1">{errors.dateOfJoining}</p>}
                </div>

                {/* Account Information */}
                <div className="md:col-span-2 mt-2">
                  <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                    <Lock size={16} className="text-[#00A9E0]" />
                    Account Information
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.username ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                        errors.password ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? 'Registering...' : 'Register Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Faculty Modal */}
      {showViewModal && selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-[#080C68]">Faculty Details</h2>
                <p className="text-sm text-gray-500 mt-1">View faculty information</p>
              </div>
              <button 
                onClick={() => setShowViewModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-semibold text-[#080C68]">{selectedFaculty.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <p className="font-semibold text-[#00A9E0]">{selectedFaculty.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-[#080C68]">{selectedFaculty.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-semibold text-[#080C68]">{selectedFaculty.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-semibold text-[#080C68]">{selectedFaculty.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Designation</p>
                  <p className="font-semibold text-[#080C68]">{selectedFaculty.designation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Qualification</p>
                  <p className="font-semibold text-[#080C68]">{selectedFaculty.qualification}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Specialization</p>
                  <p className="font-semibold text-[#080C68]">{selectedFaculty.specialization}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Faculty Type</p>
                  <p className="font-semibold text-[#080C68]">{selectedFaculty.facultyType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Joining</p>
                  <p className="font-semibold text-[#080C68]">
                    {selectedFaculty.dateOfJoining ? new Date(selectedFaculty.dateOfJoining).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-semibold text-[#080C68]">{selectedFaculty.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Institution</p>
                  <p className="font-semibold text-[#080C68]">{selectedFaculty.institutionName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Faculty Modal */}
      {showEditModal && editingFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-[#080C68]">Edit Faculty</h2>
                <p className="text-sm text-gray-500 mt-1">Update faculty information</p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={editFormData.fullName}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.fullName ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {editErrors.fullName && <p className="text-red-500 text-xs mt-1">{editErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {editErrors.email && <p className="text-red-500 text-xs mt-1">{editErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={editFormData.mobile}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.mobile ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {editErrors.mobile && <p className="text-red-500 text-xs mt-1">{editErrors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={editFormData.department}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.department ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {editErrors.department && <p className="text-red-500 text-xs mt-1">{editErrors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="designation"
                    value={editFormData.designation}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.designation ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Designation</option>
                    {designations.map((desig) => (
                      <option key={desig} value={desig}>{desig}</option>
                    ))}
                  </select>
                  {editErrors.designation && <p className="text-red-500 text-xs mt-1">{editErrors.designation}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Qualification <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="qualification"
                    value={editFormData.qualification}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.qualification ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Qualification</option>
                    {qualifications.map((qual) => (
                      <option key={qual} value={qual}>{qual}</option>
                    ))}
                  </select>
                  {editErrors.qualification && <p className="text-red-500 text-xs mt-1">{editErrors.qualification}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={editFormData.specialization}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.specialization ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {editErrors.specialization && <p className="text-red-500 text-xs mt-1">{editErrors.specialization}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Faculty Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="facultyType"
                    value={editFormData.facultyType}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.facultyType ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Faculty Type</option>
                    {facultyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {editErrors.facultyType && <p className="text-red-500 text-xs mt-1">{editErrors.facultyType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Date of Joining <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    value={editFormData.dateOfJoining}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.dateOfJoining ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {editErrors.dateOfJoining && <p className="text-red-500 text-xs mt-1">{editErrors.dateOfJoining}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={editFormData.username}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.username ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {editErrors.username && <p className="text-red-500 text-xs mt-1">{editErrors.username}</p>}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? 'Updating...' : 'Update Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;