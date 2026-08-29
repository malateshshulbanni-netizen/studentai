const axios = require('axios');

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// @desc    Predict student dropout risk
// @route   POST /api/predict
// @access  Private
const predictDropout = async (req, res) => {
  try {
    const { attendance, gpa, backlogs, assignment_completion, engagement } = req.body;

    // Validate input
    if (!attendance || !gpa || backlogs === undefined || !assignment_completion || !engagement) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Call ML service
    const response = await axios.post(`${ML_SERVICE_URL}/api/predict`, {
      attendance,
      gpa,
      backlogs,
      assignment_completion,
      engagement
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prediction',
      error: error.message
    });
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

    // Call ML service
    const response = await axios.post(`${ML_SERVICE_URL}/api/predict-batch`, {
      students
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Batch prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get batch predictions',
      error: error.message
    });
  }
};

module.exports = {
  predictDropout,
  predictBatchDropout
};