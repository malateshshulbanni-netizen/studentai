const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// @desc    Predict student dropout risk
// @route   POST /api/predict
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { attendance, gpa, backlogs, assignment_completion, engagement } = req.body;

    console.log('📊 Prediction request:', { attendance, gpa, backlogs, assignment_completion, engagement });

    if (attendance === undefined || gpa === undefined || backlogs === undefined || 
        assignment_completion === undefined || !engagement) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if ML service is healthy first
    try {
      await axios.get(`${ML_SERVICE_URL}/api/health`, { timeout: 3000 });
    } catch (healthError) {
      console.error('❌ ML Service health check failed:', healthError.message);
      return res.status(503).json({
        success: false,
        message: 'ML Service is not available. Please ensure ML service is running on port 8000.',
        error: healthError.message
      });
    }

    const response = await axios.post(`${ML_SERVICE_URL}/api/predict`, {
      attendance: parseFloat(attendance),
      gpa: parseFloat(gpa),
      backlogs: parseInt(backlogs),
      assignment_completion: parseFloat(assignment_completion),
      engagement
    }, {
      timeout: 10000
    });

    console.log('✅ Prediction successful:', response.data);

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('❌ Prediction error:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response data:', error.response.data);
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.detail || 'Prediction failed',
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

// @desc    Batch predict
// @route   POST /api/predict/batch
// @access  Private
router.post('/batch', authMiddleware, async (req, res) => {
  try {
    const { students } = req.body;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({
        success: false,
        message: 'Students array is required'
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

    const response = await axios.post(`${ML_SERVICE_URL}/api/predict-batch`, {
      students: students.map(s => ({
        attendance: parseFloat(s.attendance),
        gpa: parseFloat(s.gpa),
        backlogs: parseInt(s.backlogs),
        assignment_completion: parseFloat(s.assignment_completion),
        engagement: s.engagement
      }))
    }, {
      timeout: 15000
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Batch prediction error:', error);
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.detail || 'Batch prediction failed',
        error: error.response.data
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to get batch predictions',
      error: error.message
    });
  }
});

module.exports = router;