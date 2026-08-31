import React, { useState, useEffect } from 'react';
import { 
  ClipboardList,
  HandHelping,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Building2,
  Brain,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Eye
} from 'lucide-react';

const InterventionsReport = () => {
  const [loading, setLoading] = useState(true);
  const [interventions, setInterventions] = useState([]);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  // API URL
  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchInterventions();
  }, []);

  const fetchInterventions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData._id || userData.id;

      if (!token || !userId) {
        setError('Please login to view interventions');
        setLoading(false);
        return;
      }

      // Fetch student's interventions from counseling sessions
      const response = await fetch(`${API_URL}/api/counselor/sessions/student/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInterventions(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch interventions');
        }
      } else {
        // If no interventions, show empty state
        setInterventions([]);
      }
    } catch (error) {
      console.error('Error fetching interventions:', error);
      setError('Failed to load interventions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get risk level color and icon
  const getRiskInfo = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'high' || level === 'high risk') {
      return { 
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: ShieldAlert,
        label: 'High Risk',
        badge: 'bg-red-100 text-red-700'
      };
    } else if (level === 'medium' || level === 'medium risk') {
      return { 
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: Shield,
        label: 'Medium Risk',
        badge: 'bg-yellow-100 text-yellow-700'
      };
    } else if (level === 'low' || level === 'low risk') {
      return { 
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: ShieldCheck,
        label: 'Low Risk',
        badge: 'bg-green-100 text-green-700'
      };
    }
    return { 
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      icon: AlertTriangle,
      label: 'Unknown',
      badge: 'bg-gray-100 text-gray-600'
    };
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'follow-up required':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // View intervention details
  const handleViewDetails = (intervention) => {
    setSelectedIntervention(intervention);
    setShowModal(true);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-[#F5FBFF] to-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <ClipboardList size={24} className="text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#080C68]">
                Interventions Report
              </h1>
              <p className="text-gray-500 mt-1">
                View all your counseling and intervention plans
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
            <HandHelping size={18} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-700">
              {interventions.length} {interventions.length === 1 ? 'Plan' : 'Plans'}
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={40} className="text-[#00A9E0] animate-spin" />
          <span className="ml-3 text-gray-500">Loading interventions...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertTriangle size={40} className="text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={fetchInterventions}
            className="mt-4 px-4 py-2 bg-[#00A9E0] text-white rounded-lg hover:bg-[#008FC2] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : interventions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
          <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-[#080C68] mb-2">No Intervention Plans</h3>
          <p className="text-gray-500">You don't have any intervention plans yet.</p>
          <p className="text-sm text-gray-400 mt-1">Your counselor will create plans if needed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {interventions.map((intervention, index) => (
            <div 
              key={intervention._id || index}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getRiskInfo(intervention.riskLevel).badge}`}>
                      {getRiskInfo(intervention.riskLevel).label}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusBadge(intervention.status)}`}>
                      {intervention.status || 'Pending'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(intervention.createdAt || intervention.sessionDate)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#080C68] mb-1">
                    Intervention Plan #{index + 1}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {intervention.notes || 'No details available'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {intervention.facultyName && (
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {intervention.facultyName}
                      </span>
                    )}
                    {intervention.riskLevel && (
                      <span className="flex items-center gap-1">
                        <Brain size={12} />
                        Risk: {intervention.riskLevel}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewDetails(intervention)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00A9E0] text-white rounded-lg hover:bg-[#008FC2] transition-colors text-sm"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Intervention Details Modal */}
      {showModal && selectedIntervention && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileText size={20} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#080C68]">Intervention Details</h2>
                  <p className="text-sm text-gray-500">
                    Plan created on {formatDate(selectedIntervention.createdAt || selectedIntervention.sessionDate)}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setSelectedIntervention(null);
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Risk Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${getRiskInfo(selectedIntervention.riskLevel).badge}`}>
                  Risk: {getRiskInfo(selectedIntervention.riskLevel).label}
                </span>
                <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${getStatusBadge(selectedIntervention.status)}`}>
                  Status: {selectedIntervention.status || 'Pending'}
                </span>
              </div>

              {/* Intervention Details */}
              <div>
                <h3 className="text-sm font-semibold text-[#080C68] mb-2">Intervention Plan</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedIntervention.notes || 'No details available'}
                  </p>
                </div>
              </div>

              {/* Risk Assessment */}
              {selectedIntervention.riskLevel && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                    <Brain size={16} className="text-purple-600" />
                    Risk Assessment
                  </h3>
                  <div className={`rounded-lg p-4 border ${getRiskInfo(selectedIntervention.riskLevel).color}`}>
                    <div className="flex items-center gap-3">
                      {React.createElement(getRiskInfo(selectedIntervention.riskLevel).icon, { 
                        size: 20, 
                        className: getRiskInfo(selectedIntervention.riskLevel).color.split(' ')[0] 
                      })}
                      <span className="font-medium text-gray-700">Risk Level:</span>
                      <span className="font-semibold">{getRiskInfo(selectedIntervention.riskLevel).label}</span>
                    </div>
                    {selectedIntervention.probability > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              selectedIntervention.riskLevel?.toLowerCase() === 'high' ? 'bg-red-500' :
                              selectedIntervention.riskLevel?.toLowerCase() === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${(selectedIntervention.probability || 0) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Probability: {(selectedIntervention.probability * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mentor Information */}
              {selectedIntervention.facultyName && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-semibold text-[#080C68] mb-3 flex items-center gap-2">
                    <User size={16} className="text-[#00A9E0]" />
                    Mentor Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium text-[#080C68]">{selectedIntervention.facultyName}</p>
                    </div>
                    {selectedIntervention.facultyId?.email && (
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium text-[#080C68]">{selectedIntervention.facultyId.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Follow-up Information */}
              {selectedIntervention.followUpDate && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-semibold text-[#080C68] mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-[#00A9E0]" />
                    Follow-up Date
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedIntervention.followUpDate)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InterventionsReport;