const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// All 11 features required for prediction
const REQUIRED_FIELDS = [
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

// Field validations
const FIELD_VALIDATIONS = {
  age: { min: 17, max: 30, name: 'Age' },
  attendance_percentage: { min: 0, max: 100, name: 'Attendance Percentage' },
  current_gpa: { min: 0, max: 10, name: 'Current GPA' },
  failed_subjects: { min: 0, max: 20, name: 'Failed Subjects' },
  backlogs: { min: 0, max: 20, name: 'Backlogs' },
  assignment_completion_percentage: { min: 0, max: 100, name: 'Assignment Completion' },
  internal_assessment_marks: { min: 0, max: 100, name: 'Internal Assessment Marks' },
  exam_score: { min: 0, max: 100, name: 'Exam Score' },
  lms_activity_score: { min: 0, max: 100, name: 'LMS Activity Score' },
  fee_pending: { min: 0, max: 1, name: 'Fee Pending' },
  counseling_sessions: { min: 0, max: 20, name: 'Counseling Sessions' }
};

// Helper function to validate all 11 features
const validateFields = (body) => {
  const errors = [];
  const missingFields = [];

  // Check for missing fields
  for (const field of REQUIRED_FIELDS) {
    const value = body[field];
    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Check field validations
  for (const field of REQUIRED_FIELDS) {
    const value = body[field];
    if (value !== undefined && value !== null && value !== '') {
      const validation = FIELD_VALIDATIONS[field];
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < validation.min || numValue > validation.max) {
        errors.push(`${validation.name} must be between ${validation.min} and ${validation.max}`);
      }
    }
  }

  return errors;
};

// Helper function to build ML payload
const buildMLPayload = (body) => {
  return {
    age: parseInt(body.age),
    attendance_percentage: parseFloat(body.attendance_percentage),
    current_gpa: parseFloat(body.current_gpa),
    failed_subjects: parseInt(body.failed_subjects) || 0,
    backlogs: parseInt(body.backlogs) || 0,
    assignment_completion_percentage: parseFloat(body.assignment_completion_percentage),
    internal_assessment_marks: parseFloat(body.internal_assessment_marks),
    exam_score: parseFloat(body.exam_score),
    lms_activity_score: parseFloat(body.lms_activity_score),
    fee_pending: parseInt(body.fee_pending) || 0,
    counseling_sessions: parseInt(body.counseling_sessions) || 0
  };
};

// @desc    Predict student dropout risk (with ALL 11 features)
// @route   POST /api/predict
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('=' .repeat(60));
    console.log('[NODE BACKEND] Prediction request received');
    console.log('=' .repeat(60));
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Validate all 11 features
    const validationErrors = validateFields(req.body);
    if (validationErrors.length > 0) {
      console.log('[ERROR] Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: validationErrors.join('; '),
        errors: validationErrors
      });
    }

    // Check if ML service is healthy first
    try {
      await axios.get(`${ML_SERVICE_URL}/api/health`, { timeout: 3000 });
    } catch (healthError) {
      console.error('[ERROR] ML Service health check failed:', healthError.message);
      return res.status(503).json({
        success: false,
        message: 'ML Service is not available. Please ensure ML service is running on port 8000.',
        error: healthError.message
      });
    }

    // Build payload for ML service
    const mlPayload = buildMLPayload(req.body);
    console.log('[NODE BACKEND] Sending to ML Service:', JSON.stringify(mlPayload, null, 2));

    // Call ML service
    const response = await axios.post(`${ML_SERVICE_URL}/api/predict`, mlPayload, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[NODE BACKEND] ML Service response status:', response.status);
    console.log('[NODE BACKEND] ML Service response data:', JSON.stringify(response.data, null, 2));

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('[ERROR] Prediction error:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('[ERROR] ML Service response:', error.response.data);
      return res.status(error.response.status || 400).json({
        success: false,
        message: error.response.data.detail || error.response.data.message || 'Prediction failed',
        error: error.response.data
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'ML Service is not running. Please start the ML service on port 8000.',
        error: 'Connection refused'
      });
    }
    
    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        success: false,
        message: 'ML Service timeout. Please check if the service is responding.',
        error: 'Timeout'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to get prediction',
      error: error.message
    });
  }
});

