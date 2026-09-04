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
const counselorRoutes = require('./routes/counselorRoutes');

// ✅ ADD MEETING ROUTES
const meetingRoutes = require('./routes/meetingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/student-activities', studentActivityRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/counselor', counselorRoutes);

// ✅ ADD MEETINGS ROUTE
app.use('/api/meetings', meetingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running'
  });
});

// Error handler
app.use(errorHandler);

// =====================================================
// LOCAL + VERCEL SUPPORT
// =====================================================

// When running locally, start the Express server.
// When running on Vercel, Vercel will use the exported app.
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

// Export Express app for Vercel
module.exports = app;