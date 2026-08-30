const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',

    // ADD YOUR DEPLOYED FRONTEND URL HERE
    // 'https://your-frontend.vercel.app'
    'https://studentaifrontend-green.vercel.app',
    'https://studentaiadmin-three.vercel.app',
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
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const studentActivityRoutes = require('./routes/studentActivityRoutes');
const predictionRoutes = require('./routes/predictionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/student-activities', studentActivityRoutes);
app.use('/api/predict', predictionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running'
  });
});

// Error handler
app.use(errorHandler);

// IMPORTANT:
// Do NOT use app.listen() for the Vercel version.
// Export the Express app instead.
module.exports = app;