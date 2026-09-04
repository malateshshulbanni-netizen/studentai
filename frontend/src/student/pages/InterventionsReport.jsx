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
  Eye,
  Video,
  X,
  ExternalLink,
  History,
  Maximize2,
  Minimize2
} from 'lucide-react';

const InterventionsReport = () => {
  const [loading, setLoading] = useState(true);
  const [interventions, setInterventions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [meetingStats, setMeetingStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  });

  // Jitsi Meet state
  const [showJitsi, setShowJitsi] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // API URL - Direct backend URL
  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchStudentData();
    fetchInterventions();
    fetchMeetings();
  }, []);

  // Fetch student data
  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData._id || userData.id;

      if (!token || !userId) {
        return;
      }

      const response = await fetch(`${API_URL}/api/students/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudentData(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  // Fetch interventions (counseling sessions)
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
        setInterventions([]);
      }
    } catch (error) {
      console.error('Error fetching interventions:', error);
      setError('Failed to load interventions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch meetings for the student
  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData._id || userData.id;

      if (!token || !userId) {
        return;
      }

      const response = await fetch(`${API_URL}/api/meetings/student/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const allMeetings = data.data.all || [];
          setMeetings(allMeetings);
          setMeetingStats(data.data.summary || {
            total: 0,
            upcoming: 0,
            completed: 0,
            cancelled: 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  // Mark meeting as joined (save history)
  const markMeetingJoined = async (meetingId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/meetings/${meetingId}/join-history`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          joinedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        await fetchMeetings();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking meeting joined:', error);
      return false;
    }
  };

  // Join meeting - Open Jitsi inside the page
  const handleJoinMeeting = async (meeting) => {
    if (meeting.joinLink) {
      await markMeetingJoined(meeting._id);
      setCurrentMeeting(meeting);
      setShowJitsi(true);
    }
  };

  // Close Jitsi
  const handleCloseJitsi = () => {
    setShowJitsi(false);
    setCurrentMeeting(null);
    setIsFullscreen(false);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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

  // Format date short
  const formatDateShort = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
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

  // Get meeting status badge
  const getMeetingStatusBadge = (status) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-700',
      live: 'bg-green-100 text-green-700 animate-pulse',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
      missed: 'bg-yellow-100 text-yellow-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
  };

  // Get meeting status icon
  const getMeetingStatusIcon = (status) => {
    if (status === 'live') return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />;
    if (status === 'scheduled') return <Clock size={14} className="text-blue-500 mr-1" />;
    if (status === 'completed') return <CheckCircle size={14} className="text-gray-500 mr-1" />;
    if (status === 'cancelled') return <X size={14} className="text-red-500 mr-1" />;
    return null;
  };

  // View intervention details
  const handleViewInterventionDetails = (intervention) => {
    setSelectedIntervention(intervention);
    setShowInterventionModal(true);
  };

  // View meeting details
  const handleViewMeetingDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingModal(true);
  };

  // Check if meeting can be joined
  const canJoinMeeting = (status) => {
    return status === 'scheduled' || status === 'live';
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Jitsi Meet Modal */}
      {showJitsi && currentMeeting && (
        <div className={`fixed inset-0 z-50 bg-black ${isFullscreen ? 'w-full h-full' : 'p-4'}`}>
          <div className={`bg-white rounded-2xl shadow-2xl ${isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl mx-auto h-[90vh]'} overflow-hidden flex flex-col`}>
            {/* Jitsi Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#080C68] text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Video size={20} />
                <div>
                  <h3 className="font-semibold">{currentMeeting.title}</h3>
                  <p className="text-xs text-white/70">
                    with {currentMeeting.facultyName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
                <button
                  onClick={handleCloseJitsi}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Jitsi Iframe */}
            <div className="flex-1 bg-gray-900">
              <iframe
                src={currentMeeting.joinLink}
                allow="camera; microphone; fullscreen; display-capture"
                className="w-full h-full border-0"
                title="Jitsi Meet"
                allowFullScreen
              />
            </div>

            {/* Jitsi Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center text-xs text-gray-500">
              <span className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Connected to meeting room
                <span className="text-gray-300">|</span>
                {currentMeeting.roomId}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-[#F5FBFF] to-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <ClipboardList size={24} className="text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#080C68]">
                My Interventions & Meetings
              </h1>
              <p className="text-gray-500 mt-1">
                View your intervention plans and meeting history
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
              <HandHelping size={18} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                {interventions.length} Plans
              </span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <Video size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {meetings.length} Meetings
              </span>
            </div>
          </div>
        </div>
        {studentData && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1 text-gray-600">
              <User size={14} />
              {studentData.name}
            </span>
            <span className="flex items-center gap-1 text-gray-600">
              <Mail size={14} />
              {studentData.email}
            </span>
            <span className="flex items-center gap-1 text-gray-600">
              <GraduationCap size={14} />
              {studentData.course} - Sem {studentData.semester}
            </span>
          </div>
        )}
      </div>

      {/* Meeting Stats */}
      {meetings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold text-[#080C68]">{meetingStats.total}</p>
            <p className="text-xs text-gray-500">Total Meetings</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{meetingStats.upcoming}</p>
            <p className="text-xs text-gray-500">Upcoming</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold text-green-600">{meetingStats.completed}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold text-red-600">{meetingStats.cancelled}</p>
            <p className="text-xs text-gray-500">Cancelled</p>
          </div>
        </div>
      )}

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
      ) : (
        <>
          {/* Meetings Section */}
          {meetings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#080C68] mb-4 flex items-center gap-2">
                <Video size={20} className="text-[#00A9E0]" />
                My Meetings
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({meetings.length} total)
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {meetings.map((meeting) => (
                  <div 
                    key={meeting._id}
                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center ${getMeetingStatusBadge(meeting.status)}`}>
                            {getMeetingStatusIcon(meeting.status)}
                            {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDateShort(meeting.date)} at {meeting.time}
                          </span>
                        </div>
                        <h4 className="font-semibold text-[#080C68]">{meeting.title}</h4>
                        <p className="text-sm text-gray-500">
                          with {meeting.facultyName} • {meeting.duration} min
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {canJoinMeeting(meeting.status) && (
                          <button
                            onClick={() => handleJoinMeeting(meeting)}
                            className="px-4 py-2 bg-[#00A9E0] text-white rounded-lg hover:bg-[#008FC2] transition-colors text-sm flex items-center gap-2"
                          >
                            <Video size={16} />
                            Join Meeting
                          </button>
                        )}
                        <button
                          onClick={() => handleViewMeetingDetails(meeting)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interventions Section */}
          <div>
            <h2 className="text-lg font-semibold text-[#080C68] mb-4 flex items-center gap-2">
              <HandHelping size={20} className="text-purple-600" />
              Intervention Plans
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({interventions.length} plans)
              </span>
            </h2>
            {interventions.length === 0 ? (
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
                          onClick={() => handleViewInterventionDetails(intervention)}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
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
          </div>
        </>
      )}

      {/* Intervention Details Modal */}
      {showInterventionModal && selectedIntervention && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
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
                  setShowInterventionModal(false);
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
            </div>
          </div>
        </div>
      )}

      {/* Meeting Details Modal */}
      {showMeetingModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Video size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#080C68]">Meeting Details</h2>
                  <p className="text-sm text-gray-500">{selectedMeeting.title}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowMeetingModal(false);
                  setSelectedMeeting(null);
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Meeting Title</p>
                  <p className="font-medium text-[#080C68]">{selectedMeeting.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold inline-flex items-center ${getMeetingStatusBadge(selectedMeeting.status)}`}>
                    {getMeetingStatusIcon(selectedMeeting.status)}
                    {selectedMeeting.status.charAt(0).toUpperCase() + selectedMeeting.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Faculty</p>
                  <p className="font-medium text-[#080C68]">{selectedMeeting.facultyName}</p>
                  <p className="text-xs text-gray-500">{selectedMeeting.facultyEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date & Time</p>
                  <p className="font-medium text-[#080C68]">{formatDateShort(selectedMeeting.date)}</p>
                  <p className="text-xs text-gray-500">{selectedMeeting.time} ({selectedMeeting.duration} min)</p>
                </div>
                {selectedMeeting.description && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="font-medium text-[#080C68]">{selectedMeeting.description}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Meeting Link</p>
                  <a 
                    href={selectedMeeting.joinLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#00A9E0] hover:underline text-sm break-all flex items-center gap-1"
                  >
                    {selectedMeeting.joinLink}
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Join Button - Opens Jitsi in modal */}
              {canJoinMeeting(selectedMeeting.status) && (
                <div className="border-t border-gray-100 pt-4">
                  <button
                    onClick={() => {
                      handleJoinMeeting(selectedMeeting);
                      setShowMeetingModal(false);
                    }}
                    className="w-full py-3 bg-[#00A9E0] text-white rounded-lg hover:bg-[#0098C8] transition-colors flex items-center justify-center gap-2"
                  >
                    <Video size={20} />
                    Join Meeting
                  </button>
                </div>
              )}

              {/* Joined History */}
              {selectedMeeting.joinedAt && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <History size={12} />
                    You joined this meeting on {formatDate(selectedMeeting.joinedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterventionsReport;