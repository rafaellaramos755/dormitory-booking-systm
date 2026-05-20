import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { FaBuilding, FaBed, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaClock, FaFilter, FaComment } from 'react-icons/fa';

function OwnerBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const API_URL = 'http://localhost/backend/api';

  const fetchBookings = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/bookings/get_owner_bookings.php`, {
        withCredentials: true
      });
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bookings', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Auto-refresh every 2 seconds (2000 ms)
  useAutoRefresh(fetchBookings, 15000);

  const updateStatus = async (bookingId, status, reason = null) => {
    try {
      const payload = { booking_id: bookingId, status: status };
      if (reason) payload.decline_reason = reason;
      await axios.post(`${API_URL}/bookings/update_status.php`, payload, { withCredentials: true });
      await fetchBookings(); // immediate refresh after action
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const approveMoveOut = async (bookingId) => {
    try {
      await axios.post(`${API_URL}/bookings/approve_move_out.php`, { booking_id: bookingId }, { withCredentials: true });
      await fetchBookings();
      alert('Move-out approved!');
    } catch (error) {
      alert('Failed to approve move-out');
    }
  };

  const openDeclineModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setDeclineReason('');
    setShowDeclineModal(true);
  };

  const confirmDecline = async () => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }
    await updateStatus(selectedBookingId, 'declined', declineReason);
    setShowDeclineModal(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'status-pending',
      accepted: 'status-accepted',
      declined: 'status-declined',
      cancelled: 'status-cancelled',
      completed: 'status-completed'
    };
    const icons = {
      pending: <FaClock />,
      accepted: <FaCheckCircle />,
      declined: <FaTimesCircle />,
      cancelled: <FaTimesCircle />,
      completed: <FaCheckCircle />
    };
    return (
      <span className={`status-badge ${badges[status]}`}>
        {icons[status]} {status}
      </span>
    );
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="owner-container">
      <div className="page-header">
        <h1><FaBuilding /> Booking Requests</h1>
        <button onClick={() => window.open(`${API_URL}/owner/export_bookings.php`, '_blank')} className="export-btn">
          📊 Export to Excel
        </button>
      </div>

      <div className="filter-tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          <FaFilter /> All
        </button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>
          <FaClock /> Pending
        </button>
        <button className={filter === 'accepted' ? 'active' : ''} onClick={() => setFilter('accepted')}>
          <FaCheckCircle /> Accepted
        </button>
        <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>
          <FaCheckCircle /> Completed
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div>
                  <h3><FaBuilding /> {booking.dormitory_name}</h3>
                  <p className="room-number"><FaBed /> Room {booking.room_number}</p>
                </div>
                {getStatusBadge(booking.status)}
              </div>
              
              <div className="booking-details">
                <div className="detail-row">
                  <span className="detail-label"><FaUser /> Tenant:</span>
                  <span className="detail-value">{booking.tenant_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><FaEnvelope /> Email:</span>
                  <span className="detail-value">{booking.tenant_email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><FaPhone /> Phone:</span>
                  <span className="detail-value">{booking.tenant_phone || 'Not provided'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><FaCalendarAlt /> Move-in:</span>
                  <span className="detail-value">{booking.move_in_date}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><FaMoneyBillWave /> Due Date:</span>
                  <span className="detail-value">{booking.due_date}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><FaMoneyBillWave /> Payments Made:</span>
                  <span className="detail-value">{booking.payments_made || 0}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><FaMoneyBillWave /> Total Paid:</span>
                  <span className="detail-value">₱{Number(booking.total_paid || 0).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><FaCheckCircle /> Terms Accepted:</span>
                  <span className="detail-value">{booking.terms_accepted ? 'Yes' : 'No'}</span>
                </div>
                {booking.status === 'declined' && booking.decline_reason && (
                  <div className="decline-reason-box">
                    <strong><FaComment /> Decline Reason:</strong> {booking.decline_reason}
                  </div>
                )}
                {booking.feedback && (
                  <div className="feedback-box">
                    <strong>Tenant Feedback:</strong> "{booking.feedback}"
                  </div>
                )}
                {booking.move_out_requested == 1 && (
                  <div className="move-out-notice">
                    <strong>📅 Move-Out Requested:</strong> {booking.move_out_date}
                    <br />
                    <small>Tenant has requested to move out on this date. Deposit will be applied to last month's rent.</small>
                  </div>
                )}
                {booking.move_out_requested == 1 && booking.move_out_status !== 'approved' && (
                  <div className="move-out-actions">
                    <button onClick={() => approveMoveOut(booking.id)} className="approve-moveout-btn">
                      ✓ Approve Move-Out
                    </button>
                  </div>
                )}
                {booking.move_out_status === 'approved' && (
                  <div className="move-out-approved">✓ Move-out approved for {booking.move_out_date}</div>
                )}
              </div>

              {booking.status === 'pending' && (
                <div className="booking-actions">
                  <button onClick={() => updateStatus(booking.id, 'accepted')} className="accept-btn">
                    <FaCheckCircle /> Accept
                  </button>
                  <button onClick={() => openDeclineModal(booking.id)} className="decline-btn">
                    <FaTimesCircle /> Decline
                  </button>
                </div>
              )}
              
              {booking.status === 'accepted' && (
                <div className="booking-actions">
                  <button onClick={() => updateStatus(booking.id, 'completed')} className="complete-btn">
                    <FaCheckCircle /> Mark as Completed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decline Reason Modal */}
      {showDeclineModal && (
        <div className="modal-overlay" onClick={() => setShowDeclineModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Decline Booking</h3>
              <button className="modal-close" onClick={() => setShowDeclineModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Please provide a reason for declining this booking:</p>
              <textarea
                className="decline-reason-textarea"
                rows="4"
                placeholder="e.g., Room no longer available, Tenant requirements not met, etc."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button onClick={confirmDecline} className="confirm-decline-btn">Confirm Decline</button>
              <button onClick={() => setShowDeclineModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerBookings;