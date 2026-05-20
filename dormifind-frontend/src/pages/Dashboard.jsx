import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { 
  FaBuilding, FaUsers, FaMoneyBillWave, FaClipboardList, 
  FaBook, FaBell, FaPlus, FaEye, FaChartLine,
  FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaStar
} from 'react-icons/fa';
function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect admin to admin panel
  useEffect(() => {
    if (user?.user_type === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const API_URL = 'http://localhost/backend/api';

  const fetchDashboardData = useCallback(async () => {
    // Huwag mag-fetch kung admin (para iwas error)
    if (user?.user_type === 'admin') return;

    try {
      if (user?.user_type === 'owner') {
        const response = await axios.get(`${API_URL}/dormitories/get_by_owner.php`, {
          withCredentials: true
        });
        setStats(response.data.data || []);
      } else if (user?.user_type === 'tenant') {
        const response = await axios.get(`${API_URL}/bookings/get_tenant_bookings.php`, {
          withCredentials: true
        });
        setRecentBookings(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  // Auto‑refresh every 2 seconds (kung hindi admin)
  useAutoRefresh(fetchDashboardData, 65000);

  // Initial load (optional na, kasi tatawag din ang auto-refresh agad)
  // Pero tawagin natin para mag-load agad bago ang unang interval
  useEffect(() => {
    if (user && user.user_type !== 'admin') {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  // Huwag mag-render ng dashboard kung admin (habang nagre-redirect)
  if (user?.user_type === 'admin') {
    return <LoadingSpinner />;
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}!</h1>
        <p>You are logged in as <strong>{user?.user_type === 'tenant' ? 'Tenant' : 'Owner'}</strong></p>
      </div>

      {user?.user_type === 'tenant' ? (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <FaBook className="stat-icon" />
              <h3>Total Bookings</h3>
              <p className="stat-number">{recentBookings.length}</p>
            </div>
            <div className="stat-card">
              <FaClipboardList className="stat-icon" />
              <h3>Active Bookings</h3>
              <p className="stat-number">
                {recentBookings.filter(b => b.status === 'accepted').length}
              </p>
            </div>
            <div className="stat-card">
              <FaMoneyBillWave className="stat-icon" />
              <h3>Pending Payment</h3>
              <p className="stat-number">
                {recentBookings.filter(b => b.status === 'accepted' && b.is_overdue).length}
              </p>
              <Link to="/my-payments" className="stat-link">Pay Now →</Link>
            </div>
          </div>
       <div className="recent-section">
  <h2>Recent Bookings</h2>
  
  {/* Active Booking - Highlighted */}
  {recentBookings.filter(b => b.status === 'accepted').length > 0 && (
    <div className="active-booking-section">
      <h3><FaStar className="section-icon" /> Current Active Booking</h3>
      {recentBookings.filter(b => b.status === 'accepted').slice(0, 1).map(booking => (
        <div key={booking.id} className="active-booking-card">
          <div className="active-badge">ACTIVE</div>
          <div className="active-booking-info">
            <div className="dorm-name">{booking.dormitory_name} - Room {booking.room_number}</div>
            <div className="owner-details">
              <div className="detail-row">
                <FaUser className="detail-icon" />
                <span className="detail-label">Owner:</span>
                <span className="detail-value">{booking.owner_name || 'Not available'}</span>
              </div>
              <div className="detail-row">
                <FaEnvelope className="detail-icon" />
                <span className="detail-label">Email:</span>
                <span className="detail-value">{booking.owner_email || 'Not available'}</span>
              </div>
              {booking.owner_phone && (
                <div className="detail-row">
                  <FaPhone className="detail-icon" />
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{booking.owner_phone}</span>
                </div>
              )}
              <div className="detail-row">
                <FaCalendarAlt className="detail-icon" />
                <span className="detail-label">Move in:</span>
                <span className="detail-value">{booking.move_in_date}</span>
              </div>
            </div>
          </div>
          <Link to={`/my-bookings`} className="view-link">View All Bookings →</Link>
        </div>
      ))}
    </div>
  )}

  {/* All Recent Bookings */}
  <h3>All Bookings</h3>
  {recentBookings.length === 0 ? (
    <p>No bookings yet. <Link to="/dormitories">Browse Dormitories</Link></p>
  ) : (
    <div className="recent-list">
      {recentBookings.slice(0, 5).map(booking => (
        <div key={booking.id} className={`recent-item ${booking.status === 'accepted' ? 'is-active' : ''}`}>
          <div style={{ flex: 1 }}>
            <strong>{booking.dormitory_name}</strong> - Room {booking.room_number}
            <div style={{ fontSize: '13px', color: '#475569', marginTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <FaUser size={12} color="#64748b" />
                <span>Owner:</span>
                <span>{booking.owner_name || 'Not available'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaCalendarAlt size={12} color="#64748b" />
                <span>Move in:</span>
                <span>{booking.move_in_date}</span>
              </div>
            </div>
          </div>
          <span className={`status-badge ${booking.status}`}>{booking.status}</span>
        </div>
      ))}
    </div>
  )}
</div>
        
        </>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <FaBuilding className="stat-icon" />
              <h3>My Dormitories</h3>
              <p className="stat-number">{stats?.length || 0}</p>
              <Link to="/my-dormitories" className="stat-link">Manage →</Link>
            </div>
            <div className="stat-card">
              <FaUsers className="stat-icon" />
              <h3>Total Rooms</h3>
              <p className="stat-number">
                {stats?.reduce((sum, d) => sum + (parseInt(d.total_rooms) || 0), 0) || 0}
              </p>
            </div>
            <div className="stat-card">
              <FaBell className="stat-icon" />
              <h3>Pending Bookings</h3>
              <p className="stat-number">
                {stats?.reduce((sum, d) => sum + (parseInt(d.pending_bookings) || 0), 0) || 0}
              </p>
              <Link to="/owner-bookings" className="stat-link">Review →</Link>
            </div>
          </div>
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <Link to="/my-dormitories" className="action-btn">
                <FaPlus /> Add New Dormitory
              </Link>
              <Link to="/owner-bookings" className="action-btn">
                <FaEye /> View Booking Requests
              </Link>
              <Link to="/owner-payments" className="action-btn">
                <FaChartLine /> Track Payments
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;