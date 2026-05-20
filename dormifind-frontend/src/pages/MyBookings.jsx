import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaBed, FaClock, FaExclamationTriangle, FaStar, FaCheckCircle } from 'react-icons/fa';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [dormitoryPrices, setDormitoryPrices] = useState({});
  const [dormitoryDetails, setDormitoryDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedTermsBooking, setSelectedTermsBooking] = useState(null);
  const [selectedTermsAmount, setSelectedTermsAmount] = useState(0);
  const [customTerms, setCustomTerms] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedFeedbackBookingId, setSelectedFeedbackBookingId] = useState(null);
  const [showMoveOutModal, setShowMoveOutModal] = useState(false);
  const [selectedMoveOutBooking, setSelectedMoveOutBooking] = useState(null);
  const [moveOutDate, setMoveOutDate] = useState('');
  const API_URL = 'http://localhost/backend/api';

  const fetchBookings = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/bookings/get_tenant_bookings.php`, {
        withCredentials: true
      });
      const bookingsData = response.data.data || [];
      setBookings(bookingsData);
      
      for (const booking of bookingsData) {
        if (booking.dormitory_id && !dormitoryPrices[booking.dormitory_id]) {
          const dormResponse = await axios.get(`${API_URL}/dormitories/get_by_id.php?id=${booking.dormitory_id}`);
          if (dormResponse.data.data) {
            setDormitoryPrices(prev => ({
              ...prev,
              [booking.dormitory_id]: dormResponse.data.data.price_per_month
            }));
            setDormitoryDetails(prev => ({
              ...prev,
              [booking.dormitory_id]: dormResponse.data.data
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching bookings', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, dormitoryPrices]);

  // Auto‑refresh every 2 seconds
  useAutoRefresh(fetchBookings, 15000);

  const cancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.post(`${API_URL}/bookings/cancel.php`, { booking_id: bookingId }, { withCredentials: true });
        await fetchBookings();
      } catch (error) {
        alert('Failed to cancel booking');
      }
    }
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) {
      alert('Please enter your feedback');
      return;
    }
    try {
      await axios.post(`${API_URL}/bookings/add_feedback.php`, {
        booking_id: selectedFeedbackBookingId,
        feedback: feedbackText
      }, { withCredentials: true });
      alert('Thank you for your feedback!');
      setShowFeedbackModal(false);
      setFeedbackText('');
      await fetchBookings();
    } catch (error) {
      alert('Failed to submit feedback');
    }
  };

  const openTermsModal = async (booking, amount) => {
    setSelectedTermsBooking(booking);
    setSelectedTermsAmount(amount);
    try {
      const res = await axios.get(`${API_URL}/dormitories/get_terms.php?dormitory_id=${booking.dormitory_id}`);
      let terms = res.data.terms;
      const deposit = dormitoryDetails[booking.dormitory_id]?.deposit_amount || 0;
      terms = terms.replace(/{deposit}/g, deposit.toLocaleString());
      terms = terms.replace(/{amount}/g, amount.toLocaleString());
      setCustomTerms(terms);
      setShowTermsModal(true);
    } catch (error) {
      console.error('Failed to fetch terms', error);
      setCustomTerms('Terms and conditions not available.');
      setShowTermsModal(true);
    }
  };

  const acceptTerms = async () => {
    try {
      await axios.post(`${API_URL}/bookings/update_status.php`, {
        booking_id: selectedTermsBooking.id,
        status: 'accepted',
        terms_accepted: true
      }, { withCredentials: true });
      setShowTermsModal(false);
      navigate(`/my-payments?booking_id=${selectedTermsBooking.id}&amount=${selectedTermsAmount}`);
    } catch (error) {
      console.error('Accept terms error:', error);
      alert('Failed to accept terms. Please try again.');
    }
  };

  const requestMoveOut = async () => {
    if (!moveOutDate) {
      alert('Please select a move-out date');
      return;
    }
    try {
      await axios.post(`${API_URL}/bookings/request_move_out.php`, {
        booking_id: selectedMoveOutBooking.id,
        move_out_date: moveOutDate
      }, { withCredentials: true });
      alert('Move-out request submitted! Owner will be notified.');
      setShowMoveOutModal(false);
      await fetchBookings();
    } catch (error) {
      alert('Failed to submit move-out request');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'status-pending',
      accepted: 'status-accepted',
      declined: 'status-declined',
      cancelled: 'status-cancelled',
      completed: 'status-completed'
    };
    return <span className={`status-badge ${badges[status]}`}>{status}</span>;
  };

  const calculateInitialPayment = (booking, price) => {
    const deposit = dormitoryDetails[booking.dormitory_id]?.deposit_amount || 0;
    return Number(price) + Number(deposit);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bookings-container">
      <div className="page-header">
        <h1>My Bookings</h1>
        <Link to="/dormitories" className="browse-btn">+ Browse More Dorms</Link>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any bookings yet.</p>
          <Link to="/dormitories" className="empty-btn">Find a Dormitory</Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => {
            const monthlyPrice = dormitoryPrices[booking.dormitory_id] || booking.price_per_month || 1000;
            const depositAmount = dormitoryDetails[booking.dormitory_id]?.deposit_amount || 0;
            const initialPayment = calculateInitialPayment(booking, monthlyPrice);
            
            return (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div>
                    <h3>{booking.dormitory_name}</h3>
                    <p className="room-number"><FaBed /> Room {booking.room_number}</p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
                
                <div className="booking-details">
                  <div className="detail-row">
                    <span className="detail-label"><FaMapMarkerAlt /> Location:</span>
                    <span className="detail-value">{booking.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label"><FaCalendarAlt /> Move-in Date:</span>
                    <span className="detail-value">{booking.move_in_date}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label"><FaMoneyBillWave /> Due Date:</span>
                    <span className="detail-value">{booking.due_date}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label"><FaMoneyBillWave /> Monthly Rent:</span>
                    <span className="detail-value">₱{Number(monthlyPrice).toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label"><FaMoneyBillWave /> Deposit:</span>
                    <span className="detail-value">₱{Number(depositAmount).toLocaleString()}</span>
                  </div>
                  {booking.days_left > 0 && (
                    <div className="detail-row">
                      <span className="detail-label"><FaClock /> Days Left:</span>
                      <span className={`detail-value ${booking.days_left <= 7 ? 'urgent' : ''}`}>
                        {booking.days_left} days
                      </span>
                    </div>
                  )}
                  {!!booking.is_overdue && (
                    <div className="overdue-warning">
                      <FaExclamationTriangle /> Payment is OVERDUE! Please pay immediately.
                    </div>
                  )}
                  {booking.status === 'declined' && booking.decline_reason && (
                    <div className="decline-reason">
                      <strong>Reason for decline:</strong> {booking.decline_reason}
                    </div>
                  )}
                  {booking.feedback && (
                    <div className="feedback-display">
                      <strong>Your feedback:</strong> "{booking.feedback}"
                    </div>
                  )}
                  {!!booking.terms_accepted && (
                    <div className="terms-accepted">
                      <FaCheckCircle /> Terms accepted on {new Date(booking.terms_accepted_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="booking-actions">
                  {booking.status === 'pending' && (
                    <button onClick={() => cancelBooking(booking.id)} className="cancel-btn">
                      Cancel Request
                    </button>
                  )}
                  {booking.status === 'accepted' && !booking.terms_accepted && (
                    <button onClick={() => openTermsModal(booking, monthlyPrice)} className="pay-btn">
                      <FaMoneyBillWave /> Review Terms & Pay (₱{initialPayment.toLocaleString()})
                    </button>
                  )}
                  {booking.status === 'accepted' && !!booking.terms_accepted && (
                    <Link to={`/my-payments?booking_id=${booking.id}&amount=${monthlyPrice}`} className="pay-btn">
                      <FaMoneyBillWave /> Make Payment
                    </Link>
                  )}
                  {booking.status === 'accepted' && (
                    <button onClick={() => { setSelectedMoveOutBooking(booking); setShowMoveOutModal(true); }} className="moveout-btn">
                      📅 Request Move-Out
                    </button>
                  )}
                  {booking.status === 'completed' && !booking.feedback && (
                    <button onClick={() => { setSelectedFeedbackBookingId(booking.id); setShowFeedbackModal(true); }} className="feedback-btn">
                      <FaStar /> Leave Feedback
                    </button>
                  )}
                  {booking.status === 'completed' && booking.feedback && (
                    <span className="feedback-done">✓ Feedback submitted</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals (unchanged) */}
      {showTermsModal && selectedTermsBooking && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="modal-container terms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Terms & Conditions</h3>
              <button className="modal-close" onClick={() => setShowTermsModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="terms-content" style={{ whiteSpace: 'pre-line' }}>
                {customTerms}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={acceptTerms} className="accept-terms-btn">Accept & Proceed to Payment</button>
              <button onClick={() => setShowTermsModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Leave Feedback</h3>
              <button className="modal-close" onClick={() => setShowFeedbackModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Please share your experience with this dormitory:</p>
              <textarea
                className="feedback-textarea"
                rows="5"
                placeholder="Write your feedback here..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button onClick={submitFeedback}>Submit Feedback</button>
              <button onClick={() => setShowFeedbackModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showMoveOutModal && selectedMoveOutBooking && (
        <div className="modal-overlay" onClick={() => setShowMoveOutModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Move-Out</h3>
              <button className="modal-close" onClick={() => setShowMoveOutModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Please select your desired move-out date (minimum 30 days from today):</p>
              <input
                type="date"
                className="moveout-date-input"
                min={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                value={moveOutDate}
                onChange={(e) => setMoveOutDate(e.target.value)}
              />
              <p><small>Note: Your deposit will be applied to your last month's rent.</small></p>
            </div>
            <div className="modal-footer">
              <button onClick={requestMoveOut} className="submit-moveout-btn">Submit Request</button>
              <button onClick={() => setShowMoveOutModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;