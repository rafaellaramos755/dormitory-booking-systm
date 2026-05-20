import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaMapMarkerAlt, FaMoneyBillWave, FaUser, FaPhone, FaStar, FaBed, FaUsers, FaCalendarAlt, FaQrcode } from 'react-icons/fa';
import { MdDescription } from 'react-icons/md';

function DormitoryDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dormitory, setDormitory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [ratings, setRatings] = useState([]);
  const [rules, setRules] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [selectedTabRoom, setSelectedTabRoom] = useState(null);
  const [roomImages, setRoomImages] = useState([]);
  
  // Report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportFile, setReportFile] = useState(null);
  
  const API_URL = 'http://localhost/backend/api';

  useEffect(() => {
    fetchDormitoryDetails();
    fetchRatings();
    fetchRules();
  }, [id]);

  const fetchDormitoryDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/dormitories/get_by_id.php?id=${id}`);
      setDormitory(response.data.data);
      if (response.data.data?.images && response.data.data.images.length > 0) {
        setMainImage(response.data.data.images[0].image_url);
      }
    } catch (error) {
      console.error('Error fetching dormitory', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await axios.get(`${API_URL}/ratings/get_by_dormitory.php?dormitory_id=${id}`);
      setRatings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching ratings', error);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await axios.get(`${API_URL}/rules/get_by_dormitory.php?dormitory_id=${id}`);
      setRules(response.data.data || []);
    } catch (error) {
      console.error('Error fetching rules', error);
    }
  };

  // Update room images when selected room changes
  useEffect(() => {
    if (selectedRoom && dormitory?.images) {
      const images = dormitory.images.filter(img => img.room_id == selectedRoom);
      setRoomImages(images);
    } else {
      setRoomImages([]);
    }
  }, [selectedRoom, dormitory]);

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.user_type !== 'tenant') {
      setMessage('Only tenants can book rooms.');
      return;
    }
    if (!selectedRoom || !moveInDate) {
      setMessage('Please select a room and move-in date.');
      return;
    }

    setBookingLoading(true);
    setMessage('');
    try {
      const response = await axios.post(`${API_URL}/bookings/create.php`, {
        room_id: selectedRoom,
        move_in_date: moveInDate
      }, { withCredentials: true });
      
      if (response.data.success) {
        setMessage('✓ Booking request sent successfully!');
        setTimeout(() => navigate('/my-bookings'), 2000);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage('Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const submitReport = async () => {
    if (!user || user.user_type !== 'tenant') {
      alert('Only tenants can report');
      return;
    }
    if (!reportReason) {
      alert('Please select a reason');
      return;
    }
    const formData = new FormData();
    formData.append('reported_user_id', dormitory.owner_id);
    formData.append('reported_dorm_id', dormitory.id);
    formData.append('reason', reportReason);
    formData.append('description', reportDesc);
    if (reportFile) formData.append('evidence', reportFile);
    try {
      await axios.post(`${API_URL}/reports/create.php`, formData, { withCredentials: true });
      alert('Report submitted. Thank you for helping keep our community safe.');
      setShowReportModal(false);
      setReportReason('');
      setReportDesc('');
      setReportFile(null);
    } catch (error) {
      alert('Failed to submit report');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!dormitory) return <div className="not-found">Dormitory not found.</div>;

  const averageRating = ratings.length > 0 
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : 0;

  const allImages = dormitory.images || [];
  const hasMultipleImages = allImages.length > 1;
  const totalSlots = dormitory.rooms?.reduce((sum, room) => sum + room.capacity, 0) || 0;
  const occupiedSlots = dormitory.rooms?.reduce((sum, room) => sum + (room.current_occupants || 0), 0) || 0;
  const availableSlots = totalSlots - occupiedSlots;

  // Filter images based on selected room tab
  const filteredImages = selectedTabRoom 
    ? allImages.filter(img => img.room_id == selectedTabRoom)
    : allImages;
  
  const currentMainImage = filteredImages.length > 0 
    ? (mainImage && filteredImages.find(img => img.image_url === mainImage) ? mainImage : filteredImages[0].image_url)
    : null;

  return (
    <div className="dormitory-detail-container">
      <div className="detail-header">
        <h1>{dormitory.name}</h1>
        <p className="location"><FaMapMarkerAlt /> {dormitory.location}</p>
        {user?.user_type === 'tenant' && (
          <button onClick={() => setShowReportModal(true)} className="report-btn">🚩 Report this Dormitory</button>
        )}
      </div>

      <div className="detail-content">
        <div className="detail-main">
          {/* Room Tabs */}
          <div className="room-tabs">
            <button 
              className={selectedTabRoom === null ? 'active' : ''} 
              onClick={() => { setSelectedTabRoom(null); setMainImage(''); }}
            >
              All Photos
            </button>
            {dormitory.rooms?.map(room => {
              const roomOccupancy = `${room.current_occupants || 0}/${room.capacity}`;
              const isFull = room.current_occupants >= room.capacity;
              return (
                <button 
                  key={room.id}
                  className={`${selectedTabRoom === room.id ? 'active' : ''} ${isFull ? 'full' : ''}`}
                  onClick={() => { setSelectedTabRoom(room.id); setMainImage(''); }}
                >
                  {room.room_number} ({roomOccupancy})
                </button>
              );
            })}
          </div>

          {/* Image Gallery */}
          <div className="image-gallery">
            {filteredImages.length > 0 ? (
              <>
                <div className="main-image">
                  <img 
                    src={`http://localhost/backend/${currentMainImage || filteredImages[0].image_url}`} 
                    alt={dormitory.name} 
                  />
                </div>
                {filteredImages.length > 1 && (
                  <div className="thumbnail-list">
                    {filteredImages.map((img, index) => (
                      <div key={img.id} className="thumbnail-item">
                        <img 
                          src={`http://localhost/backend/${img.image_url}`} 
                          alt={`View ${index + 1}`}
                          className={currentMainImage === img.image_url ? 'active' : ''}
                          onClick={() => setMainImage(img.image_url)}
                        />
                        {img.room_name && <span className="thumbnail-label">{img.room_name}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="image-placeholder large">🏠</div>
            )}
          </div>
          
          <div className="detail-info">
            <h2>About this Dormitory</h2>
            <p className="description"><MdDescription /> {dormitory.description || 'No description available.'}</p>
           <div className="info-grid">
  <div className="info-item">
    <span className="info-label"><FaMoneyBillWave /> Price</span>
    <span className="info-value">₱{Number(dormitory.price_per_month).toLocaleString()}/month</span>
  </div>
  <div className="info-item">
    <span className="info-label"><FaMoneyBillWave /> Deposit</span>
    <span className="info-value">₱{Number(dormitory.deposit_amount || 0).toLocaleString()} (refundable)</span>
  </div>
  <div className="info-item">
    <span className="info-label"><FaUser /> Owner</span>
    <span className="info-value">
      {dormitory.owner_name}
      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>
        {dormitory.owner_email}
      </span>
    </span>
  </div>
  <div className="info-item">
    <span className="info-label"><FaStar /> Rating</span>
    <span className="info-value">{averageRating} / 5 ({ratings.length} reviews)</span>
  </div>
</div>
          </div>

          <div className="amenities-section">
            <h3>Amenities</h3>
            <div className="amenities-list">
              {dormitory.amenities && dormitory.amenities.length > 0 ? (
                dormitory.amenities.map(amenity => (
                  <span key={amenity} className="amenity-badge">{amenity}</span>
                ))
              ) : (
                <p>No amenities listed.</p>
              )}
            </div>
          </div>

          {/* Room Availability Summary */}
          <div className="availability-summary">
            <h3>Room Availability</h3>
            <div className="availability-stats">
              <div className="stat-box">
                <span className="stat-label"><FaBed /> Total Rooms</span>
                <span className="stat-number">{dormitory.rooms?.length || 0}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label"><FaUsers /> Total Slots</span>
                <span className="stat-number">{totalSlots}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label"><FaUsers /> Available Slots</span>
                <span className="stat-number available">{availableSlots}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label"><FaUsers /> Occupied</span>
                <span className="stat-number occupied">{occupiedSlots}</span>
              </div>
            </div>
          </div>

          <div className="booking-section">
            <h2>Request Booking</h2>
            <div className="booking-form">
              <div className="form-group">
                <label><FaBed /> Select Room</label>
                <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
                  <option value="">Choose a room</option>
                  {dormitory.rooms?.map(room => {
                    const availableSlotsInRoom = room.capacity - (room.current_occupants || 0);
                    const isFull = availableSlotsInRoom === 0;
                    return (
                      <option key={room.id} value={room.id} disabled={isFull}>
                        {room.room_number} - {room.current_occupants || 0}/{room.capacity} occupied | ₱{Number(dormitory.price_per_month).toLocaleString()}/month
                        {isFull ? ' (FULL)' : ` (${availableSlotsInRoom} slots left)`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Room-specific images gallery */}
              {roomImages.length > 0 && (
                <div className="room-gallery">
                  <label>Room Photos:</label>
                  <div className="thumbnail-list">
                    {roomImages.map(img => (
                      <img key={img.id} src={`http://localhost/backend/${img.image_url}`} alt="Room" />
                    ))}
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label><FaCalendarAlt /> Move-in Date</label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <button onClick={handleBooking} disabled={bookingLoading} className="book-btn">
                {bookingLoading ? 'Processing...' : 'Request Booking'}
              </button>
              {message && <p className={`message ${message.includes('✓') ? 'success' : 'error'}`}>{message}</p>}
            </div>
          </div>

          <div className="rules-section">
            <h2>House Rules</h2>
            {rules.length === 0 ? (
              <p>No rules posted yet.</p>
            ) : (
              <div className="rules-container">
                {rules.map(rule => (
                  <div key={rule.id} className="rule-item">
                    <div className="rule-title">{rule.rule_title}</div>
                    <div className="rule-description">{rule.rule_description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="detail-sidebar">
          {/* QR Code Payment Section */}
          {dormitory.qr_code_url && (
            <div className="qr-payment-section">
              <h3><FaQrcode /> Pay via GCash</h3>
              <div className="qr-code-display">
                <img src={`http://localhost/backend/${dormitory.qr_code_url}`} alt="GCash QR Code" />
                <p>Scan this QR code to pay</p>
                <small>Send payment proof in your payment page</small>
              </div>
            </div>
          )}

          <div className="ratings-sidebar">
            <h3><FaStar /> Ratings & Reviews</h3>
            <div className="rating-summary">
              <div className="rating-number">⭐ {averageRating}</div>
              <div className="rating-count">Based on {ratings.length} reviews</div>
            </div>
            <Link to={`/ratings/${dormitory.id}`} className="view-all-btn">
              View All Reviews →
            </Link>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Report this Dormitory</h3>
              <button className="modal-close" onClick={() => setShowReportModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <select value={reportReason} onChange={e => setReportReason(e.target.value)} required>
                <option value="">Select reason</option>
                <option value="Fake listing">Fake listing</option>
                <option value="Scam">Scam</option>
                <option value="Harassment">Harassment</option>
                <option value="Other">Other</option>
              </select>
              <textarea placeholder="Describe the issue..." rows="4" value={reportDesc} onChange={e => setReportDesc(e.target.value)} />
              <input type="file" accept="image/*" onChange={e => setReportFile(e.target.files[0])} />
              <small>Optional: Upload evidence (screenshot)</small>
            </div>
            <div className="modal-footer">
              <button onClick={submitReport} className="report-submit">Submit Report</button>
              <button onClick={() => setShowReportModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DormitoryDetail;