// @desc    Batch predict students (with ALL 11 features)
// @route   POST /api/predict/batch
// @access  Private
router.post('/batch', authMiddleware, async (req, res) => {
  try {
    const { students } = req.body;

    console.log('=' .repeat(60));
    console.log('[NODE BACKEND] Batch prediction request received');
    console.log('=' .repeat(60));
    console.log(`Total students: ${students?.length || 0}`);

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

    // Validate each student has ALL 11 features
    let hasErrors = false;
    const errorDetails = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const validationErrors = validateFields(student);
      if (validationErrors.length > 0) {
        hasErrors = true;
        errorDetails.push({
          index: i,
          student: student.name || `Student ${i + 1}`,
          errors: validationErrors
        });
      }
    }

    if (hasErrors) {
      console.log('[ERROR] Validation failed for some students:', JSON.stringify(errorDetails, null, 2));
      return res.status(400).json({
        success: false,
        message: 'Some students are missing required fields. All 11 features are required.',
        errors: errorDetails
      });
    }

    // Check if ML service is healthy
    try {
      await axios.get(`${ML_SERVICE_URL}/api/health`, { timeout: 3000 });
    } catch (healthError) {
      return res.status(503).json({
        success: false,
        message: 'ML Service is not available.',
        error: healthError.message
      });
    }

    // Build payload for ML service
    const mlStudents = students.map(student => buildMLPayload(student));
    console.log('[NODE BACKEND] Sending batch to ML Service:', JSON.stringify(mlStudents.slice(0, 3), null, 2));
    if (mlStudents.length > 3) {
      console.log(`[NODE BACKEND] ... and ${mlStudents.length - 3} more students`);
    }

    const response = await axios.post(`${ML_SERVICE_URL}/api/predict-batch`, {
      students: mlStudents
    }, {
      timeout: 30000 // 30 seconds for batch
    });

    console.log('[NODE BACKEND] Batch prediction complete');

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('[ERROR] Batch prediction error:', error.message);
    
    if (error.response) {
      console.error('[ERROR] ML Service response:', error.response.data);
      return res.status(error.response.status || 400).json({
        success: false,
        message: error.response.data.detail || error.response.data.message || 'Batch prediction failed',
        error: error.response.data
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'ML Service is not running. Please start the ML service on port 8000.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to get batch predictions',
      error: error.message
    });
  }
});

// @desc    Get model info
// @route   GET /api/predict/model-info
// @access  Private
router.get('/model-info', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/api/model-info`);
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('[ERROR] Model info error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get model info',
      error: error.message
    });
  }
});

// @desc    Get expected features
// @route   GET /api/predict/features
// @access  Private
router.get('/features', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/api/features`);
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('[ERROR] Features error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get features',
      error: error.message
    });
  }
});

// @desc    Get model health
// @route   GET /api/predict/health
// @access  Public (for monitoring)
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/api/health`, { timeout: 3000 });
    res.json({
      success: true,
      ml_service: response.data,
      node_service: 'healthy'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'ML Service is not available',
      error: error.message,
      node_service: 'healthy'
    });
  }
});

// @desc    Upload dataset for training
// @route   POST /api/predict/upload-dataset
// @access  Private
router.post('/upload-dataset', authMiddleware, async (req, res) => {
  try {
    // This endpoint requires multipart/form-data, so we need to handle file upload
    // You'll need multer or similar middleware for file uploads
    
    // For now, forward to ML service
    const response = await axios.post(`${ML_SERVICE_URL}/api/upload-dataset`, req.body, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('[ERROR] Upload error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upload dataset',
      error: error.message
    });
  }
});

// @desc    Train model
// @route   POST /api/predict/train
// @access  Private
router.post('/train', authMiddleware, async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/api/train`, {}, {
      timeout: 300000 // 5 minutes for training
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('[ERROR] Training error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data.detail || 'Training failed',
        error: error.response.data
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to train model',
      error: error.message
    });
  }
});

// @desc    Get training history
// @route   GET /api/predict/training-history
// @access  Private
router.get('/training-history', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/api/training-history`);
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('[ERROR] Training history error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get training history',
      error: error.message
    });
  }
});

module.exports = router;