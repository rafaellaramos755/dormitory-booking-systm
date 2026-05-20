import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaBell, FaCalendarAlt, FaMoneyBillWave, FaClock, FaCheckDouble } from 'react-icons/fa';

function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://localhost/backend/api';

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/get.php?limit=50`, {
        withCredentials: true
      });
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`${API_URL}/notifications/mark_read.php`, { notification_id: notificationId }, {
        withCredentials: true
      });
      fetchNotifications();
      window.dispatchEvent(new Event('refreshUnreadCount'));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`${API_URL}/notifications/mark_read.php`, { mark_all: true }, {
        withCredentials: true
      });
      fetchNotifications();
      window.dispatchEvent(new Event('refreshUnreadCount'));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (window.confirm('Delete this notification?')) {
      try {
        await axios.delete(`${API_URL}/notifications/delete.php`, {
          data: { notification_id: notificationId },
          withCredentials: true
        });
        fetchNotifications();
        window.dispatchEvent(new Event('refreshUnreadCount'));
      } catch (error) {
        console.error('Failed to delete notification', error);
      }
    }
  };

  const getNotificationLink = (notif, userType) => {
    if (notif.type === 'booking') {
      return userType === 'owner' ? '/owner-bookings' : '/my-bookings';
    }
    if (notif.type === 'payment') {
      return userType === 'owner' ? '/owner-payments' : '/my-payments';
    }
    if (notif.type === 'due_date') {
      return '/my-payments';
    }
    return '#';
  };

  const handleNotificationClick = (notif) => {
    const link = getNotificationLink(notif, user?.user_type);
    if (link !== '#') {
      markAsRead(notif.id);
      navigate(link);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'booking': return <FaCalendarAlt />;
      case 'payment': return <FaMoneyBillWave />;
      case 'due_date': return <FaClock />;
      default: return <FaBell />;
    }
  };

  if (loading) return <LoadingSpinner />;

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const hasUnread = unreadNotifications.length > 0;

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1>Notifications</h1>
        {hasUnread && (
          <button onClick={markAllAsRead} className="mark-all-btn">
            <FaCheckDouble /> Mark all as read ({unreadNotifications.length})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notif)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notif.type)}
              </div>
              <div className="notification-content">
                <strong>{notif.title}</strong>
                <p>{notif.message}</p>
                <small>{new Date(notif.created_at).toLocaleString()}</small>
              </div>
              <button 
                className="delete-notif" 
                onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;