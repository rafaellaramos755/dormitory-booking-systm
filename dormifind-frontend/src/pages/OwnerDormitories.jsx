import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaBed, FaUsers, FaClock, FaPlus, FaEdit, FaQrcode, FaImage, FaUpload, FaTimes, FaSave, FaImages, FaEye, FaPowerOff, FaPlay, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';

function OwnerDormitories() {
  const { user } = useAuth();
  const [dormitories, setDormitories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRulesForm, setShowRulesForm] = useState(null);
  const [editingRule, setEditingRule] = useState(null);
  const [editRuleData, setEditRuleData] = useState({ title: '', description: '' });
  const [ruleData, setRuleData] = useState({ title: '', description: '' });
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState({ image: false, qr: false, multiple: false });
  const [showTenantsModal, setShowTenantsModal] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editingDorm, setEditingDorm] = useState(null);
  const [editDormData, setEditDormData] = useState({
    name: '', description: '', location: '', price_per_month: '', deposit_amount: 0, advance_months: 1
  });
  const [roomUploading, setRoomUploading] = useState({});
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [selectedDormId, setSelectedDormId] = useState(null);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState(1);
  const [addingRoom, setAddingRoom] = useState(false);
  const [collapsedDorms, setCollapsedDorms] = useState({});
  
  const [availableAmenities] = useState(['WiFi', 'Aircon', 'Parking', 'CCTV', 'Security Guard', 'Study Area', 'Laundry', 'Curfew']);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  
  const API_URL = 'http://localhost/backend/api';

  const toggleDormCollapse = (dormId) => {
    setCollapsedDorms(prev => ({
      ...prev,
      [dormId]: !prev[dormId]
    }));
  };

  useEffect(() => {
    fetchDormitories();
  }, []);

  const fetchDormitories = async () => {
    try {
      const response = await axios.get(`${API_URL}/dormitories/get_by_owner.php`, { withCredentials: true });
      setDormitories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching dormitories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDormChange = (e) => {
    setEditDormData({ ...editDormData, [e.target.name]: e.target.value });
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const updateDormitory = async () => {
    try {
      const payload = { 
        id: editingDorm.id,
        name: editDormData.name,
        description: editDormData.description,
        location: editDormData.location,
        price_per_month: editDormData.price_per_month,
        deposit_amount: editDormData.deposit_amount,
        advance_months: editDormData.advance_months,
        amenities: selectedAmenities
      };
      const response = await axios.post(`${API_URL}/dormitories/update.php`, payload, { withCredentials: true });
      if (response.data.success) {
        alert('Dormitory updated successfully!');
        setEditingDorm(null);
        await fetchDormitories();
      } else {
        alert('Update failed');
      }
    } catch (error) {
      alert('Error updating dormitory');
    }
  };

  const openEditDormModal = (dorm) => {
    setEditingDorm(dorm);
    setEditDormData({
      name: dorm.name,
      description: dorm.description || '',
      location: dorm.location,
      price_per_month: dorm.price_per_month,
      deposit_amount: dorm.deposit_amount || 0,
      advance_months: dorm.advance_months || 1
    });
    setSelectedAmenities(dorm.amenities || []);
  };

  const deactivateDormitory = async (id) => {
    if (!window.confirm("Deactivate this dormitory? It will be hidden from tenants. You can activate it later. Only possible if no active bookings or current occupants.")) return;
    try {
      const response = await axios.post(`${API_URL}/dormitories/deactivate.php`, { dormitory_id: id }, { withCredentials: true });
      alert(response.data.message);
      await fetchDormitories();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to deactivate");
    }
  };

  const activateDormitory = async (id) => {
    if (!window.confirm("Activate this dormitory? It will become visible to tenants again.")) return;
    try {
      const response = await axios.post(`${API_URL}/dormitories/activate.php`, { dormitory_id: id }, { withCredentials: true });
      alert(response.data.message);
      await fetchDormitories();
    } catch (error) {
      alert("Failed to activate");
    }
  };

  const uploadImage = async (dormitoryId) => {
    const fileInput = document.getElementById(`image_${dormitoryId}`);
    const file = fileInput.files[0];
    if (!file) { alert('Please select an image file'); return; }
    setUploading(prev => ({ ...prev, image: true }));
    const formData = new FormData();
    formData.append('image', file);
    formData.append('dormitory_id', dormitoryId);
    try {
      await axios.post(`${API_URL}/dormitories/upload_image.php`, formData, { withCredentials: true });
      await fetchDormitories();
      alert('Image uploaded successfully!');
    } catch (error) { alert('Upload failed'); }
    finally { setUploading(prev => ({ ...prev, image: false })); }
  };

  const uploadQR = async (dormitoryId) => {
    const fileInput = document.getElementById(`qr_${dormitoryId}`);
    const file = fileInput.files[0];
    if (!file) { alert('Please select a QR code image'); return; }
    setUploading(prev => ({ ...prev, qr: true }));
    const formData = new FormData();
    formData.append('qr_image', file);
    formData.append('dormitory_id', dormitoryId);
    try {
      await axios.post(`${API_URL}/payments/upload_owner_qr.php`, formData, { withCredentials: true });
      await fetchDormitories();
      alert('QR code uploaded successfully!');
    } catch (error) { alert('Upload failed'); }
    finally { setUploading(prev => ({ ...prev, qr: false })); }
  };

  const uploadMultipleImages = async (dormitoryId) => {
    const fileInput = document.getElementById(`images_${dormitoryId}`);
    const files = fileInput.files;
    if (files.length === 0) { alert('Please select at least one image'); return; }
    setUploading(prev => ({ ...prev, multiple: true }));
    const formData = new FormData();
    formData.append('dormitory_id', dormitoryId);
    for (let i = 0; i < files.length; i++) formData.append('images[]', files[i]);
    try {
      await axios.post(`${API_URL}/dormitories/upload_multiple_images.php`, formData, { withCredentials: true });
      await fetchDormitories();
      fileInput.value = '';
      alert('Image(s) uploaded successfully!');
    } catch (error) { alert('Upload failed'); }
    finally { setUploading(prev => ({ ...prev, multiple: false })); }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await axios.delete(`${API_URL}/dormitories/delete_image.php`, { data: { image_id: imageId }, withCredentials: true });
      await fetchDormitories();
    } catch (error) { alert('Delete failed'); }
  };

  const uploadRoomImages = async (dormitoryId, roomId, roomName) => {
    const fileInput = document.getElementById(`room_images_${roomId}`);
    const files = fileInput.files;
    if (files.length === 0) { alert('Please select at least one image'); return; }
    setRoomUploading(prev => ({ ...prev, [roomId]: true }));
    const formData = new FormData();
    formData.append('dormitory_id', dormitoryId);
    formData.append('room_id', roomId);
    formData.append('room_name', roomName);
    for (let i = 0; i < files.length; i++) formData.append('images[]', files[i]);
    try {
      const response = await axios.post(`${API_URL}/dormitories/upload_room_images.php`, formData, { withCredentials: true });
      alert(response.data.uploaded + ' image(s) uploaded to ' + roomName);
      await fetchDormitories();
      fileInput.value = '';
    } catch (error) { alert('Upload failed'); }
    finally { setRoomUploading(prev => ({ ...prev, [roomId]: false })); }
  };

  const addRule = async (dormitoryId) => {
    if (!ruleData.title || !ruleData.description) { alert('Please enter both title and description'); return; }
    try {
      await axios.post(`${API_URL}/rules/create.php`, { dormitory_id: dormitoryId, title: ruleData.title, description: ruleData.description }, { withCredentials: true });
      setShowRulesForm(null);
      setRuleData({ title: '', description: '' });
      await fetchDormitories();
    } catch (error) { alert('Failed to add rule'); }
  };

  const updateRule = async (ruleId) => {
    try {
      await axios.post(`${API_URL}/rules/update.php`, { rule_id: ruleId, title: editRuleData.title, description: editRuleData.description }, { withCredentials: true });
      setEditingRule(null);
      await fetchDormitories();
    } catch (error) { alert('Failed to update rule'); }
  };

  const deleteRule = async (ruleId) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await axios.delete(`${API_URL}/rules/delete.php?rule_id=${ruleId}`, { withCredentials: true });
      await fetchDormitories();
    } catch (error) { alert('Failed to delete rule'); }
  };

  const openTenantsModal = async (room) => {
    setSelectedRoom(room);
    setShowTenantsModal(true);
    try {
      const response = await axios.get(`${API_URL}/rooms/get_tenants.php?room_id=${room.id}`, {
        withCredentials: true
      });
      setSelectedRoom({ ...room, tenants: response.data.data || [] });
    } catch (error) {
      console.error('Error fetching tenants', error);
      setSelectedRoom({ ...room, tenants: [] });
    }
  };

  const openAddRoomModal = (dormId) => {
    setSelectedDormId(dormId);
    setNewRoomNumber('');
    setNewRoomCapacity(1);
    setShowAddRoomModal(true);
  };

  const addRoom = async () => {
    if (!newRoomNumber.trim()) { alert('Please enter room number'); return; }
    setAddingRoom(true);
    try {
      await axios.post(`${API_URL}/rooms/create.php`, { dormitory_id: selectedDormId, room_number: newRoomNumber, capacity: newRoomCapacity }, { withCredentials: true });
      alert('Room added successfully');
      setShowAddRoomModal(false);
      await fetchDormitories();
    } catch (error) { alert(error.response?.data?.message || 'Failed to add room'); }
    finally { setAddingRoom(false); }
  };

  const deleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Delete room ${roomNumber}? This will permanently remove the room. Only possible if no occupants or active bookings.`)) return;
    try {
      await axios.delete(`${API_URL}/rooms/delete.php`, { data: { room_id: roomId }, withCredentials: true });
      alert('Room deleted');
      await fetchDormitories();
    } catch (error) { alert(error.response?.data?.message || 'Failed to delete room'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="owner-container">
      <div className="page-header">
        <h1><FaBuilding /> My Dormitories</h1>
        <Link to="/apply-dormitory" className="apply-btn"><FaPlus /> Apply New Dormitory</Link>
      </div>

      {message && <div className="message success">{message}</div>}

      {dormitories.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any dormitories yet.</p>
          <Link to="/apply-dormitory" className="empty-btn"><FaPlus /> Apply for Your First Dormitory</Link>
        </div>
      ) : (
        <div className="dormitories-list">
          {dormitories.map(dorm => (
            <div key={dorm.id} className="dorm-admin-card">
              
              {/* HEADER with Collapse Button */}
              <div className="dorm-admin-header">
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <button 
  onClick={() => toggleDormCollapse(dorm.id)} 
  style={{ 
    background: '#e2e8f0',
    border: 'none', 
    cursor: 'pointer', 
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1e293b',
    transition: 'all 0.2s',
    marginRight: '8px'
  }}
  onMouseEnter={(e) => { e.currentTarget.style.background = '#cbd5e1'; }}
  onMouseLeave={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
>
  {collapsedDorms[dorm.id] ? '▶' : '▼'}
</button>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaBuilding /> {dorm.name}
                    </h3>
                    <p className="location" style={{ margin: '6px 0 0 0' }}><FaMapMarkerAlt /> {dorm.location}</p>
                    <div className="dorm-status-badge" style={{ marginTop: '6px' }}>
                      {dorm.status === 'active' ? <span className="status-active">Active</span> : <span className="status-inactive">Inactive</span>}
                    </div>
                  </div>
                </div>
                <div className="header-buttons">
                  <button onClick={() => openEditDormModal(dorm)} className="edit-dorm-btn"><FaEdit /> Edit</button>
                  {dorm.status === 'active' ? (
                    <button onClick={() => deactivateDormitory(dorm.id)} className="deactivate-btn"><FaPowerOff /> Deactivate</button>
                  ) : (
                    <button onClick={() => activateDormitory(dorm.id)} className="activate-btn"><FaPlay /> Activate</button>
                  )}
                </div>
              </div>

              {/* COLLAPSIBLE CONTENT */}
              {!collapsedDorms[dorm.id] && (
                <>
                  {/* STATS */}
                  <div className="dorm-stats">
                    <div className="stat"><span className="stat-label"><FaMoneyBillWave /> Price</span><span>₱{Number(dorm.price_per_month).toLocaleString()}/month</span></div>
                    <div className="stat"><span className="stat-label"><FaMoneyBillWave /> Deposit</span><span>₱{Number(dorm.deposit_amount || 0).toLocaleString()}</span></div>
                    <div className="stat"><span className="stat-label"><FaBed /> Rooms</span><span>{dorm.total_rooms || 0}</span></div>
                    <div className="stat"><span className="stat-label"><FaUsers /> Tenants</span><span>{dorm.total_tenants || 0}</span></div>
                    <div className="stat"><span className="stat-label"><FaClock /> Pending</span><span>{dorm.pending_bookings || 0}</span></div>
                  </div>

                  {/* ROOMS SECTION */}
                  <div className="rooms-section">
                    <div className="rooms-header">
                      <h4><FaBed /> Rooms and Occupants</h4>
                      <button onClick={() => openAddRoomModal(dorm.id)} className="add-room-btn"><FaPlus /> Add Room</button>
                    </div>
                    <div className="rooms-grid">
                      {dorm.rooms && dorm.rooms.map(room => {
                        const roomImages = (dorm.images || []).filter(img => img.room_id == room.id);
                        return (
                          <div key={room.id} className="room-card">
                            <div className="room-header">
                              <strong>{room.room_number}</strong>
                              <span className={`room-status ${room.is_available ? 'available' : 'full'}`}>
                                {room.is_available ? 'Available' : 'Full'}
                              </span>
                            </div>
                            <div className="room-stats">
                              <span>Occupancy: {room.current_occupants || 0}/{room.capacity}</span>
                              <div className="room-buttons">
                                <button onClick={() => openTenantsModal(room)} className="view-tenants-btn"><FaEye /> View Tenants</button>
                                <button onClick={() => deleteRoom(room.id, room.room_number)} className="delete-room-btn"><FaTrash /></button>
                              </div>
                            </div>
                            <div className="room-images-preview">
                              {roomImages.map(img => (
                                <div key={img.id} className="room-image-item">
                                  <img src={`http://localhost/backend/${img.image_url}`} alt={room.room_number} />
                                  <button onClick={() => deleteImage(img.id)} className="remove-image-btn">X</button>
                                </div>
                              ))}
                            </div>
                            <div className="room-upload-area">
                              <input type="file" id={`room_images_${room.id}`} accept="image/*" multiple />
                              <button onClick={() => uploadRoomImages(dorm.id, room.id, room.room_number)} disabled={roomUploading[room.id]} className="upload-room-btn">
                                <FaUpload /> {roomUploading[room.id] ? 'Uploading...' : 'Upload Photos to ' + room.room_number}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* UPLOADS GROUP CARD */}
                  <div className="uploads-group-card">
                    <h4><FaImage /> Media and Payment Settings</h4>
                    <div className="uploads-grid">
                      <div className="upload-item">
                        <label><FaImage /> Featured Image</label>
                        {dorm.image_url && (
                          <div className="upload-preview">
                            <img src={`http://localhost/backend/${dorm.image_url}`} alt={dorm.name} />
                          </div>
                        )}
                        <div className="upload-controls">
                          <input type="file" id={`image_${dorm.id}`} accept="image/*" />
                          <button onClick={() => uploadImage(dorm.id)} disabled={uploading.image}>
                            <FaUpload /> {uploading.image ? 'Uploading...' : 'Upload'}
                          </button>
                        </div>
                      </div>

                      <div className="upload-item">
                        <label><FaImages /> Additional Photos</label>
                        {dorm.images && dorm.images.filter(img => !img.room_id).length > 0 ? (
                          <div className="thumbnails-grid">
                            {dorm.images.filter(img => !img.room_id).slice(0, 3).map(img => (
                              <div key={img.id} className="thumbnail">
                                <img src={`http://localhost/backend/${img.image_url}`} alt="Dorm" />
                                <button onClick={() => deleteImage(img.id)} className="remove-thumb">X</button>
                              </div>
                            ))}
                            {dorm.images.filter(img => !img.room_id).length > 3 && (
                              <div className="more-indicator">+{dorm.images.filter(img => !img.room_id).length - 3} more</div>
                            )}
                          </div>
                        ) : (
                          <div className="no-images">No additional photos</div>
                        )}
                        <div className="upload-controls">
                          <input type="file" id={`images_${dorm.id}`} accept="image/*" multiple />
                          <button onClick={() => uploadMultipleImages(dorm.id)} disabled={uploading.multiple}>
                            <FaUpload /> {uploading.multiple ? 'Uploading...' : 'Upload Multiple'}
                          </button>
                        </div>
                      </div>

                      <div className="upload-item">
                        <label><FaQrcode /> GCash QR Code</label>
                        {dorm.qr_code_url && (
                          <div className="upload-preview">
                            <img src={`http://localhost/backend/${dorm.qr_code_url}`} alt="QR Code" />
                          </div>
                        )}
                        <div className="upload-controls">
                          <input type="file" id={`qr_${dorm.id}`} accept="image/*" />
                          <button onClick={() => uploadQR(dorm.id)} disabled={uploading.qr}>
                            <FaUpload /> {uploading.qr ? 'Uploading...' : 'Upload QR'}
                          </button>
                        </div>
                      </div>
                    </div>
                    <small className="upload-note">Tenants will scan the QR code to pay via GCash</small>
                  </div>

                  {/* RULES SECTION */}
                  <div className="rules-section">
                    <div className="rules-header">
                      <h4>House Rules</h4>
                      <button onClick={() => setShowRulesForm(showRulesForm === dorm.id ? null : dorm.id)} className="add-rule-btn">
                        <FaPlus /> {showRulesForm === dorm.id ? 'Cancel' : 'Add Rule'}
                      </button>
                    </div>
                    {showRulesForm === dorm.id && (
                      <div className="add-rule-form">
                        <input type="text" placeholder="Rule title" value={ruleData.title} onChange={e => setRuleData({...ruleData, title: e.target.value})} />
                        <input type="text" placeholder="Rule description" value={ruleData.description} onChange={e => setRuleData({...ruleData, description: e.target.value})} />
                        <button onClick={() => addRule(dorm.id)}><FaSave /> Save Rule</button>
                      </div>
                    )}
                    <ul className="rules-list">
                      {dorm.rules && dorm.rules.length > 0 ? dorm.rules.map(rule => (
                        <li key={rule.id}>
                          {editingRule === rule.id ? (
                            <div className="edit-rule-form">
                              <input value={editRuleData.title} onChange={e => setEditRuleData({...editRuleData, title: e.target.value})} placeholder="Title" />
                              <input value={editRuleData.description} onChange={e => setEditRuleData({...editRuleData, description: e.target.value})} placeholder="Description" />
                              <button onClick={() => updateRule(rule.id)}><FaSave /> Save</button>
                              <button onClick={() => setEditingRule(null)}><MdCancel /> Cancel</button>
                            </div>
                          ) : (
                            <>
                              <strong>{rule.rule_title}</strong>: {rule.rule_description}
                              <div className="rule-actions">
                                <button onClick={() => { setEditingRule(rule.id); setEditRuleData({ title: rule.rule_title, description: rule.rule_description }); }} className="edit-rule"><FaEdit /> Edit</button>
                                <button onClick={() => deleteRule(rule.id)} className="delete-rule"><FaTrash /> Delete</button>
                              </div>
                            </>
                          )}
                        </li>
                      )) : <li>No rules added yet.</li>}
                    </ul>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
{/* Edit Dormitory Modal */}
{editingDorm && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }} onClick={() => setEditingDorm(null)}>
    <div style={{
      background: 'white',
      borderRadius: '20px',
      width: '90%',
      maxWidth: '700px',
      maxHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    }} onClick={e => e.stopPropagation()}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 24px',
        background: '#1e293b'
      }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'white' }}>Edit Dormitory</h3>
        <button style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          color: 'white',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setEditingDorm(null)}>&times;</button>
      </div>
      
      {/* Body */}
      <div style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        background: '#f8fafc'
      }}>
        
        {/* Row 1: Dormitory Name + Location - 2 columns */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>DORMITORY NAME</label>
            <input
              type="text"
              name="name"
              value={editDormData.name}
              onChange={handleEditDormChange}
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>LOCATION</label>
            <input
              type="text"
              name="location"
              value={editDormData.location}
              onChange={handleEditDormChange}
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Row 2: Description - Full width */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>DESCRIPTION</label>
          <textarea
            name="description"
            value={editDormData.description}
            onChange={handleEditDormChange}
            rows="3"
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        {/* Row 3: Price + Deposit - 2 columns */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>PRICE PER MONTH (₱)</label>
            <input
              type="number"
              name="price_per_month"
              value={editDormData.price_per_month}
              onChange={handleEditDormChange}
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>DEPOSIT AMOUNT (₱)</label>
            <input
              type="number"
              name="deposit_amount"
              value={editDormData.deposit_amount}
              onChange={handleEditDormChange}
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Row 4: Advance Months */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>ADVANCE MONTHS REQUIRED</label>
          <select
            name="advance_months"
            value={editDormData.advance_months}
            onChange={handleEditDormChange}
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}
          >
            <option value="1">1 month</option>
            <option value="2">2 months</option>
            <option value="3">3 months</option>
          </select>
        </div>

        {/* Row 5: Amenities */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px' }}>AMENITIES</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {availableAmenities.map(amenity => (
              <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', color: '#334155', cursor: 'pointer' }}>{amenity}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        padding: '16px 24px',
        background: 'white',
        borderTop: '1px solid #e2e8f0'
      }}>
        <button
          onClick={updateDormitory}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '40px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Save Changes
        </button>
        <button
          onClick={() => setEditingDorm(null)}
          style={{
            background: '#e2e8f0',
            color: '#334155',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '40px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="modal-overlay" onClick={() => setShowAddRoomModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Add New Room</h3><button className="modal-close" onClick={() => setShowAddRoomModal(false)}>&times;</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Room Number</label><input type="text" value={newRoomNumber} onChange={e => setNewRoomNumber(e.target.value)} placeholder="e.g., Room 4" autoFocus /></div>
              <div className="form-group"><label>Capacity (persons)</label><input type="number" value={newRoomCapacity} onChange={e => setNewRoomCapacity(e.target.value)} min="1" /></div>
            </div>
            <div className="modal-footer"><button onClick={addRoom} disabled={addingRoom} className="save-btn">{addingRoom ? 'Adding...' : 'Add Room'}</button><button onClick={() => setShowAddRoomModal(false)} className="cancel-btn">Cancel</button></div>
          </div>
        </div>
      )}

      {/* Tenants Modal */}
      {showTenantsModal && selectedRoom && (
        <div className="modal-overlay" onClick={() => setShowTenantsModal(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedRoom.room_number} - Tenants</h3>
              <button className="modal-close" onClick={() => setShowTenantsModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p><strong>Capacity:</strong> {selectedRoom.capacity} persons</p>
              <p><strong>Current Occupants:</strong> {selectedRoom.current_occupants || 0}/{selectedRoom.capacity}</p>
              {selectedRoom.tenants && selectedRoom.tenants.length > 0 ? (
                <div className="tenants-list">
                  {selectedRoom.tenants.map(tenant => (
                    <div key={tenant.id} className="tenant-card">
                      <strong>{tenant.name}</strong>
                      <p>Phone: {tenant.phone || 'Not provided'}</p>
                      <p>Email: {tenant.email || 'Not provided'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-tenants">No tenants currently occupying this room.</p>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowTenantsModal(null)} className="close-modal-btn">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDormitories;