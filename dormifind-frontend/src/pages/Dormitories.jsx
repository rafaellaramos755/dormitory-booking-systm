import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaMapMarkerAlt, FaMoneyBillWave, FaBed, FaUsers, FaStar, FaTimes } from 'react-icons/fa';

function Dormitories() {
  const [dormitories, setDormitories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ min_price: '', max_price: '' });
  const API_URL = 'http://localhost/backend/api';

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDormitories();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filters.min_price, filters.max_price]);

  const fetchDormitories = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      const response = await axios.get(`${API_URL}/dormitories/get_all.php`, { params });
      setDormitories(response.data?.data || []);
    } catch (error) {
      console.error(error);
      setDormitories([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilters({ min_price: '', max_price: '' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dormitories-container">
      <div className="page-header">
        <h1>Find Your Perfect Dormitory</h1>
        <p>Browse available dormitories near you</p>
      </div>

      {/* ITO ANG SEARCH BAR - SIGURADUHING KITA */}
      <div className="filters-bar">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            autoFocus
          />
        </div>
        <div className="price-wrapper">
          <input
            type="number"
            placeholder="Min Price"
            value={filters.min_price}
            onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
            className="price-input"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max Price"
            value={filters.max_price}
            onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
            className="price-input"
          />
        </div>
        <button onClick={clearFilters} className="clear-btn">
          <FaTimes /> Clear
        </button>
      </div>

      {dormitories.length === 0 ? (
        <div className="no-results">
          <p>No dormitories found.</p>
          <button onClick={clearFilters} className="clear-btn">Clear Filters</button>
        </div>
      ) : (
        <div className="dormitories-grid">
          {dormitories.map((dorm) => (
            <div key={dorm.id} className="dorm-card">
              {dorm.image_url && (
                <div className="dorm-image">
                  <img src={`http://localhost/backend/${dorm.image_url}`} alt={dorm.name} />
                </div>
              )}
              <div className="dorm-info">
  <h3>{dorm.name}</h3>
  <p className="location"><FaMapMarkerAlt /> {dorm.location}</p>
  <p className="price"><FaMoneyBillWave /> ₱{Number(dorm.price_per_month).toLocaleString()}/month</p>
  <div className="room-stats">
    <p><FaBed /> Available Rooms: {dorm.available_rooms ?? 0}</p>
    <p><FaUsers /> Available Slots: {dorm.available_slots ?? 0}</p>
  </div>
  {dorm.amenities && dorm.amenities.length > 0 && (
    <div className="amenities">
      {dorm.amenities.map(amenity => (
        <span key={amenity} className="amenity-badge">{amenity}</span>
      ))}
    </div>
  )}
  <div className="rating">
    <FaStar /> {dorm.avg_rating ? Number(dorm.avg_rating).toFixed(1) : 'New'} 
    <span>({dorm.total_ratings || 0} reviews)</span>
  </div>
  <Link to={`/dormitory/${dorm.id}`} className="view-details-btn">
    View Details →
  </Link>
</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dormitories;