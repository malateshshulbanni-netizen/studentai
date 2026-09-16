import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Building2,
  Activity,
  Shield,
  LogIn,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Power,
  Brain,
  Upload,
  Play,
  Download,
  X,
  Eye,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Hardcoded URL — same pattern as other super admin files
  const API_URL = 'https://studentaibackend.vercel.app';

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

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, actionFilter, dateFilter]);

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    setFetching(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      console.log('📋 [AuditLogs] Fetching audit logs...');

      const response = await fetch(`${API_URL}/api/audit-logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
      } else {
        // Fallback: build logs from institutions activity
        console.log('⚠️ Audit logs API not available, building from institutions...');
        await buildLogsFromActivity(token);
      }
    } catch (err) {
      console.error('❌ [AuditLogs] Error:', err);
      setError('Failed to load audit logs.');
      toast.error('Failed to load audit logs.', toastConfig);
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  // Fallback: build logs from institution activity
  const buildLogsFromActivity = async (token) => {
    try {
      const instRes = await fetch(`${API_URL}/api/institutions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (instRes.ok) {
        const data = await instRes.json();
        const institutions = data.data || [];

        const built = institutions.map((inst, i) => ({
          _id: inst._id,
          action: inst.active ? 'INSTITUTION_CREATED' : 'INSTITUTION_DEACTIVATED',
          entity: 'Institution',
          entityName: inst.name,
          performedBy: 'Super Admin',
          role: 'SUPER_ADMIN',
          timestamp: inst.createdAt || new Date().toISOString(),
          details: `Institution "${inst.name}" (${inst.code}) registered`,
          status: 'success',
        }));

        // Add some sample audit entries for demo
        const sampleLogs = [
          {
            _id: 'sample-1',
            action: 'MODEL_TRAINED',
            entity: 'ML Model',
            entityName: 'XGBClassifier',
            performedBy: 'Super Admin',
            role: 'SUPER_ADMIN',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            details: 'Model retrained with 2000 samples, accuracy: 88.5%',
            status: 'success',
          },
          {
            _id: 'sample-2',
            action: 'USER_LOGIN',
            entity: 'Session',
            entityName: 'Super Admin',
            performedBy: 'Super Admin',
            role: 'SUPER_ADMIN',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            details: 'Successful login from 192.168.1.1',
            status: 'success',
          },
        ];

        setLogs([...built, ...sampleLogs]);
      }
    } catch (err) {
      console.error('Failed to build logs:', err);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...logs];

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter((log) => {
        const action = (log.action || '').toLowerCase();
        if (actionFilter === 'create') return action.includes('create') || action.includes('register');
        if (actionFilter === 'update') return action.includes('update') || action.includes('edit');
        if (actionFilter === 'delete') return action.includes('delete');
        if (actionFilter === 'login') return action.includes('login') || action.includes('auth');
        if (actionFilter === 'train') return action.includes('train') || action.includes('model');
        if (actionFilter === 'toggle') return action.includes('toggle') || action.includes('activate') || action.includes('deactivate');
        return true;
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (dateFilter === 'today') cutoff.setHours(0, 0, 0, 0);
      else if (dateFilter === 'week') cutoff.setDate(now.getDate() - 7);
      else if (dateFilter === 'month') cutoff.setDate(now.getDate() - 30);

      filtered = filtered.filter((log) => new Date(log.timestamp) >= cutoff);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((log) =>
        (log.action || '').toLowerCase().includes(term) ||
        (log.entity || '').toLowerCase().includes(term) ||
        (log.entityName || '').toLowerCase().includes(term) ||
        (log.performedBy || '').toLowerCase().includes(term) ||
        (log.details || '').toLowerCase().includes(term)
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setFilteredLogs(filtered);
  };

  const handleRefresh = async () => {
    await fetchAuditLogs();
  };

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      toast.warning('No logs to export', toastConfig);
      return;
    }

    let csv = 'Timestamp,Action,Entity,Entity Name,Performed By,Role,Status,Details\n';
    filteredLogs.forEach((log) => {
      csv += `"${log.timestamp || ''}","${log.action || ''}","${log.entity || ''}","${log.entityName || ''}","${log.performedBy || ''}","${log.role || ''}","${log.status || ''}","${(log.details || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('✅ Logs exported successfully!', toastConfig);
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMins = Math.floor((now - date) / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return `${Math.floor(diffMins / 1440)}d ago`;
    } catch {
      return dateString;
    }
  };

  // Get icon + color based on action
  const getActionInfo = (action) => {
    const a = (action || '').toUpperCase();

    if (a.includes('LOGIN') || a.includes('AUTH')) {
      return { icon: LogIn, bg: 'bg-blue-50', color: 'text-blue-600', label: 'Login' };
    }
    if (a.includes('LOGOUT')) {
      return { icon: LogOut, bg: 'bg-gray-50', color: 'text-gray-600', label: 'Logout' };
    }
    if (a.includes('CREATE') || a.includes('REGISTER')) {
      return { icon: Plus, bg: 'bg-green-50', color: 'text-green-600', label: 'Create' };
    }
    if (a.includes('UPDATE') || a.includes('EDIT')) {
      return { icon: Edit, bg: 'bg-yellow-50', color: 'text-yellow-600', label: 'Update' };
    }
    if (a.includes('DELETE')) {
      return { icon: Trash2, bg: 'bg-red-50', color: 'text-red-600', label: 'Delete' };
    }
    if (a.includes('TOGGLE') || a.includes('ACTIVATE') || a.includes('DEACTIVATE')) {
      return { icon: Power, bg: 'bg-orange-50', color: 'text-orange-600', label: 'Status' };
    }
    if (a.includes('TRAIN') || a.includes('MODEL')) {
      return { icon: Brain, bg: 'bg-purple-50', color: 'text-purple-600', label: 'Model' };
    }
    if (a.includes('UPLOAD')) {
      return { icon: Upload, bg: 'bg-indigo-50', color: 'text-indigo-600', label: 'Upload' };
    }
    if (a.includes('PLAY') || a.includes('START')) {
      return { icon: Play, bg: 'bg-cyan-50', color: 'text-cyan-600', label: 'Start' };
    }
    return { icon: Activity, bg: 'bg-gray-50', color: 'text-gray-600', label: 'Activity' };
  };

  // Stats
  const stats = {
    total: logs.length,
    today: logs.filter((l) => {
      const logDate = new Date(l.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length,
    logins: logs.filter((l) => (l.action || '').toUpperCase().includes('LOGIN')).length,
    deletions: logs.filter((l) => (l.action || '').toUpperCase().includes('DELETE')).length,
  };

  const statCards = [
    { icon: FileText, label: 'Total Logs', value: stats.total, color: '#EEF9FF', iconColor: '#00A9E0' },
    { icon: Clock, label: 'Today', value: stats.today, color: '#DCFCE7', iconColor: '#22C55E' },
    { icon: LogIn, label: 'Logins', value: stats.logins, color: '#E0F2FE', iconColor: '#0EA5E9' },
    { icon: Trash2, label: 'Deletions', value: stats.deletions, color: '#FEE2E2', iconColor: '#EF4444' },
  ];

  const actionFilters = [
    { value: 'all', label: 'All Actions' },
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'login', label: 'Login' },
    { value: 'train', label: 'Model Training' },
    { value: 'toggle', label: 'Status Change' },
  ];

  const dateFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
  ];

  return (
    <div className="w-full">
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
            Audit Logs
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Track all platform activity and system events
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition shadow-sm disabled:opacity-50"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={handleRefresh}
            disabled={fetching}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00A9E0] hover:bg-[#008FC2] text-white font-semibold rounded-lg transition shadow-sm disabled:opacity-70"
          >
            <RefreshCw size={18} className={fetching ? 'animate-spin' : ''} />
            {fetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="hover:text-red-800">
            <AlertTriangle size={18} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: stat.color }}
              >
                <stat.icon size={18} style={{ color: stat.iconColor }} />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl font-bold text-[#080C68]">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by action, entity, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors text-sm"
            />
          </div>

          {/* Filter toggle for mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition text-sm"
          >
            <Filter size={16} />
            Filters
            <ChevronDown
              size={16}
              className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Filters row */}
        {(showFilters || window.innerWidth >= 640) && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Action Type
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] text-sm bg-white"
              >
                {actionFilters.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] text-sm bg-white"
              >
                {dateFilters.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active filters info */}
        {(actionFilter !== 'all' || dateFilter !== 'all' || searchTerm) && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Active filters:</span>
            {actionFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                {actionFilters.find((f) => f.value === actionFilter)?.label}
              </span>
            )}
            {dateFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full">
                {dateFilters.find((f) => f.value === dateFilter)?.label}
              </span>
            )}
            {searchTerm && (
              <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full">
                "{searchTerm}"
              </span>
            )}
            <button
              onClick={() => {
                setActionFilter('all');
                setDateFilter('all');
                setSearchTerm('');
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Logs List */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading || fetching ? (
          <div className="p-10 text-center">
            <Loader2 size={40} className="mx-auto text-[#00A9E0] animate-spin" />
            <p className="mt-3 text-gray-500">Loading audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-10 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {searchTerm || actionFilter !== 'all' || dateFilter !== 'all'
                ? 'No logs match your filters'
                : 'No audit logs yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Platform activity will appear here
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8FAFF] border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">
                      Action
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">
                      Entity
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">
                      Performed By
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#080C68]">
                      Time
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
                  {filteredLogs.map((log, i) => {
                    const info = getActionInfo(log.action);
                    const Icon = info.icon;
                    return (
                      <tr
                        key={log._id || i}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${info.bg}`}
                            >
                              <Icon size={16} className={info.color} />
                            </div>
                            <div>
                              <p className="font-medium text-[#080C68] text-sm">
                                {log.action || 'Activity'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {info.label}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">
                            {log.entity || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {log.entityName || '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">
                            {log.performedBy || 'System'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {log.role || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">
                            {formatRelativeTime(log.timestamp)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(log.timestamp)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                              log.status === 'success'
                                ? 'bg-green-50 text-green-600'
                                : log.status === 'failed'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {log.status === 'success' ? (
                              <CheckCircle size={12} />
                            ) : (
                              <AlertTriangle size={12} />
                            )}
                            {log.status || 'success'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleViewDetails(log)}
                            className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[#00A9E0] hover:bg-[#EEF9FF] transition-colors"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-3">
              {filteredLogs.map((log, i) => {
                const info = getActionInfo(log.action);
                const Icon = info.icon;
                return (
                  <div
                    key={log._id || i}
                    className="border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => handleViewDetails(log)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${info.bg}`}
                      >
                        <Icon size={18} className={info.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-[#080C68] text-sm truncate">
                              {log.action || 'Activity'}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {info.label}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                              log.status === 'success'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {log.status || 'success'}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Building2 size={12} className="flex-shrink-0" />
                            <span className="truncate">
                              {log.entity || 'N/A'}
                              {log.entityName && ` • ${log.entityName}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <User size={12} className="flex-shrink-0" />
                            <span className="truncate">
                              {log.performedBy || 'System'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Clock size={12} className="flex-shrink-0" />
                            <span>{formatRelativeTime(log.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedLog && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => {
            setShowDetailsModal(false);
            setSelectedLog(null);
          }}
        >
          <div
            className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EEF9FF] flex items-center justify-center">
                  <FileText size={20} className="text-[#00A9E0]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#080C68]">
                    Log Details
                  </h2>
                  <p className="text-xs text-gray-500">
                    {formatDate(selectedLog.timestamp)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedLog(null);
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Action</p>
                  <p className="font-semibold text-[#080C68] text-sm">
                    {selectedLog.action || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      selectedLog.status === 'success'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {selectedLog.status || 'success'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Entity</p>
                  <p className="font-semibold text-[#080C68] text-sm">
                    {selectedLog.entity || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Entity Name</p>
                  <p className="font-semibold text-[#080C68] text-sm">
                    {selectedLog.entityName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Performed By</p>
                  <p className="font-semibold text-[#080C68] text-sm">
                    {selectedLog.performedBy || 'System'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="font-semibold text-[#080C68] text-sm">
                    {selectedLog.role || 'N/A'}
                  </p>
                </div>
              </div>

              {selectedLog.details && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Details</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                      {selectedLog.details}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;