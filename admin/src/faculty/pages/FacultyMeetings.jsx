import React, { useState, useEffect } from 'react';
import { Video, Clock, Loader2, RefreshCw, X, CheckCircle, Maximize2, Minimize2 } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const FacultyMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    live: 0,
    completed: 0,
    cancelled: 0
  });

  // Jitsi Meet state
  const [showJitsi, setShowJitsi] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch meetings
  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const facultyId = localStorage.getItem('userId');
      
      if (!token || !facultyId) {
        setError('You must be logged in to view meetings');
        setLoading(false);
        return;
      }

      const timestamp = new Date().getTime();
      const url = `${API_BASE_URL}/api/meetings/faculty/${facultyId}?_=${timestamp}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const allMeetings = data.data.all || [];
        setMeetings(allMeetings);
        setStats(data.data.summary || {
          total: 0,
          upcoming: 0,
          live: 0,
          completed: 0,
          cancelled: 0
        });
      } else {
        setError(data.message || 'Failed to load meetings');
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setError('Failed to load meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMeetings();
    setRefreshing(false);
  };

  // View meeting details
  const handleViewMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingModal(true);
  };

  // Join meeting - Open Jitsi inside the page
  const handleJoinMeeting = (meeting) => {
    if (meeting.joinLink) {
      setCurrentMeeting(meeting);
      setShowJitsi(true);
      setShowMeetingModal(false);
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

  // Format date
  const formatDate = (dateStr) => {
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

  // Get status badge color
  const getStatusBadge = (status) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-700',
      live: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
      missed: 'bg-yellow-100 text-yellow-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    if (status === 'live') return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />;
    if (status === 'scheduled') return <Clock size={14} className="text-blue-500 mr-1" />;
    if (status === 'completed') return <CheckCircle size={14} className="text-gray-500 mr-1" />;
    if (status === 'cancelled') return <X size={14} className="text-red-500 mr-1" />;
    return null;
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const statsData = [
    { label: 'Total', value: stats.total, color: 'bg-blue-100 text-blue-700' },
    { label: 'Upcoming', value: stats.upcoming, color: 'bg-purple-100 text-purple-700' },
    { label: 'Live', value: stats.live, color: 'bg-green-100 text-green-700' },
    { label: 'Completed', value: stats.completed, color: 'bg-gray-100 text-gray-700' },
    { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="p-6">
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
                    with {currentMeeting.studentName || 'Student'}
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#080C68] flex items-center gap-2">
            <Video className="text-[#00A9E0]" size={28} />
            My Meetings
          </h1>
          <p className="text-gray-500 mt-1">View and manage all your scheduled meetings</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base font-bold text-[#080C68]">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">{stat.label}</p>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.label === 'Live' && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                {stat.label === 'Upcoming' && <Clock size={14} />}
                {stat.label === 'Completed' && <CheckCircle size={14} />}
                {stat.label === 'Cancelled' && <X size={14} />}
                {stat.label === 'Total' && <Video size={14} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Meetings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 sm:p-10 text-center">
            <Loader2 size={32} className="mx-auto text-[#00A9E0] animate-spin sm:w-[40px] sm:h-[40px]" />
            <p className="mt-3 text-gray-500 text-sm">Loading meetings...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="p-8 sm:p-10 text-center">
            <Video size={32} className="mx-auto text-gray-300 mb-3 sm:w-[40px] sm:h-[40px]" />
            <p className="text-sm sm:text-base text-gray-500">No meetings scheduled</p>
            <p className="text-xs text-gray-400 mt-1">Schedule meetings from the Interventions page</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-[#F8FAFF] border-b border-gray-100">
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Meeting</th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Student</th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Date & Time</th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Status</th>
                  <th className="text-center px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#080C68]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((meeting) => (
                  <tr 
                    key={meeting._id} 
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewMeeting(meeting)}
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div>
                        <p className="font-semibold text-[#080C68] text-sm sm:text-base">{meeting.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{meeting.description || 'No description'}</p>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <p className="text-sm text-[#080C68]">{meeting.studentName}</p>
                      <p className="text-xs text-gray-500">{meeting.studentEmail}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <p className="text-sm text-gray-700">{formatDate(meeting.date)}</p>
                      <p className="text-xs text-gray-500">{meeting.time} ({meeting.duration} min)</p>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold flex items-center ${getStatusBadge(meeting.status)}`}>
                        {getStatusIcon(meeting.status)}
                        {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-center gap-2">
                        {(meeting.status === 'scheduled' || meeting.status === 'live') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinMeeting(meeting);
                            }}
                            className="px-3 py-1 bg-[#00A9E0] text-white text-xs rounded-lg hover:bg-[#0098C8] transition-colors flex items-center gap-1"
                          >
                            <Video size={12} />
                            Join
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewMeeting(meeting);
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          View
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

      {/* Meeting Detail Modal */}
      {showMeetingModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00A9E0] flex items-center justify-center text-white">
                  <Video size={20} />
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
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold inline-flex items-center ${getStatusBadge(selectedMeeting.status)}`}>
                    {getStatusIcon(selectedMeeting.status)}
                    {selectedMeeting.status.charAt(0).toUpperCase() + selectedMeeting.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Student</p>
                  <p className="font-medium text-[#080C68]">{selectedMeeting.studentName}</p>
                  <p className="text-xs text-gray-500">{selectedMeeting.studentEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Faculty</p>
                  <p className="font-medium text-[#080C68]">{selectedMeeting.facultyName}</p>
                  <p className="text-xs text-gray-500">{selectedMeeting.facultyEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium text-[#080C68]">{formatDate(selectedMeeting.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Time & Duration</p>
                  <p className="font-medium text-[#080C68]">{selectedMeeting.time} ({selectedMeeting.duration} min)</p>
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
                    className="text-[#00A9E0] hover:underline text-sm break-all"
                  >
                    {selectedMeeting.joinLink}
                  </a>
                </div>
              </div>

              {/* Join Button - Opens Jitsi in modal */}
              {(selectedMeeting.status === 'scheduled' || selectedMeeting.status === 'live') && (
                <div className="border-t border-gray-100 pt-4">
                  <button
                    onClick={() => handleJoinMeeting(selectedMeeting)}
                    className="w-full py-3 bg-[#00A9E0] text-white rounded-lg hover:bg-[#0098C8] transition-colors flex items-center justify-center gap-2"
                  >
                    <Video size={20} />
                    Join Meeting
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyMeetings;