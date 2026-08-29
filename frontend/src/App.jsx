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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || user.role !== 'SUPER_ADMIN') {
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
          <ProtectedRoute>
            <SuperAdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/super-admin/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="institutions" element={<Institutions />} />
          <Route path="users" element={<Users />} />
          <Route path="models" element={<MLModels />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;