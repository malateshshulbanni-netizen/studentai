const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// CORS configuration - Allow all frontend ports
app.use(cors({
  origin: [
    'http://localhost:5173',  // Main frontend
    'http://localhost:5174',  // Admin frontend
    'http://localhost:3000',  // Alternative
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const institutionRoutes = require('./routes/institutionRoutes');
const studentRoutes = require('./routes/studentRoutes');  // ← ADD THIS
const facultyRoutes = require('./routes/facultyRoutes'); // ← ADD THIS
const studentActivityRoutes = require('./routes/studentActivityRoutes');

// API routes - must be defined BEFORE any other routes
app.use('/api/auth', authRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/students', studentRoutes);  // ← ADD THIS
app.use('/api/faculty', facultyRoutes); // ← ADD THIS
app.use('/api/student-activities', studentActivityRoutes);

// Add this with other routes
const predictionRoutes = require('./routes/predictionRoutes');
app.use('/api/predict', predictionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handler middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});