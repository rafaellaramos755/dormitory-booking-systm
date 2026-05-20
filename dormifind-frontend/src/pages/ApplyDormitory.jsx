import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaBed, FaUsers, FaFileAlt, FaUpload, FaBusinessTime, FaIdCard, FaFileInvoice } from 'react-icons/fa';

function ApplyDormitory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', description: '', location: '', price_per_month: '', deposit_amount: 0, total_rooms: 1, capacity: 1
  });
  const [businessPermit, setBusinessPermit] = useState(null);
  const [barangayClearance, setBarangayClearance] = useState(null);
  const [govId, setGovId] = useState(null);
  const [utilityBill, setUtilityBill] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const API_URL = 'http://localhost/backend/api';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!businessPermit || !barangayClearance || !govId || !utilityBill) {
      setMessage('Please upload all required documents: Business Permit, Barangay Clearance, Government ID, and Utility Bill.');
      return;
    }
    setLoading(true);
    setMessage('');

    const formDataObj = new FormData();
    for (const key in formData) {
      formDataObj.append(key, formData[key]);
    }
    formDataObj.append('business_permit', businessPermit);
    formDataObj.append('barangay_clearance', barangayClearance);
    formDataObj.append('gov_id', govId);
    formDataObj.append('utility_bill', utilityBill);
    if (imageFile) formDataObj.append('image', imageFile);

    try {
      const response = await axios.post(`${API_URL}/dormitories/apply.php`, formDataObj, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setMessage('✓ Application submitted! Admin will review your dormitory.');
        setTimeout(() => navigate('/my-dormitories'), 3000);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.user_type !== 'owner') return <div className="auth-container"><p>Only owners can apply.</p></div>;

  return (
    <div className="apply-container">
      <div className="page-header">
        <h1>Apply for Dormitory Verification</h1>
        <p>Submit your dormitory details and required documents for admin approval.</p>
      </div>
      <div className="auth-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label><FaBuilding /> Dormitory Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label><FaMapMarkerAlt /> Location *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label><FaMoneyBillWave /> Price per Month (₱) *</label>
              <input type="number" name="price_per_month" value={formData.price_per_month} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label><FaMoneyBillWave /> Deposit (₱)</label>
              <input type="number" name="deposit_amount" value={formData.deposit_amount} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label><FaBed /> Total Rooms *</label>
              <input type="number" name="total_rooms" value={formData.total_rooms} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label><FaUsers /> Capacity per Room</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label><FaBusinessTime /> Business Permit *</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setBusinessPermit(e.target.files[0])} required />
          </div>
          <div className="form-group">
            <label><FaFileAlt /> Barangay Clearance *</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setBarangayClearance(e.target.files[0])} required />
          </div>
          <div className="form-group">
            <label><FaIdCard /> Government ID *</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setGovId(e.target.files[0])} required />
          </div>
          <div className="form-group">
            <label><FaFileInvoice /> Latest Utility Bill (Electricity/Water) *</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setUtilityBill(e.target.files[0])} required />
          </div>
          <div className="form-group">
            <label><FaUpload /> Dormitory Image (Optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          </div>

          <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</button>
          {message && <p className={`message ${message.includes('✓') ? 'success' : 'error'}`}>{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default ApplyDormitory;