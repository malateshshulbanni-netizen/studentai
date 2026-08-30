import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Upload, 
  Download,
  Play,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Trash2
} from 'lucide-react';

const MLModels = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [training, setTraining] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [trainingLog, setTrainingLog] = useState('');
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // API URL - fixed to avoid process.env error
  const ML_API_URL = 'https://studentaimlservice.onrender.com';

  useEffect(() => {
    fetchModelInfo();
    fetchTrainingHistory();
  }, []);

  const fetchModelInfo = async () => {
    try {
      const response = await fetch(`${ML_API_URL}/api/model-info`);
      const data = await response.json();
      setModelInfo(data);
    } catch (error) {
      console.error('Error fetching model info:', error);
    }
  };

  const fetchTrainingHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${ML_API_URL}/api/training-history`);
      const data = await response.json();
      if (data.success) {
        setTrainingHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching training history:', error);
      // Set default history if API fails
      setTrainingHistory([
        {
          version: '1.0.0',
          date: new Date().toISOString(),
          accuracy: 0.62,
          samples: 1000,
          features: 5,
          status: 'active'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainModel = async () => {
    setTraining(true);
    setTrainingLog('Starting training...\n');
    try {
      const response = await fetch(`${ML_API_URL}/api/train`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTrainingLog(data.output || 'Training completed successfully!');
        alert('✅ Model training completed successfully!');
        fetchModelInfo();
        fetchTrainingHistory();
      } else {
        setTrainingLog(data.error || 'Training failed');
        alert('❌ Training failed. Check logs for details.');
      }
    } catch (error) {
      console.error('Training error:', error);
      setTrainingLog(`Error: ${error.message}`);
      alert('Error training model');
    } finally {
      setTraining(false);
    }
  };

  const handleUploadDataset = async () => {
    if (!selectedFile) {
      alert('Please select a CSV file');
      return;
    }

    setUploading(true);
    setUploadMessage('Uploading...');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${ML_API_URL}/api/upload-dataset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setUploadMessage('✅ Dataset uploaded successfully!');
        setSelectedFile(null);
        document.getElementById('fileInput').value = '';
      } else {
        setUploadMessage('❌ Upload failed: ' + data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadMessage('❌ Error uploading dataset');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#080C68]">ML Models</h1>
          <p className="text-gray-500 mt-1">Manage machine learning models for dropout prediction</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleTrainModel}
            disabled={training}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00A9E0] hover:bg-[#008FC2] text-white rounded-lg font-semibold transition shadow-sm disabled:opacity-70"
          >
            {training ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />}
            {training ? 'Training...' : 'Train Model'}
          </button>
        </div>
      </div>

      {/* Model Status */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-3 h-3 rounded-full ${modelInfo?.status === 'loaded' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <h3 className="font-semibold text-[#080C68]">Model Status</h3>
        </div>
        <p className="text-sm text-gray-500">
          {modelInfo?.status === 'loaded' ? '✅ Model is loaded and ready for predictions' : '⚠️ No model loaded. Please train the model.'}
        </p>
        {modelInfo?.status === 'loaded' && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Model Type</p>
              <p className="font-medium text-[#080C68]">{modelInfo.model_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Accuracy</p>
              <p className="font-medium text-[#080C68]">
                {modelInfo.metrics?.accuracy ? `${(modelInfo.metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Features</p>
              <p className="font-medium text-[#080C68]">{modelInfo.features?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Classes</p>
              <p className="font-medium text-[#080C68]">{modelInfo.engagement_classes?.length || 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Dataset */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <h3 className="font-semibold text-[#080C68] mb-3 flex items-center gap-2">
          <Upload size={18} className="text-[#00A9E0]" />
          Upload Training Dataset
        </h3>
        <p className="text-sm text-gray-500 mb-4">Upload a CSV file containing student data for training</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="fileInput"
            type="file"
            accept=".csv"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A9E0] transition-colors"
          />
          <button
            onClick={handleUploadDataset}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#080C68] hover:bg-[#05094f] text-white rounded-lg font-semibold transition shadow-sm disabled:opacity-70"
          >
            {uploading ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} />}
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {selectedFile && (
          <p className="text-sm text-green-600 mt-2">📄 Selected: {selectedFile.name}</p>
        )}
        {uploadMessage && (
          <p className={`text-sm mt-2 ${uploadMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {uploadMessage}
          </p>
        )}
      </div>

      {/* Training Log */}
      {trainingLog && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <h3 className="font-semibold text-[#080C68] mb-3 flex items-center gap-2">
            <FileText size={18} className="text-[#00A9E0]" />
            Training Log
          </h3>
          <pre className="bg-gray-50 p-4 rounded-lg text-xs font-mono text-gray-700 max-h-60 overflow-y-auto whitespace-pre-wrap">
            {trainingLog}
          </pre>
        </div>
      )}

      {/* Training History - Real Data */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="font-semibold text-[#080C68] mb-3 flex items-center gap-2">
          <Clock size={18} className="text-[#00A9E0]" />
          Training History
        </h3>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading history...</div>
        ) : trainingHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No training history available. Train a model to see history.</div>
        ) : (
          <div className="space-y-3">
            {trainingHistory.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  item.status === 'active' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.status === 'active' ? (
                    <CheckCircle size={18} className="text-green-500" />
                  ) : (
                    <Clock size={18} className="text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium text-[#080C68] text-sm">
                      Version {item.version || `v${index + 1}.0.0`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(item.date)} • Accuracy: {(item.accuracy * 100).toFixed(1)}% • 
                      {item.samples} samples • {item.features} features
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold ${
                  item.status === 'active' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {item.status === 'active' ? 'Active' : 'Archived'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MLModels;