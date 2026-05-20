import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { FaMoneyBillWave, FaCalendarAlt, FaFileImage, FaCheckCircle, FaClock, FaBed, FaQrcode, FaUpload, FaCheck, FaTimes } from 'react-icons/fa';

function MyPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrFile, setQrFile] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [summary, setSummary] = useState({ total_paid: 0, total_pending: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastPayment, setLastPayment] = useState(null);
  
  const [bookingToPay, setBookingToPay] = useState(null);
  
  const API_URL = 'http://localhost/backend/api';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const paymentsRes = await axios.get(`${API_URL}/payments/get_tenant_payments.php`, {
        withCredentials: true
      });
      const allPayments = paymentsRes.data.data || [];
      setPayments(allPayments);
      setSummary(paymentsRes.data.summary || { total_paid: 0, total_pending: 0 });

      const bookingsRes = await axios.get(`${API_URL}/bookings/get_tenant_bookings.php`, {
        withCredentials: true
      });
      const allBookings = bookingsRes.data.data || [];
      
      const paidBookingIds = allPayments
        .filter(p => p.payment_type === 'initial')
        .map(p => p.booking_id);
      
      const needPayment = allBookings.find(b => 
        b.status === 'accepted' && !paidBookingIds.includes(b.id)
      );
      
      setBookingToPay(needPayment || null);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

 // useAutoRefresh(fetchData, 30000);
  
  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    setQrFile(e.target.files[0]);
    setMessage('');
    setMessageType('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!qrFile) {
      setMessage('Please select a payment screenshot.');
      setMessageType('error');
      return;
    }
    
    if (!bookingToPay) {
      setMessage('No pending payment found.');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setMessageType('');

    const totalAmount = (bookingToPay.price_per_month || 0) + (bookingToPay.deposit_amount || 0);
    
    const formData = new FormData();
    formData.append('booking_id', bookingToPay.id);
    formData.append('amount', totalAmount);
    formData.append('payment_type', 'initial');
    formData.append('payment_month', new Date().toISOString().split('T')[0]);
    formData.append('qr_image', qrFile);

    try {
      const response = await axios.post(`${API_URL}/payments/upload_qr.php`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        // I-save ang payment details para sa receipt
        setLastPayment({
          amount: totalAmount,
          dormitory_name: bookingToPay.dormitory_name,
          room_number: bookingToPay.room_number,
          date: new Date().toLocaleDateString(),
          reference_id: 'PAY-' + Date.now()
        });
        
        setShowSuccessModal(true);
        setQrFile(null);
        document.getElementById('qrInput').value = '';
        
        setTimeout(() => {
          fetchData();
          setIsSubmitting(false);
        }, 2000);
      } else {
        setMessage(response.data.message);
        setMessageType('error');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Upload failed. Please try again.');
      setMessageType('error');
      setIsSubmitting(false);
    }
  };

  const openReceipt = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'status-pending',
      verified: 'status-verified',
      failed: 'status-declined'
    };
    const icons = {
      pending: <FaClock />,
      verified: <FaCheckCircle />,
      failed: <FaTimes />
    };
    return (
      <span className={`status-badge ${badges[status]}`}>
        {icons[status]} {status}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  const totalAmount = bookingToPay ? (bookingToPay.price_per_month || 0) + (bookingToPay.deposit_amount || 0) : 0;

  return (
    <div className="payments-container">
      <div className="page-header">
        <h1>My Payments</h1>
      </div>

      {/* Summary Cards */}
      <div className="payment-summary">
        <div className="summary-card verified">
          <h3><FaCheckCircle /> Total Paid</h3>
          <p className="summary-amount">₱{Number(summary.total_paid).toLocaleString()}</p>
        </div>
        <div className="summary-card pending">
          <h3><FaClock /> Pending</h3>
          <p className="summary-amount">₱{Number(summary.total_pending).toLocaleString()}</p>
        </div>
      </div>

      {/* SUCCESS RECEIPT MODAL - ITO ANG LALABAS PAG NAG-SUBMIT */}
      {showSuccessModal && lastPayment && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="receipt-modal" onClick={e => e.stopPropagation()}>
            <div className="receipt-header">
              <FaCheckCircle className="receipt-icon" />
              <h2>Payment Submitted!</h2>
              <p>Your payment has been sent to the owner for verification</p>
            </div>
            <div className="receipt-body">
              <div className="receipt-row">
                <span>Reference ID:</span>
                <strong>{lastPayment.reference_id}</strong>
              </div>
              <div className="receipt-row">
                <span>Dormitory:</span>
                <strong>{lastPayment.dormitory_name}</strong>
              </div>
              <div className="receipt-row">
                <span>Room:</span>
                <strong>{lastPayment.room_number}</strong>
              </div>
              <div className="receipt-row">
                <span>Amount:</span>
                <strong>₱{Number(lastPayment.amount).toLocaleString()}</strong>
              </div>
              <div className="receipt-row">
                <span>Date:</span>
                <strong>{lastPayment.date}</strong>
              </div>
              <div className="receipt-status">
                <span className="status-badge pending">Pending Verification</span>
              </div>
              <div className="receipt-note">
                <small>You will be notified once the owner verifies your payment.</small>
              </div>
            </div>
            <div className="receipt-footer">
              <button onClick={() => setShowSuccessModal(false)} className="close-receipt-btn">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT FORM */}
      {bookingToPay && !showSuccessModal ? (
        <div className="payment-form-card">
          <h3>Move-in Payment Required</h3>
          <p>You have an approved booking at <strong>{bookingToPay.dormitory_name}</strong> - Room {bookingToPay.room_number}</p>
          
          {bookingToPay.qr_code_url && (
            <div className="owner-qr-section">
              <label><FaQrcode /> Owner's GCash QR Code:</label>
              <div className="owner-qr-display">
                <img src={`http://localhost/backend/${bookingToPay.qr_code_url}`} alt="GCash QR" />
                <p>Scan this QR code to pay the owner</p>
              </div>
            </div>
          )}
          
          <div className="payment-breakdown">
            <h4>Payment Breakdown:</h4>
            <p>1 Month Advance Rent: ₱{Number(bookingToPay.price_per_month || 0).toLocaleString()}</p>
            <p>Security Deposit: ₱{Number(bookingToPay.deposit_amount || 0).toLocaleString()}</p>
            <p className="total-amount"><strong>TOTAL: ₱{Number(totalAmount).toLocaleString()}</strong></p>
          </div>
          
<form onSubmit={handleSubmit}>
  <div className="form-group">
    <label htmlFor="qrInput">Payment Screenshot</label>
    <input
      id="qrInput"
      name="qr_image"
      type="file"
      accept="image/*"
      onChange={handleFileChange}
      required
    />
    <small>Upload screenshot of your GCash payment confirmation</small>
  </div>
  
  {/* ITO ANG SUBMIT BUTTON - SIGURADUHING NANDITO */}
  <button type="submit" className="submit-payment-btn" disabled={isSubmitting}>
    <FaUpload /> {isSubmitting ? 'Submitting...' : 'Submit Payment'}
  </button>
</form>          {message && messageType === 'error' && (
            <p className="message error">{message}</p>
          )}
        </div>
      ) : bookingToPay && showSuccessModal ? null : (
        <div className="empty-state">
          <p>No pending payments. Your bookings are up to date.</p>
        </div>
      )}

      {/* Payment History */}
      <div className="payments-list">
        <h3>Payment History</h3>
        {payments.length === 0 ? (
          <p>No payment history yet.</p>
        ) : (
          payments.map(payment => (
            <div key={payment.id} className="payment-card">
              <div className="payment-header">
                <div>
                  <h3>{payment.dormitory_name}</h3>
                  <p className="room-number"><FaBed /> Room {payment.room_number}</p>
                </div>
                {getStatusBadge(payment.status)}
              </div>
              <div className="payment-details">
                <p><FaMoneyBillWave /> Amount: ₱{Number(payment.amount).toLocaleString()}</p>
                <p><FaCalendarAlt /> Date: {new Date(payment.created_at).toLocaleDateString()}</p>
                <p><FaCalendarAlt /> For: {payment.payment_month || 'Initial Payment'}</p>
                {payment.qr_code_image && (
                  <button onClick={() => openReceipt(payment.qr_code_image)} className="view-receipt-btn">
                    <FaFileImage /> View Receipt
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Payment Receipt"
        imageUrl={selectedImage}
      />
    </div>
  );
}

export default MyPayments;