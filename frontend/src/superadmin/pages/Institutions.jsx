import React, { useState, useEffect } from "react";
import {
  Plus,
  Power,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
  Eye,
  EyeOff,
  Lock,
  Edit,
  Trash2,
  Loader2,
  Search,
  RefreshCw,
} from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Institutions = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [institutions, setInstitutions] = useState([]);
  const [error, setError] = useState("");

  // API URL - fixed to avoid process.env error
  const API_URL = 'https://studentaibackend.vercel.app';

  console.log('🌐 Institutions API URL:', API_URL);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    address: "",
    active: true,
  });

  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Toastify configuration for smaller height and width
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

  // Fetch institutions on component mount
  useEffect(() => {
    fetchInstitutions();
  }, []);

  // Fetch all institutions
  const fetchInstitutions = async () => {
    setFetching(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/institutions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setInstitutions(data.data);
      } else {
        setError(data.message || "Failed to fetch institutions");
        toast.error(data.message || "Failed to fetch institutions", toastConfig);
      }
    } catch (error) {
      console.error("Fetch institutions error:", error);
      setError("Network error. Please check your connection.");
      toast.error("Network error. Please check your connection.", toastConfig);
    } finally {
      setFetching(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
    if (editErrors[e.target.name]) {
      setEditErrors({
        ...editErrors,
        [e.target.name]: "",
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Institution name is required";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Institution code is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate edit form
  const validateEditForm = () => {
    const newErrors = {};

    if (!editFormData.name.trim()) {
      newErrors.name = "Institution name is required";
    }

    if (!editFormData.code.trim()) {
      newErrors.code = "Institution code is required";
    }

    if (!editFormData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!editFormData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(editFormData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!editFormData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Register new institution
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/institutions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setInstitutions([data.data, ...institutions]);
        setFormData({
          name: "",
          code: "",
          email: "",
          phone: "",
          address: "",
          password: "",
          confirmPassword: "",
        });
        setShowModal(false);
        setErrors({});
        toast.success("✅ Institution registered successfully!", toastConfig);
      } else {
        setError(data.message || "Failed to register institution");
        toast.error(data.message || "Failed to register institution", toastConfig);
      }
    } catch (error) {
      console.error("Register error:", error);
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.", toastConfig);
    } finally {
      setLoading(false);
    }
  };

  // Update institution
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/institutions/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editFormData.name,
            code: editFormData.code,
            email: editFormData.email,
            phone: editFormData.phone,
            address: editFormData.address,
            active: editFormData.active,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setInstitutions(
          institutions.map((inst) =>
            inst._id === editingId ? data.data : inst
          )
        );
        setShowEditModal(false);
        setEditErrors({});
        toast.success("✅ Institution updated successfully!", toastConfig);
      } else {
        setError(data.message || "Failed to update institution");
        toast.error(data.message || "Failed to update institution", toastConfig);
      }
    } catch (error) {
      console.error("Update error:", error);
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.", toastConfig);
    } finally {
      setLoading(false);
    }
  };

  // Toggle institution status (activate/deactivate)
  const toggleStatus = async (id) => {
    if (!window.confirm("Are you sure you want to change the status?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/institutions/${id}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setInstitutions(
          institutions.map((institution) =>
            institution._id === id
              ? { ...institution, active: !institution.active }
              : institution
          )
        );
        toast.success(`✅ Institution ${data.data.active ? 'activated' : 'deactivated'} successfully!`, toastConfig);
      } else {
        toast.error(data.message || "Failed to update status", toastConfig);
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      toast.error("Network error. Please try again.", toastConfig);
    }
  };

  // Delete institution
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this institution?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/institutions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setInstitutions(institutions.filter((inst) => inst._id !== id));
        toast.success("✅ Institution deleted successfully!", toastConfig);
      } else {
        toast.error(data.message || "Failed to delete institution", toastConfig);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Network error. Please try again.", toastConfig);
    }
  };

  // Open edit modal with institution data
  const openEditModal = (institution) => {
    setEditingId(institution._id);
    setEditFormData({
      name: institution.name,
      code: institution.code,
      email: institution.email,
      phone: institution.phone,
      address: institution.address,
      active: institution.active,
    });
    setShowEditModal(true);
    setEditErrors({});
  };

  // Filter institutions based on search
  const filteredInstitutions = institutions.filter(
    (inst) =>
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Toast Container - Small Size */}
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#080C68]">
            Institutions
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Manage all institutions on the platform
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search institutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors w-full sm:w-64"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="
              w-full sm:w-auto
              flex items-center justify-center gap-2
              px-5 py-2.5
              bg-[#00A9E0]
              hover:bg-[#008FC2]
              text-white
              font-semibold
              rounded-lg
              transition
              shadow-sm
            "
          >
            <Plus size={20} />
            Register Institution
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="hover:text-red-800">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Institution List */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Loading State */}
        {fetching && (
          <div className="p-10 text-center">
            <Loader2 size={40} className="mx-auto text-[#00A9E0] animate-spin" />
            <p className="mt-3 text-gray-500">Loading institutions...</p>
          </div>
        )}

        {/* Desktop Table */}
        {!fetching && (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFF] border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">
                    Institution
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">
                    Code
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">
                    Contact
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">
                    Status
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-[#080C68]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredInstitutions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                      {searchTerm ? "No institutions found matching your search" : "No institutions registered yet."}
                    </td>
                  </tr>
                ) : (
                  filteredInstitutions.map((institution) => (
                    <tr
                      key={institution._id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-[#D6F2FD] flex items-center justify-center">
                            <Building2 size={22} className="text-[#00A9E0]" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#080C68]">
                              {institution.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {institution.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-sm">
                          {institution.code}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm text-gray-700">
                          {institution.phone}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {institution.address}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            institution.active
                              ? "bg-green-50 text-green-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              institution.active ? "bg-green-500" : "bg-gray-500"
                            }`}
                          />
                          {institution.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(institution)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit institution"
                          >
                            <Edit size={18} />
                          </button>

                          {/* Power Switch */}
                          <button
                            onClick={() => toggleStatus(institution._id)}
                            title={
                              institution.active
                                ? "Deactivate institution"
                                : "Activate institution"
                            }
                            className={`
                              w-9 h-9
                              rounded-lg
                              flex items-center justify-center
                              border
                              transition-all
                              ${
                                institution.active
                                  ? "border-green-200 bg-green-50 hover:bg-green-100"
                                  : "border-gray-300 bg-white hover:bg-gray-100"
                              }
                            `}
                          >
                            <Power
                              size={18}
                              strokeWidth={2.5}
                              className={
                                institution.active
                                  ? "text-green-500"
                                  : "text-gray-500"
                              }
                            />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(institution._id)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete institution"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Cards */}
        {!fetching && (
          <div className="md:hidden p-4 space-y-4">
            {filteredInstitutions.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                {searchTerm ? "No institutions found" : "No institutions registered yet."}
              </div>
            ) : (
              filteredInstitutions.map((institution) => (
                <div
                  key={institution._id}
                  className="border border-gray-100 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 shrink-0 rounded-lg bg-[#D6F2FD] flex items-center justify-center">
                        <Building2 size={21} className="text-[#00A9E0]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#080C68] truncate">
                          {institution.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {institution.code}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(institution)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => toggleStatus(institution._id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          institution.active
                            ? "border-green-200 bg-green-50"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        <Power
                          size={16}
                          strokeWidth={2.5}
                          className={
                            institution.active ? "text-green-500" : "text-gray-500"
                          }
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(institution._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={16} />
                      <span className="truncate">{institution.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={16} />
                      <span>{institution.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} />
                      <span>{institution.address}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        institution.active
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          institution.active ? "bg-green-500" : "bg-gray-500"
                        }`}
                      />
                      {institution.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Refresh Button when empty */}
        {!fetching && filteredInstitutions.length === 0 && !searchTerm && (
          <div className="p-6 text-center border-t border-gray-100">
            <button
              onClick={fetchInstitutions}
              className="flex items-center gap-2 px-4 py-2 text-[#00A9E0] hover:bg-[#EEF9FF] rounded-lg transition-colors mx-auto"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Register Institution Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => {
            setShowModal(false);
            setErrors({});
          }}
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#080C68]">
                  Register Institution
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add a new institution to the platform
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setErrors({});
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Institution Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-[#080C68] mb-2">
                    Institution Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter institution name"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition ${
                        errors.name
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20"
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Institution Code */}
                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-2">
                    Institution Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Example: ABC001"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition ${
                        errors.code
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20"
                      }`}
                    />
                  </div>
                  {errors.code && (
                    <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="institution@email.com"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition ${
                        errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter 10-digit phone number"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition ${
                        errors.phone
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-[#080C68] mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter institution address"
                      rows="2"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition resize-none ${
                        errors.address
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20"
                      }`}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password (min 6 characters)"
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition ${
                        errors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition ${
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20"
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setErrors({});
                  }}
                  className="w-full sm:w-auto px-5 py-3 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? "Registering..." : "Register Institution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Institution Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => {
            setShowEditModal(false);
            setEditErrors({});
          }}
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#080C68]">
                  Edit Institution
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Update institution details
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditErrors({});
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className="p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Institution Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-[#080C68] mb-2">
                    Institution Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      placeholder="Enter institution name"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition ${
                        editErrors.name
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20"
                      }`}
                    />
                  </div>
                  {editErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{editErrors.name}</p>
                  )}
                </div>

                {/* Institution Code */}
                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-2">
                    Institution Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      name="code"
                      value={editFormData.code}
                      onChange={handleEditChange}
                      placeholder="Example: ABC001"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition ${
                        editErrors.code
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20"
                      }`}
                    />
                  </div>
                  {editErrors.code && (
                    <p className="text-red-500 text-xs mt-1">{editErrors.code}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditChange}
                      placeholder="institution@email.com"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition ${
                        editErrors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20"
                      }`}
                    />
                  </div>
                  {editErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{editErrors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-[#080C68] mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditChange}
                      placeholder="Enter 10-digit phone number"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition ${
                        editErrors.phone
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20"
                      }`}
                    />
                  </div>
                  {editErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{editErrors.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-[#080C68] mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <textarea
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditChange}
                      placeholder="Enter institution address"
                      rows="2"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition resize-none ${
                        editErrors.address
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20"
                      }`}
                    />
                  </div>
                  {editErrors.address && (
                    <p className="text-red-500 text-xs mt-1">{editErrors.address}</p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditErrors({});
                  }}
                  className="w-full sm:w-auto px-5 py-3 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? "Updating..." : "Update Institution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Institutions;