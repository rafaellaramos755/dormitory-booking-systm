  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import { useAuth } from '../contexts/AuthContext';
  import LoadingSpinner from '../components/LoadingSpinner';
  import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaCamera, FaSave } from 'react-icons/fa';

  function Profile() {
    const { user, setUser } = useAuth();
    const [formData, setFormData] = useState({
      name: '',
      phone: '',
      address: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const API_URL = 'http://localhost/backend/api';

    useEffect(() => {
      if (user) {
        setFormData({
          name: user.name || '',
          phone: user.phone || '',
          address: user.address || ''
        });
        setProfileImage(user.profile_image);
        if (user.profile_image) {
          setImagePreview(`http://localhost/backend/${user.profile_image}`);
        }
      }
    }, [user]);

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage('');

      try {
        const response = await axios.post(`${API_URL}/users/update_profile.php`, formData, {
          withCredentials: true
        });
        if (response.data.success) {
          setMessage('✓ Profile updated successfully!');
          setUser({ ...user, ...formData });
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage('Update failed. Please try again.');
        }
      } catch (error) {
        setMessage('Error updating profile.');
      } finally {
        setLoading(false);
      }
    };

    const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setUploading(true);
      const formData = new FormData();
      formData.append('profile_image', file);

      try {
        const response = await axios.post(`${API_URL}/users/upload_profile.php`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          setProfileImage(response.data.image_url);
          setUser({ ...user, profile_image: response.data.image_url });
          setMessage('✓ Profile picture updated!');
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage(response.data.message);
        }
      } catch (error) {
        setMessage('Upload failed');
      } finally {
        setUploading(false);
      }
    };

    if (!user) return <LoadingSpinner />;

    return (
      <div className="profile-container">
        <div className="page-header">
          <h1><FaUser /> My Profile</h1>
        </div>

        <div className="profile-card">
          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <div className="profile-avatar">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" />
              ) : profileImage ? (
                <img src={`http://localhost/backend/${profileImage}`} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-upload">
              <input 
                type="file" 
                id="profileImage" 
                accept="image/*" 
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <button onClick={() => document.getElementById('profileImage').click()} disabled={uploading}>
                <FaCamera /> {uploading ? 'Uploading...' : 'Change Profile Picture'}
              </button>
            </div>
          </div>

          <div className="profile-info">
            <div className="info-row">
              <span className="info-label"><FaEnvelope /> Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><FaUser /> Account Type:</span>
              <span className="info-value">
                {user.user_type === 'tenant' ? 'Tenant (Looking for dorm)' : 'Owner (Dormitory provider)'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label"><FaCalendarAlt /> Member since:</span>
              <span className="info-value">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <h3>Edit Profile Information</h3>
            
            <div className="form-group">
              <label><FaUser /> Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="form-group">
              <label><FaPhone /> Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </div>
            
            <div className="form-group">
              <label><FaMapMarkerAlt /> Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                placeholder="Enter your address"
              />
            </div>
            
            <button type="submit" disabled={loading}>
              <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
            {message && <p className={`message ${message.includes('✓') ? 'success' : 'error'}`}>{message}</p>}
          </form>
        </div>
      </div>
    );
  }

  export default Profile;
