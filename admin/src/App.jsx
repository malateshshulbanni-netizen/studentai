import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage';

// ==================== ADMIN IMPORTS ====================
import AdminLayout from './admin/layout/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Students from './admin/pages/Students';
import Faculty from './admin/pages/Faculty';
import StudentData from './admin/pages/StudentData'; // Changed from Courses to StudentData
import Predict from './admin/pages/Predict';
import Analytics from './admin/pages/Analytics';
import Settings from './admin/pages/Settings';

// ==================== FACULTY IMPORTS ====================
import FacultyLayout from './faculty/layout/FacultyLayout';
import FacultyDashboard from './faculty/pages/Dashboard';
import MyStudents from './faculty/pages/MyStudents';
import Activities from './faculty/pages/Activities';
import Attendance from './faculty/pages/Attendance';

// ==================== PROTECTED ROUTE COMPONENT ====================
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* ==================== PUBLIC ROUTE ==================== */}
        <Route path="/" element={<Homepage />} />
        
        {/* ==================== ADMIN ROUTES ==================== */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="INSTITUTION_ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="faculty" element={<Faculty />} />
          <Route path="student-data" element={<StudentData />} /> {/* Changed from "courses" to "student-data" */}
          <Route path="predict" element={<Predict />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ==================== FACULTY ROUTES ==================== */}
        <Route path="/faculty" element={
          <ProtectedRoute requiredRole="FACULTY">
            <FacultyLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/faculty/dashboard" />} />
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route path="my-students" element={<MyStudents />} />
          <Route path="activities" element={<Activities />} />
          <Route path="attendance" element={<Attendance />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;