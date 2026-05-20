import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

function Ratings() {
  const { dormitory_id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dormitory, setDormitory] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState({ average: 0, total: 0, five_star: 0, four_star: 0, three_star: 0, two_star: 0, one_star: 0 });
  const [userRating, setUserRating] = useState({ rating: 5, review: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const API_URL = 'http://localhost/backend/api';

  useEffect(() => {
    fetchDormitory();
    fetchRatings();
  }, [dormitory_id]);

  const fetchDormitory = async () => {
    try {
      const response = await axios.get(`${API_URL}/dormitories/get_by_id.php?id=${dormitory_id}`);
      setDormitory(response.data.data);
    } catch (error) {
      console.error('Error fetching dormitory', error);
    }
  };

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/ratings/get_by_dormitory.php?dormitory_id=${dormitory_id}`);
      setRatings(response.data.data || []);
      setStats({
        average: response.data.average || 0,
        total: response.data.total || 0,
        five_star: response.data.stats?.five_star || 0,
        four_star: response.data.stats?.four_star || 0,
        three_star: response.data.stats?.three_star || 0,
        two_star: response.data.stats?.two_star || 0,
        one_star: response.data.stats?.one_star || 0
      });
    } catch (error) {
      console.error('Error fetching ratings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.user_type !== 'tenant') {
      setMessage('Only tenants can rate dormitories.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    try {
      const response = await axios.post(`${API_URL}/ratings/create.php`, {
        dormitory_id: dormitory_id,
        rating: userRating.rating,
        review: userRating.review
      }, { withCredentials: true });
      
      if (response.data.success) {
        setMessage('✓ Thank you for your rating!');
        fetchRatings();
        setUserRating({ rating: 5, review: '' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="ratings-container">
      <div className="page-header">
        <h1>{dormitory?.name}</h1>
        <p className="location">📍 {dormitory?.location}</p>
      </div>

      <div className="ratings-summary">
        <div className="average-rating">
          <div className="rating-number">{stats.average > 0 ? stats.average.toFixed(1) : '0.0'}</div>
          <div className="rating-stars">{renderStars(Math.round(stats.average))}</div>
          <div className="rating-count">Based on {stats.total} {stats.total === 1 ? 'review' : 'reviews'}</div>
        </div>
        
        <div className="rating-bars">
          <div className="bar-item">
            <span>5★</span>
            <div className="bar"><div className="bar-fill" style={{ width: `${stats.total ? (stats.five_star / stats.total) * 100 : 0}%` }}></div></div>
            <span>{stats.five_star}</span>
          </div>
          <div className="bar-item">
            <span>4★</span>
            <div className="bar"><div className="bar-fill" style={{ width: `${stats.total ? (stats.four_star / stats.total) * 100 : 0}%` }}></div></div>
            <span>{stats.four_star}</span>
          </div>
          <div className="bar-item">
            <span>3★</span>
            <div className="bar"><div className="bar-fill" style={{ width: `${stats.total ? (stats.three_star / stats.total) * 100 : 0}%` }}></div></div>
            <span>{stats.three_star}</span>
          </div>
          <div className="bar-item">
            <span>2★</span>
            <div className="bar"><div className="bar-fill" style={{ width: `${stats.total ? (stats.two_star / stats.total) * 100 : 0}%` }}></div></div>
            <span>{stats.two_star}</span>
          </div>
          <div className="bar-item">
            <span>1★</span>
            <div className="bar"><div className="bar-fill" style={{ width: `${stats.total ? (stats.one_star / stats.total) * 100 : 0}%` }}></div></div>
            <span>{stats.one_star}</span>
          </div>
        </div>
      </div>

      {user?.user_type === 'tenant' && (
        <div className="rate-form">
          <h3>Rate this Dormitory</h3>
          <div className="rating-select">
            <label>Your Rating:</label>
            <select value={userRating.rating} onChange={(e) => setUserRating({...userRating, rating: parseInt(e.target.value)})}>
              <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
              <option value="4">⭐⭐⭐⭐ - Good</option>
              <option value="3">⭐⭐⭐ - Average</option>
              <option value="2">⭐⭐ - Poor</option>
              <option value="1">⭐ - Terrible</option>
            </select>
          </div>
          <div className="form-group">
            <label>Your Review:</label>
            <textarea
              placeholder="Write your review here..."
              value={userRating.review}
              onChange={(e) => setUserRating({...userRating, review: e.target.value})}
              rows="4"
            />
          </div>
          <button onClick={handleSubmitRating} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
          {message && <p className={`message ${message.includes('✓') ? 'success' : 'error'}`}>{message}</p>}
        </div>
      )}

      <div className="reviews-section">
        <h3>User Reviews ({ratings.length})</h3>
        {ratings.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to rate!</p>
        ) : (
          <div className="reviews-list">
            {ratings.map((rating) => (
              <div key={rating.id} className="review-card">
                <div className="review-header">
                  <strong>{rating.tenant_name}</strong>
                  <div className="review-rating">
                    {renderStars(rating.rating)}
                    <span className="rating-number">{rating.rating}/5</span>
                  </div>
                </div>
                <p className="review-text">{rating.review || 'No comment provided.'}</p>
                <small className="review-date">{new Date(rating.created_at).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Ratings;
