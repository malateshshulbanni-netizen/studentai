import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';

// Super Admin Imports
import SuperAdminLayout from './superadmin/layout/SuperAdminLayout';
import Dashboard from './superadmin/pages/Dashboard';
import Institutions from './superadmin/pages/Institutions';
import Users from './superadmin/pages/Users';
import MLModels from './superadmin/pages/MLModels';
import Analytics from './superadmin/pages/Analytics';
import AuditLogs from './superadmin/pages/AuditLogs';

// Student Imports
import StudentLayout from './student/layouts/StudentLayout';
import StudentDashboard from './student/pages/Dashboard';

// Super Admin Protected Route Component
const SuperAdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Student Protected Route Component
const StudentProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || user.role !== 'STUDENT') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <>
            <Navbar />
            <Homepage />
          </>
        } />

        {/* Super Admin Routes */}
        <Route path="/super-admin" element={
          <SuperAdminProtectedRoute>
            <SuperAdminLayout />
          </SuperAdminProtectedRoute>
        }>
          <Route index element={<Navigate to="/super-admin/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="institutions" element={<Institutions />} />
          <Route path="users" element={<Users />} />
          <Route path="models" element={<MLModels />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={
          <StudentProtectedRoute>
            <StudentLayout />
          </StudentProtectedRoute>
        }>
          <Route index element={<Navigate to="/student/dashboard" />} />
          <Route path="dashboard" element={<StudentDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;