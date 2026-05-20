import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Dormitories from './pages/Dormitories';
import DormitoryDetail from './pages/DormitoryDetail';
import MyBookings from './pages/MyBookings';
import MyPayments from './pages/MyPayments';
import OwnerDormitories from './pages/OwnerDormitories';
import OwnerBookings from './pages/OwnerBookings';
import OwnerPayments from './pages/OwnerPayments';
import Profile from './pages/Profile';
import Ratings from './pages/Ratings';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import ApplyDormitory from './pages/ApplyDormitory';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || 
                     location.pathname === '/register' || 
                     location.pathname === '/forgot-password' || 
                     location.pathname === '/reset-password';

  return (
    <div className="app-layout">
      {!isAuthPage && <Sidebar />}
      <main className={`main-content ${isAuthPage ? 'auth-layout' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dormitories" element={<PrivateRoute><Dormitories /></PrivateRoute>} />
          <Route path="/dormitory/:id" element={<PrivateRoute><DormitoryDetail /></PrivateRoute>} />
          <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
          <Route path="/my-payments" element={<PrivateRoute><MyPayments /></PrivateRoute>} />
          <Route path="/my-dormitories" element={<PrivateRoute><OwnerDormitories /></PrivateRoute>} />
          <Route path="/owner-bookings" element={<PrivateRoute><OwnerBookings /></PrivateRoute>} />
          <Route path="/owner-payments" element={<PrivateRoute><OwnerPayments /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/ratings/:dormitory_id" element={<PrivateRoute><Ratings /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/apply-dormitory" element={<PrivateRoute><ApplyDormitory /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 