import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { FaMoneyBillWave, FaCalendarAlt, FaFileImage, FaCheckCircle, FaClock, FaTimesCircle, FaBuilding, FaBed, FaUser, FaFilter, FaEye } from 'react-icons/fa';

function OwnerPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ total_verified: 0, total_pending: 0, total_failed: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const API_URL = 'http://localhost/backend/api';

  const fetchPayments = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/payments/get_owner_payments.php`, {
        withCredentials: true
      });
      setPayments(response.data.data || []);
      setSummary(response.data.summary || { total_verified: 0, total_pending: 0, total_failed: 0 });
    } catch (error) {
      console.error('Error fetching payments', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Auto‑refresh every 5 seconds
  useAutoRefresh(fetchPayments, 5000);

  const verifyPayment = async (paymentId) => {
    setProcessingId(paymentId);
    try {
      await axios.post(`${API_URL}/payments/verify.php`, 
        { payment_id: paymentId, status: 'verified' }, 
        { withCredentials: true }
      );
      await fetchPayments();
    } catch (error) {
      alert('Verification failed');
    } finally {
      setProcessingId(null);
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
      failed: <FaTimesCircle />
    };
    return (
      <span className={`status-badge ${badges[status]}`}>
        {icons[status]} {status}
      </span>
    );
  };

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="owner-container">
      <div className="page-header">
        <h1><FaMoneyBillWave /> Payment Tracking</h1>
        <button onClick={() => window.open(`${API_URL}/owner/export_payments.php`, '_blank')} className="export-btn">
          📊 Export to Excel
        </button>
      </div>

      <div className="payment-summary">
        <div className="summary-card verified">
          <h3><FaCheckCircle /> Total Verified</h3>
          <p className="summary-amount">₱{Number(summary.total_verified).toLocaleString()}</p>
        </div>
        <div className="summary-card pending">
          <h3><FaClock /> Total Pending</h3>
          <p className="summary-amount">₱{Number(summary.total_pending).toLocaleString()}</p>
        </div>
        <div className="summary-card failed">
          <h3><FaTimesCircle /> Total Failed</h3>
          <p className="summary-amount">₱{Number(summary.total_failed).toLocaleString()}</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          <FaFilter /> All
        </button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>
          <FaClock /> Pending
        </button>
        <button className={filter === 'verified' ? 'active' : ''} onClick={() => setFilter('verified')}>
          <FaCheckCircle /> Verified
        </button>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="empty-state">
          <p>No payments found.</p>
        </div>
      ) : (
        <div className="payments-list">
          {filteredPayments.map(payment => (
            <div key={payment.id} className="payment-card">
              <div className="payment-header">
                <div>
                  <h3><FaBuilding /> {payment.dormitory_name}</h3>
                  <p className="room-number"><FaBed /> Room {payment.room_number}</p>
                  <p className="tenant-name"><FaUser /> Tenant: {payment.tenant_name}</p>
                </div>
                {getStatusBadge(payment.status)}
              </div>
              
              <div className="payment-details">
                <div className="detail-row">
                  <span className="detail-label"><FaMoneyBillWave /> Amount:</span>
                  <span className="detail-value">₱{Number(payment.amount).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><FaCalendarAlt /> Date:</span>
                  <span className="detail-value">{new Date(payment.created_at).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><FaCalendarAlt /> For Month:</span>
                  <span className="detail-value">{payment.payment_month || 'Initial Payment'}</span>
                </div>
                
                {/* VIEW RECEIPT BUTTON - ITO ANG HINAHANAP MO */}
                {payment.qr_code_image && (
                  <div className="detail-row">
                    <button 
                      onClick={() => openReceipt(payment.qr_code_image)} 
                      className="view-receipt-btn"
                    >
                      <FaEye /> View Receipt
                    </button>
                  </div>
                )}
              </div>

              {/* VERIFY BUTTON - PARA LANG SA PENDING PAYMENTS */}
              {payment.status === 'pending' && (
                <div className="verify-section">
                  <button 
                    onClick={() => verifyPayment(payment.id)} 
                    className="verify-btn"
                    disabled={processingId === payment.id}
                  >
                    <FaCheckCircle /> {processingId === payment.id ? 'Processing...' : 'Verify Payment'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Payment Receipt"
        imageUrl={selectedImage}
      />
    </div>
  );
}

export default OwnerPayments;