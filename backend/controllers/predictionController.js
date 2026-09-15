const axios = require('axios');

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// @desc    Predict student dropout risk
// @route   POST /api/predict
// @access  Private
const predictDropout = async (req, res) => {
  try {
    // Get ALL 11 features from request body
    const { 
      age,
      attendance_percentage,
      current_gpa,
      failed_subjects,
      backlogs,
      assignment_completion_percentage,
      internal_assessment_marks,
      exam_score,
      lms_activity_score,
      fee_pending,
      counseling_sessions
    } = req.body;

    console.log('='.repeat(60));
    console.log('[NODE BACKEND] Received prediction request');
    console.log('='.repeat(60));
    console.log('Received data:', JSON.stringify(req.body, null, 2));

    // Validate ALL 11 features
    const requiredFields = [
      'age',
      'attendance_percentage',
      'current_gpa',
      'failed_subjects',
      'backlogs',
      'assignment_completion_percentage',
      'internal_assessment_marks',
      'exam_score',
      'lms_activity_score',
      'fee_pending',
      'counseling_sessions'
    ];

    const missingFields = requiredFields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      console.log('[ERROR] Missing fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `All fields are required. Missing: ${missingFields.join(', ')}`
      });
    }

    // Validate ranges for numeric fields
    const validations = [
      { field: 'age', min: 17, max: 30, name: 'Age' },
      { field: 'attendance_percentage', min: 0, max: 100, name: 'Attendance' },
      { field: 'current_gpa', min: 0, max: 10, name: 'GPA' },
      { field: 'failed_subjects', min: 0, max: 20, name: 'Failed Subjects' },
      { field: 'backlogs', min: 0, max: 20, name: 'Backlogs' },
      { field: 'assignment_completion_percentage', min: 0, max: 100, name: 'Assignment Completion' },
      { field: 'internal_assessment_marks', min: 0, max: 100, name: 'Internal Assessment Marks' },
      { field: 'exam_score', min: 0, max: 100, name: 'Exam Score' },
      { field: 'lms_activity_score', min: 0, max: 100, name: 'LMS Activity Score' },
      { field: 'fee_pending', min: 0, max: 1, name: 'Fee Pending' },
      { field: 'counseling_sessions', min: 0, max: 20, name: 'Counseling Sessions' }
    ];

    for (const validation of validations) {
      const value = req.body[validation.field];
      if (value < validation.min || value > validation.max) {
        return res.status(400).json({
          success: false,
          message: `${validation.name} must be between ${validation.min} and ${validation.max}`
        });
      }
    }

    // Build payload for ML service (keep the same field names)
    const mlPayload = {
      age: parseInt(age),
      attendance_percentage: parseFloat(attendance_percentage),
      current_gpa: parseFloat(current_gpa),
      failed_subjects: parseInt(failed_subjects) || 0,
      backlogs: parseInt(backlogs) || 0,
      assignment_completion_percentage: parseFloat(assignment_completion_percentage),
      internal_assessment_marks: parseFloat(internal_assessment_marks),
      exam_score: parseFloat(exam_score),
      lms_activity_score: parseFloat(lms_activity_score),
      fee_pending: parseInt(fee_pending) || 0,
      counseling_sessions: parseInt(counseling_sessions) || 0
    };

    console.log('[NODE BACKEND] Sending to ML Service:', JSON.stringify(mlPayload, null, 2));

    // Call ML service
    const response = await axios.post(`${ML_SERVICE_URL}/api/predict`, mlPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[NODE BACKEND] ML Service Response:', response.status);

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('[NODE BACKEND] Prediction error:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('[NODE BACKEND] ML Service Error:', error.response.data);
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data.detail || error.response.data.message || 'ML Service error',
        error: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('[NODE BACKEND] ML Service not responding');
      return res.status(503).json({
        success: false,
        message: 'ML Service is not available. Please try again later.'
      });
    } else {
      // Something happened in setting up the request
      return res.status(500).json({
        success: false,
        message: 'Failed to get prediction',
        error: error.message
      });
    }
  }
};

// @desc    Batch predict student dropout risk
// @route   POST /api/predict-batch
// @access  Private
const predictBatchDropout = async (req, res) => {
  try {
    const { students } = req.body;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({
        success: false,
        message: 'Students array is required'
      });
    }

    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Students array cannot be empty'
      });
    }

    console.log('='.repeat(60));
    console.log('[NODE BACKEND] Batch prediction request');
    console.log('='.repeat(60));
    console.log(`Total students: ${students.length}`);

    // Validate each student has ALL 11 features
    const requiredFields = [
      'age',
      'attendance_percentage',
      'current_gpa',
      'failed_subjects',
      'backlogs',
      'assignment_completion_percentage',
      'internal_assessment_marks',
      'exam_score',
      'lms_activity_score',
      'fee_pending',
      'counseling_sessions'
    ];

    let hasErrors = false;
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const missingFields = requiredFields.filter(field => {
        const value = student[field];
        return value === undefined || value === null || value === '';
      });

      if (missingFields.length > 0) {
        console.log(`[ERROR] Student ${i+1} missing fields:`, missingFields);
        hasErrors = true;
        // Don't return immediately, but log all errors
      }
    }

    if (hasErrors) {
      return res.status(400).json({
        success: false,
        message: 'Some students are missing required fields. All 11 features are required for each student.'
      });
    }

    // Call ML service
    const response = await axios.post(`${ML_SERVICE_URL}/api/predict-batch`, {
      students
    });

    console.log('[NODE BACKEND] Batch prediction complete');

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('[NODE BACKEND] Batch prediction error:', error.message);
    
    if (error.response) {
      console.error('[NODE BACKEND] ML Service Error:', error.response.data);
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data.detail || error.response.data.message || 'ML Service error',
        error: error.response.data
      });
    } else if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'ML Service is not available. Please try again later.'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to get batch predictions',
        error: error.message
      });
    }
  }
};

// @desc    Get model info
// @route   GET /api/model-info
// @access  Private
const getModelInfo = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/api/model-info`);
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('[NODE BACKEND] Model info error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get model info'
    });
  }
};

// @desc    Get available features
// @route   GET /api/features
// @access  Private
const getFeatures = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/api/features`);
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('[NODE BACKEND] Features error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get features'
    });
  }
};

module.exports = {
  predictDropout,
  predictBatchDropout,
  getModelInfo,
  getFeatures
};