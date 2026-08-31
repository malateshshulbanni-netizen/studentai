import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  Brain,
  AlertTriangle,
  Activity,
  UserCheck,
  UserX,
  Target,
  Book,
  ClipboardList,
  Sparkles,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [latestActivity, setLatestActivity] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [stats, setStats] = useState([]);
  const [error, setError] = useState(null);
  const [hasData, setHasData] = useState(false);
  const [predicting, setPredicting] = useState(false);

  // API URL - Direct URL
  const API_URL = 'http://localhost:5000';
  const ML_API_URL = 'http://localhost:8000';

  useEffect(() => {
    console.log('🔵 [Dashboard] Component mounted');
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    console.log('🟡 [Dashboard] fetchStudentData started');
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      console.log('📋 [Dashboard] Token exists:', !!token);
      console.log('📋 [Dashboard] User data:', userData);

      if (!token) {
        console.error('❌ [Dashboard] No token found in localStorage');
        setError('Please login to view dashboard');
        setLoading(false);
        return;
      }

      let user;
      try {
        user = JSON.parse(userData || '{}');
        console.log('✅ [Dashboard] Parsed user:', user);
      } catch (e) {
        console.error('❌ [Dashboard] Failed to parse user data:', e);
        setError('Invalid user data. Please login again.');
        setLoading(false);
        return;
      }

      const userId = user._id || user.id;
      console.log(`🔍 [Dashboard] User ID: ${userId}`);

      if (!userId) {
        console.error('❌ [Dashboard] No user ID found. User object:', user);
        setError('User ID not found. Please login again.');
        setLoading(false);
        return;
      }

      setStudentData(user);

      // Fetch student activities
      const activitiesUrl = `${API_URL}/api/student-activities?studentId=${userId}`;
      console.log(`📤 [Dashboard] GET ${activitiesUrl}`);
      
      const activitiesResponse = await fetch(activitiesUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`📥 [Dashboard] Activities Response Status: ${activitiesResponse.status}`);

      let activitiesData = [];
      let latestAct = null;

      if (activitiesResponse.ok) {
        const activitiesResult = await activitiesResponse.json();
        console.log('✅ [Dashboard] Activities data received:', activitiesResult);
        
        if (activitiesResult.data && activitiesResult.data.activities) {
          activitiesData = activitiesResult.data.activities;
          latestAct = activitiesData.length > 0 ? activitiesData[0] : null;
          console.log(`📊 [Dashboard] Found ${activitiesData.length} activities`);
          if (latestAct) {
            console.log('📊 [Dashboard] Latest activity:', latestAct);
          }
        }
      } else {
        console.warn(`⚠️ [Dashboard] Activities API returned status: ${activitiesResponse.status}`);
        try {
          const errorData = await activitiesResponse.json();
          console.warn('⚠️ [Dashboard] Activities error:', errorData);
        } catch (e) {
          console.warn('⚠️ [Dashboard] Could not parse activities error');
        }
      }

      setActivities(activitiesData.slice(0, 5));
      setLatestActivity(latestAct);

      // Check if student has data
      const hasDataFlag = latestAct !== null && 
        (latestAct.attendancePercentage > 0 || 
         latestAct.gpa > 0 || 
         latestAct.backlogs > 0 || 
         latestAct.assignmentCompletion > 0);
      setHasData(hasDataFlag);

      // Fetch prediction if data exists
      if (hasDataFlag && latestAct) {
        await fetchPrediction(latestAct, token);
      } else {
        console.log('ℹ️ [Dashboard] No activity data available for prediction');
        setPredictionResult(null);
        setPredicting(false);
      }

      // Calculate stats
      const attendance = latestAct?.attendancePercentage || 0;
      const gpa = latestAct?.gpa || 0;
      const backlogs = latestAct?.backlogs || 0;
      const assignmentCompletion = latestAct?.assignmentCompletion || 0;
      const engagement = latestAct?.engagement || 'Medium';

      console.log('📊 [Dashboard] Calculated stats:', { 
        attendance, 
        gpa, 
        backlogs, 
        assignmentCompletion, 
        engagement,
        hasData: hasDataFlag 
      });

      setStats([
        { 
          icon: Calendar, 
          title: 'Attendance', 
          value: hasDataFlag ? `${attendance}%` : 'No Data', 
          subtitle: hasDataFlag 
            ? (attendance >= 75 ? '✅ Good standing' : '⚠️ Needs improvement')
            : 'Add activity data',
          color: hasDataFlag 
            ? (attendance >= 75 ? '#DCFCE7' : '#FEE2E2')
            : '#F3F4F6',
          iconColor: hasDataFlag 
            ? (attendance >= 75 ? '#22C55E' : '#EF4444')
            : '#9CA3AF'
        },
        { 
          icon: BarChart3, 
          title: 'Current GPA', 
          value: hasDataFlag ? gpa.toFixed(1) : 'No Data', 
          subtitle: hasDataFlag 
            ? (gpa >= 6 ? '📈 Satisfactory' : '📉 Needs improvement')
            : 'Add activity data',
          color: hasDataFlag 
            ? (gpa >= 6 ? '#DCFCE7' : '#FEE2E2')
            : '#F3F4F6',
          iconColor: hasDataFlag 
            ? (gpa >= 6 ? '#22C55E' : '#EF4444')
            : '#9CA3AF'
        },
        { 
          icon: BookOpen, 
          title: 'Assignment Completion', 
          value: hasDataFlag ? `${assignmentCompletion}%` : 'No Data', 
          subtitle: hasDataFlag 
            ? (assignmentCompletion >= 60 ? '✅ On track' : '⚠️ Behind schedule')
            : 'Add activity data',
          color: hasDataFlag 
            ? (assignmentCompletion >= 60 ? '#DCFCE7' : '#FEE2E2')
            : '#F3F4F6',
          iconColor: hasDataFlag 
            ? (assignmentCompletion >= 60 ? '#22C55E' : '#EF4444')
            : '#9CA3AF'
        },
        { 
          icon: Award, 
          title: 'Backlogs', 
          value: hasDataFlag ? backlogs : 'No Data', 
          subtitle: hasDataFlag 
            ? (backlogs === 0 ? '✅ No backlogs' : `⚠️ ${backlogs} backlog(s)`)
            : 'Add activity data',
          color: hasDataFlag 
            ? (backlogs === 0 ? '#DCFCE7' : '#FEE2E2')
            : '#F3F4F6',
          iconColor: hasDataFlag 
            ? (backlogs === 0 ? '#22C55E' : '#EF4444')
            : '#9CA3AF'
        },
      ]);

      console.log('✅ [Dashboard] Dashboard data loaded successfully');

    } catch (error) {
      console.error('❌ [Dashboard] Error fetching student data:', error);
      console.error('❌ [Dashboard] Error stack:', error.stack);
      setError(`Failed to load dashboard data: ${error.message}`);
      
      setStats([
        { icon: BookOpen, title: 'Enrolled Courses', value: 'N/A', subtitle: 'Please login', color: '#EEF9FF', iconColor: '#00A9E0' },
        { icon: Calendar, title: 'Attendance', value: 'N/A', subtitle: 'No data available', color: '#EEF9FF', iconColor: '#00A9E0' },
        { icon: BarChart3, title: 'Current GPA', value: 'N/A', subtitle: 'No data available', color: '#EEF9FF', iconColor: '#00A9E0' },
        { icon: Award, title: 'Backlogs', value: 'N/A', subtitle: 'No data available', color: '#EEF9FF', iconColor: '#00A9E0' },
      ]);
    } finally {
      setLoading(false);
      console.log('🟢 [Dashboard] fetchStudentData completed, loading set to false');
    }
  };

  // Fetch prediction - Handles ANY backend response structure
  const fetchPrediction = async (latestAct, token) => {
    setPredicting(true);
    let prediction = null;
    
    try {
      console.log('🔮 [Dashboard] Fetching prediction with data:', {
        attendance: latestAct.attendancePercentage || 0,
        gpa: latestAct.gpa || 0,
        backlogs: latestAct.backlogs || 0,
        assignment_completion: latestAct.assignmentCompletion || 0,
        engagement: latestAct.engagement || 'Medium'
      });

      const predictUrl = `${ML_API_URL}/api/predict`;
      console.log(`📤 [Dashboard] POST ${predictUrl}`);
      
      const predictResponse = await fetch(predictUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attendance: latestAct.attendancePercentage || 0,
          gpa: latestAct.gpa || 0,
          backlogs: latestAct.backlogs || 0,
          assignment_completion: latestAct.assignmentCompletion || 0,
          engagement: latestAct.engagement || 'Medium'
        })
      });

      console.log(`📥 [Dashboard] Prediction Response Status: ${predictResponse.status}`);

      if (predictResponse.ok) {
        const predictData = await predictResponse.json();
        console.log('✅ [Dashboard] Prediction data received:', JSON.stringify(predictData, null, 2));

        let extractedPrediction = null;
        
        // Try multiple possible response structures
        if (predictData.success && predictData.data) {
          extractedPrediction = predictData.data;
        } else if (predictData.data) {
          extractedPrediction = predictData.data;
        } else if (predictData.risk_level || predictData.risk || predictData.probability !== undefined) {
          extractedPrediction = predictData;
        } else if (predictData.prediction !== undefined) {
          extractedPrediction = {
            risk_level: predictData.risk_level || predictData.risk || 'Unknown',
            probability: predictData.probability || 0
          };
        } else if (predictData.predictions !== undefined) {
          if (Array.isArray(predictData.predictions) && predictData.predictions.length > 0) {
            extractedPrediction = predictData.predictions[0];
          }
        } else {
          const riskLevel = predictData.risk_level || predictData.risk || predictData.label || 
                           predictData.prediction || predictData.result || 'Unknown';
          const probability = predictData.probability || predictData.prob || 
                            predictData.confidence || predictData.score || 0;
          extractedPrediction = { risk_level: riskLevel, probability: probability };
        }
        
        if (extractedPrediction) {
          let riskLevel = extractedPrediction.risk_level || 
                          extractedPrediction.risk || 
                          extractedPrediction.label || 
                          extractedPrediction.prediction ||
                          extractedPrediction.result ||
                          extractedPrediction.status ||
                          extractedPrediction.level ||
                          'Unknown';
          
          if (typeof riskLevel === 'string') {
            const lower = riskLevel.toLowerCase();
            if (lower === 'high' || lower === 'high risk' || lower === 'high-risk') {
              riskLevel = 'High';
            } else if (lower === 'medium' || lower === 'medium risk' || lower === 'medium-risk') {
              riskLevel = 'Medium';
            } else if (lower === 'low' || lower === 'low risk' || lower === 'low-risk') {
              riskLevel = 'Low';
            } else if (lower === 'unknown' || lower === 'no data') {
              riskLevel = 'Unknown';
            } else {
              riskLevel = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1).toLowerCase();
            }
          }
          
          let probability = 0;
          if (extractedPrediction.probability !== undefined) {
            probability = Number(extractedPrediction.probability);
          } else if (extractedPrediction.prob !== undefined) {
            probability = Number(extractedPrediction.prob);
          } else if (extractedPrediction.confidence !== undefined) {
            probability = Number(extractedPrediction.confidence);
          } else if (extractedPrediction.score !== undefined) {
            probability = Number(extractedPrediction.score);
          } else if (extractedPrediction.prediction !== undefined && typeof extractedPrediction.prediction === 'number') {
            probability = Number(extractedPrediction.prediction) / 100;
          }
          
          if (probability > 1) {
            probability = probability / 100;
          }
          
          prediction = {
            risk_level: riskLevel,
            probability: Math.min(Math.max(probability, 0), 1)
          };
        } else {
          prediction = {
            risk_level: 'Unknown',
            probability: 0
          };
        }
      } else {
        prediction = {
          risk_level: 'Unknown',
          probability: 0
        };
      }
    } catch (error) {
      console.error('❌ [Dashboard] Error fetching prediction:', error);
      prediction = {
        risk_level: 'Unknown',
        probability: 0
      };
    }
    
    console.log('🔮 [Dashboard] Final prediction value:', prediction);
    setPredictionResult(prediction);
    setPredicting(false);
  };

  // Get risk level color and icon - SMALL VERSION
  const getRiskInfo = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'high' || level === 'high risk') {
      return { 
        color: 'text-red-600 bg-red-100', 
        icon: ShieldAlert, 
        label: 'High',
        emoji: '🔴',
        border: 'border-red-200'
      };
    } else if (level === 'medium' || level === 'medium risk') {
      return { 
        color: 'text-yellow-600 bg-yellow-100', 
        icon: Shield, 
        label: 'Medium',
        emoji: '🟡',
        border: 'border-yellow-200'
      };
    } else if (level === 'low' || level === 'low risk') {
      return { 
        color: 'text-green-600 bg-green-100', 
        icon: ShieldCheck, 
        label: 'Low',
        emoji: '🟢',
        border: 'border-green-200'
      };
    }
    return { 
      color: 'text-gray-600 bg-gray-100', 
      icon: Activity, 
      label: 'Unknown',
      emoji: '⚪',
      border: 'border-gray-200'
    };
  };

  // Get engagement color
  const getEngagementColor = (engagement) => {
    switch(engagement?.toLowerCase()) {
      case 'high':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Get attendance color
  const getAttendanceColor = (attendance) => {
    if (attendance >= 75) return 'text-green-600';
    if (attendance >= 50) return 'text-yellow-600';
    return 'text-red-600';
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

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8 bg-gradient-to-r from-[#F5FBFF] to-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#080C68]">
              Welcome back, {studentData?.name || 'Student'} 👋
            </h1>
            <p className="text-gray-500 mt-1">
              {studentData?.course ? `${studentData.course} - Semester ${studentData.semester || 'N/A'}` : 'Here is your academic overview'}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-[#00A9E0]/10 px-4 py-2 rounded-lg">
            <TrendingUp size={20} className="text-[#00A9E0]" />
            <span className="text-sm font-medium text-[#080C68]">
              {studentData?.usn || 'Student'} | Sem {studentData?.semester || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* RISK PREDICTION SECTION - SMALL & COMPACT */}
      <div className="mb-8 bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <Brain size={18} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#080C68]">Risk Prediction</h2>
            <p className="text-xs text-gray-500">AI-powered dropout risk assessment</p>
          </div>
          {predicting && (
            <div className="ml-auto flex items-center gap-2 text-purple-600">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs">Analyzing...</span>
            </div>
          )}
        </div>

        {!hasData ? (
          <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
            <AlertCircle size={24} className="mx-auto text-yellow-500 mb-2" />
            <p className="text-sm font-medium text-yellow-700">No academic data available</p>
            <p className="text-xs text-yellow-600 mt-1">Add activity data to get risk prediction</p>
          </div>
        ) : predicting ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
            <Loader2 size={28} className="mx-auto text-gray-400 animate-spin mb-2" />
            <p className="text-sm font-medium text-gray-600">Analyzing your academic data...</p>
            <p className="text-xs text-gray-400 mt-1">Please wait while we calculate your risk assessment</p>
          </div>
        ) : predictionResult ? (
          <div className={`rounded-lg p-4 border ${getRiskInfo(predictionResult.risk_level).border} bg-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${getRiskInfo(predictionResult.risk_level).color} flex items-center justify-center text-lg shadow-sm flex-shrink-0`}>
                  {getRiskInfo(predictionResult.risk_level).emoji}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Risk Assessment</p>
                  <p className={`text-lg font-bold ${getRiskInfo(predictionResult.risk_level).color.split(' ')[0]}`}>
                    {getRiskInfo(predictionResult.risk_level).label} Risk
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500">Dropout Probability</p>
                  <p className="text-base font-bold text-[#080C68]">
                    {(predictionResult.probability * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500">Confidence</p>
                  <p className="text-base font-bold text-[#080C68]">
                    {predictionResult.probability > 0.7 ? 'High' : predictionResult.probability > 0.4 ? 'Medium' : 'Low'}
                  </p>
                </div>
              </div>
            </div>
            {/* Progress Bar - Smaller */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-1000 ${
                    predictionResult.risk_level?.toLowerCase() === 'high' ? 'bg-red-500' :
                    predictionResult.risk_level?.toLowerCase() === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${(predictionResult.probability || 0) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
            <AlertCircle size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-600">Unable to get prediction</p>
            <button 
              onClick={() => {
                setPredicting(true);
                const token = localStorage.getItem('token');
                if (latestActivity) {
                  fetchPrediction(latestActivity, token);
                }
              }}
              className="mt-2 px-4 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry Prediction
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={40} className="text-[#00A9E0] animate-spin" />
          <span className="ml-3 text-gray-500">Loading dashboard...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Please check your connection and try again</p>
          <button 
            onClick={fetchStudentData}
            className="mt-4 px-4 py-2 bg-[#00A9E0] text-white rounded-lg hover:bg-[#008FC2] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Academic Performance Cards */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#080C68] mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-[#00A9E0]" />
              Academic Performance
              {!hasData && (
                <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                  No data available
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color }}>
                      <stat.icon size={22} style={{ color: stat.iconColor }} />
                    </div>
                    <span className="text-2xl font-bold text-[#080C68]">{stat.value}</span>
                  </div>
                  <h3 className="text-sm font-medium text-[#080C68]">{stat.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-8">
            <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all hover:scale-105">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#00A9E020' }}>
                <BookOpen size={20} color="#00A9E0" />
              </div>
              <span className="text-xs font-medium text-[#080C68]">View Courses</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all hover:scale-105">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#080C6820' }}>
                <Calendar size={20} color="#080C68" />
              </div>
              <span className="text-xs font-medium text-[#080C68]">Attendance</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all hover:scale-105">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#00A9E020' }}>
                <BarChart3 size={20} color="#00A9E0" />
              </div>
              <span className="text-xs font-medium text-[#080C68]">View Grades</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all hover:scale-105">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#080C6820' }}>
                <Clock size={20} color="#080C68" />
              </div>
              <span className="text-xs font-medium text-[#080C68]">Assignments</span>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#080C68]">Recent Activity</h3>
              <span className="text-xs text-gray-500">{activities.length} records</span>
            </div>
            <div className="divide-y divide-gray-100">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={index} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#EEF9FF] flex items-center justify-center flex-shrink-0">
                        <Activity size={16} className="text-[#00A9E0]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#080C68]">
                          {activity.engagement || 'Activity'} - {activity.status || 'In Progress'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Attendance: {activity.attendancePercentage || 0}% | GPA: {activity.gpa || 0} | Backlogs: {activity.backlogs || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        activity.status === 'Submitted' ? 'bg-green-100 text-green-700' :
                        activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {activity.status || 'In Progress'}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatDate(activity.submissionDate || activity.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <Clock size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No recent activities found</p>
                  <p className="text-xs text-gray-400 mt-1">Your academic activities will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Student Information Card */}
          {studentData && (
            <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-[#080C68] flex items-center gap-2">
                  <Users size={20} className="text-[#00A9E0]" />
                  Student Information
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium text-[#080C68]">{studentData.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">USN</p>
                  <p className="font-medium text-[#080C68]">{studentData.usn}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-[#080C68]">{studentData.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Course</p>
                  <p className="font-medium text-[#080C68]">{studentData.course}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Branch</p>
                  <p className="font-medium text-[#080C68]">{studentData.branch}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Semester</p>
                  <p className="font-medium text-[#080C68]">Sem {studentData.semester}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-[#080C68]">{studentData.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Institution</p>
                  <p className="font-medium text-[#080C68]">{studentData.institutionName || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;