import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  X,
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Building2,
  GraduationCap,
  Hash,
  Loader2,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Lock,
  UserCheck
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../config/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [institution, setInstitution] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    usn: '',
    semester: '',
    course: '',
    branch: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    usn: '',
    semester: '',
    course: '',
    branch: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Toast configuration
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
    fetchStudents();
    fetchFacultyList();
  }, []);

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setStudents(data.data || []);
      } else {
        toast.error(data.message || 'Failed to fetch students', toastConfig);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Network error. Please try again.', toastConfig);
    } finally {
      setLoading(false);
    }
  };

  // Fetch faculty list for assignment
  const fetchFacultyList = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/faculty`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setFacultyList(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
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
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.usn.trim()) newErrors.usn = 'USN/Roll No is required';
    if (!formData.semester) newErrors.semester = 'Semester is required';
    if (!formData.course.trim()) newErrors.course = 'Course is required';
    if (!formData.branch.trim()) newErrors.branch = 'Branch is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Valid 10-digit phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate edit form
  const validateEditForm = () => {
    const newErrors = {};
    if (!editFormData.name.trim()) newErrors.name = 'Name is required';
    if (!editFormData.usn.trim()) newErrors.usn = 'USN/Roll No is required';
    if (!editFormData.semester) newErrors.semester = 'Semester is required';
    if (!editFormData.course.trim()) newErrors.course = 'Course is required';
    if (!editFormData.branch.trim()) newErrors.branch = 'Branch is required';
    if (!editFormData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(editFormData.email)) newErrors.email = 'Valid email is required';
    if (!editFormData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(editFormData.phone)) newErrors.phone = 'Valid 10-digit phone is required';
    
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle register student
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

      const response = await fetch(`${API_BASE_URL}/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          usn: formData.usn,
          email: formData.email,
          phone: formData.phone,
          course: formData.course,
          branch: formData.branch,
          semester: formData.semester,
          institutionId: institutionId,
          password: formData.password,
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setStudents([data.data, ...students]);
        setShowModal(false);
        resetForm();
        toast.success('✅ Student registered successfully!', toastConfig);
      } else {
        toast.error(data.message || 'Failed to register student', toastConfig);
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Network error. Please try again.', toastConfig);
    } finally {
      setLoading(false);
    }
  };

  // Handle update student
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

      const response = await fetch(`${API_BASE_URL}/api/students/${editingStudent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editFormData.name,
          usn: editFormData.usn,
          email: editFormData.email,
          phone: editFormData.phone,
          course: editFormData.course,
          branch: editFormData.branch,
          semester: editFormData.semester,
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setStudents(students.map(s => 
          s._id === editingStudent._id ? data.data : s
        ));
        setShowEditModal(false);
        setEditFormData({ name: '', usn: '', semester: '', course: '', branch: '', email: '', phone: '' });
        toast.success('✅ Student updated successfully!', toastConfig);
      } else {
        toast.error(data.message || 'Failed to update student', toastConfig);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Network error. Please try again.', toastConfig);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete student
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/students/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setStudents(students.filter(s => s._id !== id));
        toast.success('✅ Student deleted successfully!', toastConfig);
      } else {
        toast.error(data.message || 'Failed to delete student', toastConfig);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Network error. Please try again.', toastConfig);
    }
  };

  // Assign faculty to student
  const handleAssignFaculty = async () => {
    if (!selectedFaculty) {
      toast.error('Please select a faculty member', toastConfig);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/students/${assigningStudent._id}/assign-faculty`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          facultyId: selectedFaculty
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setStudents(students.map(s => 
          s._id === assigningStudent._id ? { ...s, assignedFaculty: data.data.assignedFaculty } : s
        ));
        setShowAssignModal(false);
        setSelectedFaculty('');
        toast.success('✅ Faculty assigned successfully!', toastConfig);
      } else {
        toast.error(data.message || 'Failed to assign faculty', toastConfig);
      }
    } catch (error) {
      console.error('Assign error:', error);
      toast.error('Network error. Please try again.', toastConfig);
    } finally {
      setLoading(false);
    }
  };

  // View student
  const handleView = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  // Edit student
  const handleEdit = (student) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name || '',
      usn: student.usn || '',
      semester: student.semester || '',
      course: student.course || '',
      branch: student.branch || '',
      email: student.email || '',
      phone: student.phone || '',
    });
    setShowEditModal(true);
    setEditErrors({});
  };

  // Open assign modal
  const handleOpenAssign = (student) => {
    setAssigningStudent(student);
    setSelectedFaculty(student.assignedFaculty?._id || '');
    setShowAssignModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      usn: '',
      semester: '',
      course: '',
      branch: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      institution: institution?.name || ''
    });
    setErrors({});
    setEditingStudent(null);
  };

  // Open modal for adding student
  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Filter students
  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.usn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get faculty name by ID
  const getFacultyName = (facultyId) => {
    if (!facultyId) return 'Not Assigned';
    const faculty = facultyList.find(f => f._id === facultyId);
    return faculty ? faculty.fullName : 'Not Assigned';
  };

  // Engineering Branches
  const engineeringBranches = [
    'Computer Science and Engineering',
    'Information Science and Engineering',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Artificial Intelligence and Machine Learning',
    'Data Science and Engineering',
    'Computer Engineering',
    'Aerospace Engineering',
    'Biotechnology',
    'Chemical Engineering',
    'Robotics and Automation'
  ];

  // BE Courses
  const beCourses = [
    'BE - Computer Science',
    'BE - Information Science',
    'BE - Electronics & Communication',
    'BE - Electrical & Electronics',
    'BE - Mechanical',
    'BE - Civil',
    'BE - Artificial Intelligence & ML',
    'BE - Data Science',
    'BE - Computer Engineering',
    'BE - Aerospace',
    'BE - Biotechnology',
    'BE - Chemical',
    'BE - Robotics & Automation'
  ];

  return (
    <div>
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

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#080C68]">Students</h1>
          <p className="text-gray-500 mt-1">Manage all students in your institution</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition shadow-sm"
        >
          <Plus size={20} />
          Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search students by name, USN or email..."
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
            <p className="mt-3 text-gray-500">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-10 text-center">
            <Users size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {searchTerm ? 'No students found matching your search' : 'No students registered yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFF] border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">Student</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">USN/Roll No</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">Course</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">Branch</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">Semester</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">Assigned Faculty</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-[#080C68]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-[#080C68]">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.usn}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.course}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.branch}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Sem {student.semester}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        student.assignedFaculty ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {student.assignedFaculty?.fullName || 'Not Assigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleView(student)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Student"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(student)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                          title="Edit Student"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenAssign(student)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
                          title="Assign Faculty"
                        >
                          <UserCheck size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete Student"
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

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-[#080C68]">Register Student</h2>
                <p className="text-sm text-gray-500 mt-1">Add a new student to your institution</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
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
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    USN/Roll No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="usn"
                    value={formData.usn}
                    onChange={handleChange}
                    placeholder="Enter USN or Roll No"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.usn ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.usn && <p className="text-red-500 text-xs mt-1">{errors.usn}</p>}
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
                    placeholder="student@email.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Academic Information */}
                <div className="md:col-span-2 mt-2">
                  <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                    <BookOpen size={16} className="text-[#00A9E0]" />
                    Academic Information
                  </h3>
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

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.course ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Course</option>
                    {beCourses.map((course) => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                  {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      errors.branch ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Branch</option>
                    {engineeringBranches.map((branch) => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                  {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
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

                {/* Password Section */}
                <div className="md:col-span-2 mt-2">
                  <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                    <Lock size={16} className="text-[#00A9E0]" />
                    Account Security
                  </h3>
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
                  {loading ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-[#080C68]">Student Details</h2>
                <p className="text-sm text-gray-500 mt-1">View student information</p>
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
                  <p className="font-semibold text-[#080C68]">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">USN/Roll No</p>
                  <p className="font-semibold text-[#080C68]">{selectedStudent.usn}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-[#080C68]">{selectedStudent.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold text-[#080C68]">{selectedStudent.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-semibold text-[#080C68]">{selectedStudent.course}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Branch</p>
                  <p className="font-semibold text-[#080C68]">{selectedStudent.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Semester</p>
                  <p className="font-semibold text-[#080C68]">Sem {selectedStudent.semester}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Institution</p>
                  <p className="font-semibold text-[#080C68]">{selectedStudent.institutionName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigned Faculty</p>
                  <p className="font-semibold text-[#080C68]">
                    {selectedStudent.assignedFaculty?.fullName || 'Not Assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedStudent.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedStudent.active ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {selectedStudent.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-[#080C68]">Edit Student</h2>
                <p className="text-sm text-gray-500 mt-1">Update student information</p>
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
                  <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                    <User size={16} className="text-[#00A9E0]" />
                    Edit Information
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {editErrors.name && <p className="text-red-500 text-xs mt-1">{editErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    USN/Roll No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="usn"
                    value={editFormData.usn}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.usn ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {editErrors.usn && <p className="text-red-500 text-xs mt-1">{editErrors.usn}</p>}
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
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.phone ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {editErrors.phone && <p className="text-red-500 text-xs mt-1">{editErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="course"
                    value={editFormData.course}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.course ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Course</option>
                    {beCourses.map((course) => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                  {editErrors.course && <p className="text-red-500 text-xs mt-1">{editErrors.course}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="branch"
                    value={editFormData.branch}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.branch ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Branch</option>
                    {engineeringBranches.map((branch) => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                  {editErrors.branch && <p className="text-red-500 text-xs mt-1">{editErrors.branch}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="semester"
                    value={editFormData.semester}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors ${
                      editErrors.semester ? 'border-red-500' : 'border-gray-200'
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
                  {editErrors.semester && <p className="text-red-500 text-xs mt-1">{editErrors.semester}</p>}
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
                  {loading ? 'Updating...' : 'Update Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Faculty Modal */}
      {showAssignModal && assigningStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-[#080C68]">Assign Faculty</h2>
                <p className="text-sm text-gray-500 mt-1">Assign a faculty member to {assigningStudent.name}</p>
              </div>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#080C68] mb-1.5">
                  Select Faculty <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
                >
                  <option value="">Select a faculty member</option>
                  {facultyList.map((faculty) => (
                    <option key={faculty._id} value={faculty._id}>
                      {faculty.fullName} - {faculty.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignFaculty}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? 'Assigning...' : 'Assign Faculty'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;