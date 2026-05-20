import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { FaTachometerAlt, FaSearch, FaBook, FaMoneyBillWave, FaUser, FaBell, FaSignOutAlt, FaBuilding, FaClipboardList, FaCreditCard, FaUsers } from 'react-icons/fa';

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const API_URL = 'http://localhost/backend/api';

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      const handleRefresh = () => fetchUnreadCount();
      window.addEventListener('refreshUnreadCount', handleRefresh);
      return () => {
        clearInterval(interval);
        window.removeEventListener('refreshUnreadCount', handleRefresh);
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/get_unread_count.php`, { withCredentials: true });
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
      <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo" onClick={closeMobile}>
            {collapsed ? (
              <img src="/logo-removebg-preview.png" alt="DormiFind" className="sidebar-logo-img collapsed" />
            ) : (
              <img src="/logo-removebg-preview.png" alt="DormiFind" className="sidebar-logo-img" />
            )}
          </Link>
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '→' : '←'}
          </button>
        </div>
        <div className="sidebar-menu">
          {user ? (
            <>
              {/* Admin Menu - only for admin */}
              {user.user_type === 'admin' && (
                <Link to="/admin" className={`sidebar-item ${isActive('/admin')}`} onClick={closeMobile}>
                  <FaUsers className="sidebar-icon" />
                  {!collapsed && <span>Admin Panel</span>}
                </Link>
              )}

              {/* Dashboard - for all logged in users, but admin will be redirected to /admin */}
              <Link to="/dashboard" className={`sidebar-item ${isActive('/dashboard')}`} onClick={closeMobile}>
                <FaTachometerAlt className="sidebar-icon" />
                {!collapsed && <span>Dashboard</span>}
              </Link>

              {/* Tenant Menu - only for tenants */}
              {user.user_type === 'tenant' && (
                <>
                  <Link to="/dormitories" className={`sidebar-item ${isActive('/dormitories')}`} onClick={closeMobile}>
                    <FaSearch className="sidebar-icon" />
                    {!collapsed && <span>Find Dorms</span>}
                  </Link>
                  <Link to="/my-bookings" className={`sidebar-item ${isActive('/my-bookings')}`} onClick={closeMobile}>
                    <FaBook className="sidebar-icon" />
                    {!collapsed && <span>My Bookings</span>}
                  </Link>
                  <Link to="/my-payments" className={`sidebar-item ${isActive('/my-payments')}`} onClick={closeMobile}>
                    <FaMoneyBillWave className="sidebar-icon" />
                    {!collapsed && <span>Payments</span>}
                  </Link>
                </>
              )}

              {/* Owner Menu - only for owners */}
              {user.user_type === 'owner' && (
                <>
                  <Link to="/my-dormitories" className={`sidebar-item ${isActive('/my-dormitories')}`} onClick={closeMobile}>
                    <FaBuilding className="sidebar-icon" />
                    {!collapsed && <span>My Dormitories</span>}
                  </Link>
                  <Link to="/owner-bookings" className={`sidebar-item ${isActive('/owner-bookings')}`} onClick={closeMobile}>
                    <FaClipboardList className="sidebar-icon" />
                    {!collapsed && <span>Booking Requests</span>}
                  </Link>
                  <Link to="/owner-payments" className={`sidebar-item ${isActive('/owner-payments')}`} onClick={closeMobile}>
                    <FaCreditCard className="sidebar-icon" />
                    {!collapsed && <span>Payments</span>}
                  </Link>
                </>
              )}

              {/* Profile & Notifications - for all non-admin users (admin will see these too, but admin has separate menu) */}
              <Link to="/profile" className={`sidebar-item ${isActive('/profile')}`} onClick={closeMobile}>
                {user.profile_image ? (
                  <img src={`http://localhost/backend/${user.profile_image}`} alt="Profile" className="sidebar-avatar" />
                ) : (
                  <FaUser className="sidebar-icon" />
                )}
                {!collapsed && <span>Profile</span>}
              </Link>
              <Link to="/notifications" className={`sidebar-item ${isActive('/notifications')}`} onClick={closeMobile}>
                <FaBell className="sidebar-icon" />
                {!collapsed && <span>Notifications</span>}
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </Link>

              {/* Logout */}
              <button onClick={handleLogout} className="sidebar-item logout">
                <FaSignOutAlt className="sidebar-icon" />
                {!collapsed && <span>Logout</span>}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`sidebar-item ${isActive('/login')}`} onClick={closeMobile}>
                <FaSignOutAlt className="sidebar-icon" />
                {!collapsed && <span>Login</span>}
              </Link>
              <Link to="/register" className={`sidebar-item ${isActive('/register')}`} onClick={closeMobile}>
                <FaUser className="sidebar-icon" />
                {!collapsed && <span>Register</span>}
              </Link>
            </>
          )}
        </div>
      </div>
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)}></div>}
    </>
  );
}

export default Sidebar;