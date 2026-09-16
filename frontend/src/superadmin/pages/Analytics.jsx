import React, { useState, useEffect } from 'react';
import {
  Building2,
  Brain,
  Clock,
  Loader2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Activity,
  FileText,
  Play,
  TrendingUp,
  Award
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Analytics = () => {
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [institutions, setInstitutions] = useState([]);
  const [mlModelInfo, setMlModelInfo] = useState(null);
  const [trainingHistory, setTrainingHistory] = useState([]);

  // ✅ Hardcoded URLs — same pattern as other super admin files
  const API_URL = 'https://studentaibackend.vercel.app';
  const ML_API_URL = 'http://localhost:8000';

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
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setFetching(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      console.log('📊 [Analytics] Fetching institutions, model info, and training history...');

      // Fetch all in parallel
      const [instRes, mlInfoRes, historyRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/institutions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${ML_API_URL}/api/model-info`),
        fetch(`${ML_API_URL}/api/training-history`),
      ]);

      // Parse institutions
      if (instRes.status === 'fulfilled' && instRes.value.ok) {
        const data = await instRes.value.json();
        setInstitutions(data.data || []);
      }

      // Parse ML model info
      if (mlInfoRes.status === 'fulfilled' && mlInfoRes.value.ok) {
        const data = await mlInfoRes.value.json();
        setMlModelInfo(data);
      }

      // Parse training history
      if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
        const data = await historyRes.value.json();
        if (data.success) {
          setTrainingHistory(data.history || []);
        }
      }

      toast.success('✅ Analytics loaded successfully!', toastConfig);
    } catch (err) {
      console.error('❌ [Analytics] Error:', err);
      setError('Failed to load analytics. Please try again.');
      toast.error('Failed to load analytics.', toastConfig);
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchAnalytics();
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

  // ✅ Training history chart data (last 6 versions)
  const chartData = trainingHistory.slice(0, 6).reverse();

  // Find max accuracy for scaling bars
  const maxAccuracy = Math.max(
    ...chartData.map((h) => h.accuracy || 0),
    0.1
  );

  // ✅ Donut chart data — count of models by status
  const activeCount = trainingHistory.filter((h) => h.status === 'active').length;
  const archivedCount = trainingHistory.filter((h) => h.status !== 'active').length;
  const totalModels = activeCount + archivedCount;

  const activePct = totalModels > 0 ? (activeCount / totalModels) * 100 : 0;
  const archivedPct = totalModels > 0 ? (archivedCount / totalModels) * 100 : 0;

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
            Analytics
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Platform overview and ML model insights
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={fetching}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00A9E0] hover:bg-[#008FC2] text-white font-semibold rounded-lg transition shadow-sm disabled:opacity-70 w-full sm:w-auto"
        >
          <RefreshCw size={18} className={fetching ? 'animate-spin' : ''} />
          {fetching ? 'Refreshing...' : 'Refresh'}
        </button>
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

      {/* Loading */}
      {loading ? (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <Loader2 size={40} className="mx-auto text-[#00A9E0] animate-spin" />
          <p className="mt-3 text-gray-500">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* ============================================ */}
          {/* TOP STAT CARDS - INSTITUTIONS + ML MODEL     */}
          {/* ============================================ */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

            {/* Total Institutions */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#EEF9FF' }}
                >
                  <Building2 size={22} style={{ color: '#00A9E0' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Total Institutions</p>
                  <p className="text-2xl font-bold text-[#080C68]">
                    {institutions.length}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {institutions.filter((i) => i.active).length} active,{' '}
                {institutions.filter((i) => !i.active).length} inactive
              </p>
            </div>

            {/* ML Model Status */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#F3E8FF' }}
                >
                  <Brain size={22} style={{ color: '#9333EA' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">ML Model</p>
                  <p className="text-2xl font-bold text-[#080C68]">
                    {mlModelInfo?.status === 'loaded' ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    mlModelInfo?.status === 'loaded'
                      ? 'bg-green-500 animate-pulse'
                      : 'bg-red-500'
                  }`}
                />
                <p className="text-xs text-gray-500">
                  {mlModelInfo?.model_type || 'No model loaded'}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* ML MODEL DETAILS                             */}
          {/* ============================================ */}
          {mlModelInfo?.status === 'loaded' && (
            <div className="mt-6 bg-white rounded-xl shadow-sm p-5 sm:p-6 border border-gray-100">
              <h3 className="font-semibold text-[#080C68] mb-4 flex items-center gap-2">
                <Brain size={18} className="text-purple-600" />
                Current Model Performance
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Accuracy</p>
                  <p className="text-xl font-bold text-[#080C68] mt-1">
                    {mlModelInfo.metrics?.accuracy
                      ? `${(mlModelInfo.metrics.accuracy * 100).toFixed(1)}%`
                      : 'N/A'}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Precision</p>
                  <p className="text-xl font-bold text-[#080C68] mt-1">
                    {mlModelInfo.metrics?.precision
                      ? `${(mlModelInfo.metrics.precision * 100).toFixed(1)}%`
                      : 'N/A'}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Recall</p>
                  <p className="text-xl font-bold text-[#080C68] mt-1">
                    {mlModelInfo.metrics?.recall
                      ? `${(mlModelInfo.metrics.recall * 100).toFixed(1)}%`
                      : 'N/A'}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">F1 Score</p>
                  <p className="text-xl font-bold text-[#080C68] mt-1">
                    {mlModelInfo.metrics?.f1_score
                      ? `${(mlModelInfo.metrics.f1_score * 100).toFixed(1)}%`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Features: </span>
                  <span className="font-semibold text-[#080C68]">
                    {mlModelInfo.feature_count || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">ROC-AUC: </span>
                  <span className="font-semibold text-[#080C68]">
                    {mlModelInfo.metrics?.roc_auc
                      ? `${(mlModelInfo.metrics.roc_auc * 100).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* CHARTS ROW - BAR + DONUT                    */}
          {/* ============================================ */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* BAR CHART - Training Accuracy History */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#080C68] flex items-center gap-2">
                  <BarChart3 size={18} className="text-[#00A9E0]" />
                  Training Accuracy
                </h3>
                <span className="text-xs text-gray-500">
                  Last {chartData.length} versions
                </span>
              </div>

              {chartData.length === 0 ? (
                <div className="text-center py-10">
                  <Activity size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">
                    No training history available
                  </p>
                </div>
              ) : (
                <>
                  {/* Bar Chart */}
                  <div className="flex items-end gap-2 sm:gap-3 h-40 px-2">
                    {chartData.map((h, i) => {
                      const heightPct = (h.accuracy / maxAccuracy) * 100;
                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center gap-1 min-w-0"
                        >
                          <span className="text-[10px] sm:text-xs font-bold text-[#080C68]">
                            {(h.accuracy * 100).toFixed(1)}%
                          </span>
                          <div className="w-full h-24 sm:h-28 flex items-end">
                            <div
                              className="w-full rounded-t-md transition-all duration-500 hover:opacity-80"
                              style={{
                                height: `${Math.max(heightPct, 6)}%`,
                                background:
                                  i === chartData.length - 1
                                    ? 'linear-gradient(180deg, #00A9E0 0%, #008FC2 100%)'
                                    : 'linear-gradient(180deg, #93C5FD 0%, #60A5FA 100%)',
                              }}
                              title={`v${h.version || i + 1}: ${(h.accuracy * 100).toFixed(1)}%`}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 truncate w-full text-center">
                            {h.version || `v${i + 1}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-[#00A9E0]" />
                      <span className="text-gray-600">Latest</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-[#93C5FD]" />
                      <span className="text-gray-600">Previous</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* DONUT CHART - Model Status Distribution */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-5 sm:p-6 border border-gray-100">
              <h3 className="font-semibold text-[#080C68] mb-4 flex items-center gap-2">
                <Award size={18} className="text-amber-500" />
                Model Versions
              </h3>

              {totalModels === 0 ? (
                <div className="text-center py-10">
                  <Brain size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">No versions yet</p>
                </div>
              ) : (
                <>
                  {/* Donut */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#F3F4F6"
                          strokeWidth="15"
                        />
                        {/* Active arc (green) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#22C55E"
                          strokeWidth="15"
                          strokeDasharray={`${activePct * 2.51} 251`}
                        />
                        {/* Archived arc (gray) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#9CA3AF"
                          strokeWidth="15"
                          strokeDasharray={`${archivedPct * 2.51} 251`}
                          strokeDashoffset={`-${activePct * 2.51}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl sm:text-3xl font-bold text-[#080C68]">
                          {totalModels}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          Total Models
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-gray-600">Active</span>
                      </div>
                      <span className="font-semibold text-green-600">
                        {activeCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        <span className="text-gray-600">Archived</span>
                      </div>
                      <span className="font-semibold text-gray-600">
                        {archivedCount}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* TRAINING HISTORY LIST                       */}
          {/* ============================================ */}
          <div className="mt-6 bg-white rounded-xl shadow-sm p-5 sm:p-6 border border-gray-100">
            <h3 className="font-semibold text-[#080C68] mb-4 flex items-center gap-2">
              <Clock size={18} className="text-[#00A9E0]" />
              Recent Training History
            </h3>

            {trainingHistory.length === 0 ? (
              <div className="text-center py-10">
                <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No training history</p>
                <p className="text-xs text-gray-400 mt-1">
                  Train a model to see history here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {trainingHistory.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg ${
                      item.status === 'active'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      {item.status === 'active' ? (
                        <CheckCircle
                          size={20}
                          className="text-green-500 flex-shrink-0 mt-0.5 sm:mt-0"
                        />
                      ) : (
                        <Clock
                          size={20}
                          className="text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#080C68] text-sm truncate">
                          Version {item.version || `v${index + 1}.0.0`}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 break-words">
                          {formatDate(item.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 text-xs pl-8 sm:pl-0">
                      <div>
                        <p className="text-gray-500">Accuracy</p>
                        <p className="font-bold text-[#080C68]">
                          {(item.accuracy * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Features</p>
                        <p className="font-bold text-[#080C68]">
                          {item.features || 'N/A'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                          item.status === 'active'
                            ? 'bg-green-200 text-green-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {item.status === 'active' ? 'Active' : 'Archived'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;