import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { FaUsers, FaBuilding, FaCheckCircle, FaBullhorn, FaFlag, FaTachometerAlt, FaSearch, FaFilter, FaTrash, FaPlus, FaBan, FaUserCheck } from 'react-icons/fa';

function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Overview stats
  const [stats, setStats] = useState({});
  
  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userType, setUserType] = useState('all');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  
  // Applications state
  const [applications, setApplications] = useState([]);
  const [appSearch, setAppSearch] = useState('');
  const [appStatus, setAppStatus] = useState('pending');
  const [appPage, setAppPage] = useState(1);
  const [appTotalPages, setAppTotalPages] = useState(1);
  const [showAppModal, setShowAppModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  
  // Image Viewer state
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [currentDocType, setCurrentDocType] = useState('');
  
  // Dormitories state
  const [dorms, setDorms] = useState([]);
  const [dormSearch, setDormSearch] = useState('');
  const [dormStatus, setDormStatus] = useState('all');
  const [dormPage, setDormPage] = useState(1);
  const [dormTotalPages, setDormTotalPages] = useState(1);
  
  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  
  // Reports state
  const [reports, setReports] = useState([]);
  const [reportSearch, setReportSearch] = useState('');
  const [reportStatus, setReportStatus] = useState('pending');
  const [reportPage, setReportPage] = useState(1);
  const [reportTotalPages, setReportTotalPages] = useState(1);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  const API_URL = 'http://localhost/backend/api';

  // Safety timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ Loading timeout - forcing loading to false");
        setLoading(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  // Fetch functions
  const fetchStats = useCallback(async () => {
    if (activeTab !== 'overview') return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/get_stats.php`, { withCredentials: true });
      setStats(res.data.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({});
    } finally {
      setLoading(false);
    }
  }, [API_URL, activeTab]);

  const fetchUsers = useCallback(async () => {
    if (activeTab !== 'users') return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/get_users.php`, {
        params: { search: userSearch, type: userType, page: userPage, limit: 15 },
        withCredentials: true
      });
      setUsers(res.data.data || []);
      setUserTotalPages(res.data.total_pages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, activeTab, userSearch, userType, userPage]);

  const fetchApplications = useCallback(async () => {
    if (activeTab !== 'verification') return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/get_applications.php`, {
        params: { status: appStatus, search: appSearch, page: appPage, limit: 15 },
        withCredentials: true
      });
      setApplications(res.data.data || []);
      setAppTotalPages(res.data.total_pages || 1);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, activeTab, appStatus, appSearch, appPage]);

  const fetchDormitories = useCallback(async () => {
    if (activeTab !== 'dormitories') return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/get_all_dormitories.php`, {
        params: { search: dormSearch, status: dormStatus, page: dormPage, limit: 15 },
        withCredentials: true
      });
      setDorms(res.data.data || []);
      setDormTotalPages(res.data.total_pages || 1);
    } catch (error) {
      console.error('Error fetching dormitories:', error);
      setDorms([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, activeTab, dormSearch, dormStatus, dormPage]);

  const fetchAnnouncements = useCallback(async () => {
    if (activeTab !== 'announcements') return;
    try {
      const res = await axios.get(`${API_URL}/admin/get_announcement.php`, { withCredentials: true });
      setAnnouncements(res.data.data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    }
  }, [API_URL, activeTab]);

  const fetchReports = useCallback(async () => {
  if (activeTab !== 'reports') return;
  setLoading(true);
  try {
    const res = await axios.get(`${API_URL}/admin/get_reports.php`, {
      params: { 
        status: reportStatus, 
        search: reportSearch, 
        page: reportPage, 
        limit: 15 
      },
      withCredentials: true
    });
    console.log("Reports response:", res.data); // DEBUG
    setReports(res.data.data || []);
    setReportTotalPages(res.data.total_pages || 1);
  } catch (error) {
    console.error('Error fetching reports:', error);
    setReports([]);
  } finally {
    setLoading(false);
  }
}, [API_URL, activeTab, reportStatus, reportSearch, reportPage]);

  // Auto refresh
  const refreshCurrentTab = useCallback(async () => {
    switch (activeTab) {
      case 'overview': await fetchStats(); break;
      case 'users': await fetchUsers(); break;
      case 'verification': await fetchApplications(); break;
      case 'dormitories': await fetchDormitories(); break;
      case 'announcements': await fetchAnnouncements(); break;
      case 'reports': await fetchReports(); break;
      default: break;
    }
  }, [activeTab, fetchStats, fetchUsers, fetchApplications, fetchDormitories, fetchAnnouncements, fetchReports]);

  useAutoRefresh(refreshCurrentTab, 15000);

  useEffect(() => {
    refreshCurrentTab();
  }, [refreshCurrentTab]);

  // Actions
  const toggleBan = async (userId, currentBan) => {
    if (!currentBan) {
      const reason = prompt("Enter ban reason:");
      if (!reason || reason.trim() === '') {
        alert("Ban reason is required.");
        return;
      }
      try {
        await axios.post(`${API_URL}/admin/toggle_ban.php`, { user_id: userId, ban: true, ban_reason: reason }, { withCredentials: true });
        fetchUsers();
      } catch (error) {
        alert('Failed to ban user');
      }
    } else {
      if (window.confirm('Unban this user?')) {
        try {
          await axios.post(`${API_URL}/admin/toggle_ban.php`, { user_id: userId, ban: false }, { withCredentials: true });
          fetchUsers();
        } catch (error) {
          alert('Failed to unban user');
        }
      }
    }
  };

  const approveApplication = async (appId, remarks) => {
    try {
      await axios.post(`${API_URL}/admin/approve_application.php`, { application_id: appId, remarks }, { withCredentials: true });
      alert('Dormitory approved!');
      fetchApplications();
      setShowAppModal(false);
    } catch (error) {
      alert('Failed to approve');
    }
  };

  const rejectApplication = async (appId, remarks) => {
    try {
      await axios.post(`${API_URL}/admin/reject_application.php`, { application_id: appId, remarks }, { withCredentials: true });
      alert('Application rejected');
      fetchApplications();
      setShowAppModal(false);
    } catch (error) {
      alert('Failed to reject');
    }
  };

  const toggleDormStatus = async (dormId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`Set this dormitory to ${newStatus}?`)) return;
    try {
      await axios.post(`${API_URL}/admin/toggle_dorm_status.php`, { dormitory_id: dormId, status: newStatus }, { withCredentials: true });
      fetchDormitories();
    } catch (error) {
      alert('Failed to update dorm status');
    }
  };

  const postAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert('Please fill title and content');
      return;
    }
    try {
      await axios.post(`${API_URL}/admin/post_announcement.php`, newAnnouncement, { withCredentials: true });
      alert('Announcement posted');
      setNewAnnouncement({ title: '', content: '' });
      fetchAnnouncements();
    } catch (error) {
      alert('Failed to post');
    }
  };

  const deleteAnnouncement = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await axios.delete(`${API_URL}/admin/delete_announcement.php`, { data: { id }, withCredentials: true });
        fetchAnnouncements();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const resolveReport = async (reportId, action, notes) => {
    try {
      await axios.post(`${API_URL}/admin/resolve_report.php`, { report_id: reportId, action, admin_notes: notes }, { withCredentials: true });
      alert('Report resolved');
      fetchReports();
      setShowReportModal(false);
    } catch (error) {
      alert('Failed');
    }
  };

  const goToUsersWithType = (type) => {
    setActiveTab('users');
    setUserType(type);
    setUserPage(1);
  };

  const goToVerifications = (status) => {
    setActiveTab('verification');
    setAppStatus(status);
    setAppPage(1);
  };

  const goToDormsWithStatus = (status) => {
    setActiveTab('dormitories');
    setDormStatus(status);
    setDormPage(1);
  };

  const goToReportsWithStatus = (status) => {
    setActiveTab('reports');
    setReportStatus(status);
    setReportPage(1);
  };
  const banReportedUser = async (userId, reportId, notes) => {
  try {
    // Ban the user
    const banResponse = await axios.post(`${API_URL}/admin/toggle_ban.php`, 
      { user_id: userId, ban: true, ban_reason: "Banned due to report: " + notes }, 
      { withCredentials: true }
    );
    
    if (banResponse.data.success) {
      // Update report status
      await axios.post(`${API_URL}/admin/resolve_report.php`, 
        { report_id: reportId, action: 'resolved', admin_notes: "User banned. " + notes }, 
        { withCredentials: true }
      );
      alert('User has been banned and report resolved');
      fetchReports();
      setShowReportModal(false);
    } else {
      alert('Failed to ban user');
    }
  } catch (error) {
    console.error('Error banning user:', error);
    alert('Failed to ban user');
  }
};

  if (user?.user_type !== 'admin') return <Navigate to="/dashboard" />;
  if (loading && activeTab !== 'announcements') return <LoadingSpinner />;

  const totalTenants = (stats.total_users || 0) - (stats.total_owners || 0);

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <div className="admin-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
          <FaTachometerAlt /> Overview
        </button>
        <button className={activeTab === 'verification' ? 'active' : ''} onClick={() => { setActiveTab('verification'); setAppPage(1); }}>
          <FaCheckCircle /> Verification
        </button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => { setActiveTab('users'); setUserPage(1); }}>
          <FaUsers /> Users
        </button>
        <button className={activeTab === 'dormitories' ? 'active' : ''} onClick={() => { setActiveTab('dormitories'); setDormPage(1); }}>
          <FaBuilding /> Dormitories
        </button>
        <button className={activeTab === 'announcements' ? 'active' : ''} onClick={() => setActiveTab('announcements')}>
          <FaBullhorn /> Announcements
        </button>
        <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => { setActiveTab('reports'); setReportPage(1); }}>
          <FaFlag /> Reports
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="stats-grid">
          <div className="stat-card" onClick={() => goToUsersWithType('tenant')} style={{ cursor: 'pointer' }}>
            <h3>Total Tenants</h3>
            <p className="stat-number">{totalTenants}</p>
          </div>
          <div className="stat-card" onClick={() => goToUsersWithType('owner')} style={{ cursor: 'pointer' }}>
            <h3>Total Owners</h3>
            <p className="stat-number">{stats.total_owners || 0}</p>
          </div>
          <div className="stat-card" onClick={() => goToVerifications('pending')} style={{ cursor: 'pointer' }}>
            <h3>Pending Verifications</h3>
            <p className="stat-number">{stats.pending_verifications || 0}</p>
          </div>
          <div className="stat-card" onClick={() => goToDormsWithStatus('active')} style={{ cursor: 'pointer' }}>
            <h3>Active Dorms</h3>
            <p className="stat-number">{stats.active_dorms || 0}</p>
          </div>
          <div className="stat-card" onClick={() => goToDormsWithStatus('inactive')} style={{ cursor: 'pointer' }}>
            <h3>Inactive Dorms</h3>
            <p className="stat-number">{stats.inactive_dorms || 0}</p>
          </div>
          <div className="stat-card" onClick={() => goToReportsWithStatus('pending')} style={{ cursor: 'pointer' }}>
            <h3>Pending Reports</h3>
            <p className="stat-number">{stats.pending_reports || 0}</p>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="admin-filters">
            <div className="search-box"><FaSearch /> <input type="text" placeholder="Search by name or email" value={userSearch} onChange={e => setUserSearch(e.target.value)} /></div>
            <div className="filter-box"><FaFilter /> <select value={userType} onChange={e => setUserType(e.target.value)}><option value="all">All Types</option><option value="tenant">Tenant</option><option value="owner">Owner</option></select></div>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Name</th><th>Email</th><th>Type</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.user_type}</td>
                    <td>{u.is_banned ? 'Banned' : 'Active'}</td>
                    <td>{u.user_type === 'owner' && (<button onClick={() => toggleBan(u.id, u.is_banned)} className={u.is_banned ? 'unban-btn' : 'ban-btn'}>{u.is_banned ? <FaUserCheck /> : <FaBan />} {u.is_banned ? 'Unban' : 'Ban'}</button>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)}>Previous</button>
            <span>Page {userPage} of {userTotalPages}</span>
            <button disabled={userPage === userTotalPages} onClick={() => setUserPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* Verification Tab */}
      {activeTab === 'verification' && (
        <div>
          <div className="admin-filters">
            <div className="search-box"><FaSearch /> <input type="text" placeholder="Search by dorm name or owner" value={appSearch} onChange={e => setAppSearch(e.target.value)} /></div>
            <div className="filter-box"><FaFilter /> <select value={appStatus} onChange={e => setAppStatus(e.target.value)}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></div>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Dorm Name</th><th>Owner</th><th>Price</th><th>Documents</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td>{app.id}</td>
                    <td>{app.name}</td>
                    <td>{app.owner_name}<br/><small>{app.owner_email}</small></td>
                    <td>₱{Number(app.price_per_month).toLocaleString()}</td>
                    <td className="documents-cell">
                      <div className="document-links">
                        {app.business_permit && (<button onClick={() => { setCurrentImageUrl(`http://localhost/backend/${app.business_permit}`); setCurrentDocType('Business Permit'); setShowImageViewer(true); }} className="doc-link"><svg className="doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Permit</button>)}
                        {app.barangay_clearance && (<button onClick={() => { setCurrentImageUrl(`http://localhost/backend/${app.barangay_clearance}`); setCurrentDocType('Barangay Clearance'); setShowImageViewer(true); }} className="doc-link"><svg className="doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Barangay</button>)}
                        {app.gov_id && (<button onClick={() => { setCurrentImageUrl(`http://localhost/backend/${app.gov_id}`); setCurrentDocType('Government ID'); setShowImageViewer(true); }} className="doc-link"><svg className="doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>ID</button>)}
                        {app.utility_bill && (<button onClick={() => { setCurrentImageUrl(`http://localhost/backend/${app.utility_bill}`); setCurrentDocType('Utility Bill'); setShowImageViewer(true); }} className="doc-link"><svg className="doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>Bill</button>)}
                      </div>
                    </td>
                    <td>{app.status}</td>
                    <td>{app.status === 'pending' && <button onClick={() => { setSelectedApp(app); setShowAppModal(true); }} className="verify-btn">Review</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button disabled={appPage === 1} onClick={() => setAppPage(p => p - 1)}>Previous</button>
            <span>Page {appPage} of {appTotalPages}</span>
            <button disabled={appPage === appTotalPages} onClick={() => setAppPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* Dormitories Tab */}
      {activeTab === 'dormitories' && (
        <div>
          <div className="admin-filters">
            <div className="search-box"><FaSearch /> <input type="text" placeholder="Search by name or location" value={dormSearch} onChange={e => setDormSearch(e.target.value)} /></div>
            <div className="filter-box"><FaFilter /> <select value={dormStatus} onChange={e => setDormStatus(e.target.value)}><option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Name</th><th>Owner</th><th>Location</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {dorms.map(d => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.name}</td>
                    <td>{d.owner_name}</td>
                    <td>{d.location}</td>
                    <td>{d.status === 'active' ? 'Active' : 'Inactive'}</td>
                    <td><button onClick={() => toggleDormStatus(d.id, d.status)} className="toggle-status-btn">{d.status === 'active' ? 'Deactivate' : 'Activate'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button disabled={dormPage === 1} onClick={() => setDormPage(p => p - 1)}>Previous</button>
            <span>Page {dormPage} of {dormTotalPages}</span>
            <button disabled={dormPage === dormTotalPages} onClick={() => setDormPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div>
          <div className="announcement-form">
            <input type="text" placeholder="Title" value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} />
            <textarea placeholder="Content" rows="3" value={newAnnouncement.content} onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} />
            <button onClick={postAnnouncement}><FaPlus /> Post Announcement</button>
          </div>
          <div className="announcements-list">
            {announcements.map(ann => (
              <div key={ann.id} className="announcement-card">
                <div className="announcement-header"><strong>{ann.title}</strong><button onClick={() => deleteAnnouncement(ann.id)}><FaTrash /></button></div>
                <p>{ann.content}</p>
                <small>Posted by {ann.admin_name} on {new Date(ann.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div>
          <div className="admin-filters">
            <div className="search-box"><FaSearch /> <input type="text" placeholder="Search by reporter or reported" value={reportSearch} onChange={e => setReportSearch(e.target.value)} /></div>
            <div className="filter-box"><FaFilter /> <select value={reportStatus} onChange={e => setReportStatus(e.target.value)}><option value="pending">Pending</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select></div>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Reporter</th><th>Reported User</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.reporter_name}</td>
                    <td>{r.reported_name}</td>
                    <td>{r.reason}</td>
                    <td>{r.status}</td>
                    <td>{r.status === 'pending' && <button onClick={() => { setSelectedReport(r); setShowReportModal(true); }} className="verify-btn">Review</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button disabled={reportPage === 1} onClick={() => setReportPage(p => p - 1)}>Previous</button>
            <span>Page {reportPage} of {reportTotalPages}</span>
            <button disabled={reportPage === reportTotalPages} onClick={() => setReportPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* Review Application Modal */}
      {showAppModal && selectedApp && (
        <div className="modal-overlay" onClick={() => setShowAppModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review Dormitory Application</h3>
              <button className="modal-close" onClick={() => setShowAppModal(false)}>&times;</button>
            </div>
       <div className="modal-body">
  {/* Info Section */}
  <div className="info-section">
    {/* Row 1: Dormitory Name & Owner */}
    <div className="info-row two-cols">
      <div className="info-field">
        <span className="info-label">DORMITORY NAME</span>
        <p className="info-value">{selectedApp.name}</p>
      </div>
      <div className="info-field">
        <span className="info-label">OWNER</span>
        <p className="info-value">{selectedApp.owner_name}</p>
        <span className="info-sub">{selectedApp.owner_email}</span>
      </div>
    </div>

    {/* Row 2: Location, Price, Deposit, Rooms */}
    <div className="info-row four-cols">
      <div className="info-field">
        <span className="info-label">LOCATION</span>
        <p className="info-value">{selectedApp.location}</p>
      </div>
      <div className="info-field">
        <span className="info-label">PRICE PER MONTH</span>
        <p className="info-value">₱{Number(selectedApp.price_per_month).toLocaleString()}</p>
      </div>
      <div className="info-field">
        <span className="info-label">DEPOSIT AMOUNT</span>
        <p className="info-value">₱{Number(selectedApp.deposit_amount).toLocaleString()}</p>
      </div>
      <div className="info-field">
        <span className="info-label">TOTAL ROOMS</span>
        <p className="info-value">{selectedApp.total_rooms}</p>
      </div>
    </div>
  </div>

  {/* Description Section */}
  {selectedApp.description && (
    <div className="description-section">
      <span className="info-label">DESCRIPTION</span>
      <p className="description-text">{selectedApp.description}</p>
    </div>
  )}

  {/* Documents Section */}
  <div className="documents-section">
    <div className="documents-header">
      <h4>PROOF DOCUMENTS</h4>
    </div>
    <div className="documents-list">
      {selectedApp.business_permit && (
        <a href={`http://localhost/backend/${selectedApp.business_permit}`} target="_blank" rel="noopener noreferrer" className="doc-badge">
          📄 Business Permit
        </a>
      )}
      {selectedApp.barangay_clearance && (
        <a href={`http://localhost/backend/${selectedApp.barangay_clearance}`} target="_blank" rel="noopener noreferrer" className="doc-badge">
          📄 Barangay Clearance
        </a>
      )}
      {selectedApp.gov_id && (
        <a href={`http://localhost/backend/${selectedApp.gov_id}`} target="_blank" rel="noopener noreferrer" className="doc-badge">
          🪪 Government ID
        </a>
      )}
      {selectedApp.utility_bill && (
        <a href={`http://localhost/backend/${selectedApp.utility_bill}`} target="_blank" rel="noopener noreferrer" className="doc-badge">
          💡 Utility Bill
        </a>
      )}
    </div>
  </div>

  {/* Remarks Section */}
  <div className="remarks-section">
    <label>ADMIN REMARKS</label>
    <textarea 
      value={adminRemarks} 
      onChange={(e) => setAdminRemarks(e.target.value)} 
      rows="3"
      placeholder="Type your remarks here..."
    />
  </div>
</div>
            <div className="modal-footer">
              <button onClick={() => approveApplication(selectedApp.id, adminRemarks)} className="btn-approve">Approve</button>
              <button onClick={() => rejectApplication(selectedApp.id, adminRemarks)} className="btn-reject">Reject</button>
              <button onClick={() => setShowAppModal(false)} className="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
{/* Review Report Modal */}
{showReportModal && selectedReport && (
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
  }} onClick={() => setShowReportModal(false)}>
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
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 24px',
        background: '#1e293b'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'white' }}>Review Report</h3>
        <button style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          fontSize: '22px',
          cursor: 'pointer',
          color: 'white',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setShowReportModal(false)}>&times;</button>
      </div>
      
      <div style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        background: '#f8fafc'
      }}>
        
        {/* Reporter and Reported User */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>REPORTER</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{selectedReport.reporter_name}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{selectedReport.reporter_email}</div>
          </div>
          <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>REPORTED USER</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{selectedReport.reported_name}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{selectedReport.reported_email}</div>
          </div>
        </div>
        
        {/* Dormitory and Date */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>DORMITORY</div>
            <div style={{ fontSize: '15px', fontWeight: '500', color: '#0f172a' }}>{selectedReport.dorm_name || 'N/A'}</div>
          </div>
          <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>DATE</div>
            <div style={{ fontSize: '15px', fontWeight: '500', color: '#0f172a' }}>{new Date(selectedReport.created_at).toLocaleString()}</div>
          </div>
        </div>
        
        {/* Reason */}
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>REASON</div>
          <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>{selectedReport.reason}</div>
        </div>
        
        {/* Description */}
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>DESCRIPTION</div>
          <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>{selectedReport.description}</div>
        </div>
        
        {/* Evidence */}
        {selectedReport.evidence_url && (
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600'}}>EVIDENCE</div>
            <a href={`http://localhost/backend/${selectedReport.evidence_url}`} target="_blank" rel="noopener noreferrer" style={{ background: 'white', padding: '8px 16px', borderRadius: '30px', textDecoration: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: '500', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              📄 View Evidence
            </a>
          </div>
        )}
        
        {/* Admin Notes */}
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>ADMIN NOTES</div>
          <textarea id="adminNotes" rows="3" placeholder="Type your notes here..." style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        padding: '16px 24px',
        background: 'white',
        borderTop: '1px solid #e2e8f0'
      }}>
        <button
          onClick={() => { 
            const notes = document.getElementById('adminNotes').value; 
            resolveReport(selectedReport.id, 'resolve', notes); 
          }}
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
          Resolve
        </button>
        <button
          onClick={() => { 
            const notes = document.getElementById('adminNotes').value; 
            resolveReport(selectedReport.id, 'dismiss', notes); 
          }}
          style={{
            background: '#94a3b8',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '40px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Dismiss
        </button>
        <button
          onClick={() => { 
            const notes = document.getElementById('adminNotes').value; 
            if (window.confirm(`Ban user ${selectedReport.reported_name}? This will prevent them from using the platform.`)) {
              banReportedUser(selectedReport.reported_user_id, selectedReport.id, notes);
            }
          }}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '40px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Ban User
        </button>
        <button
          onClick={() => setShowReportModal(false)}
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

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <div className="modal-overlay" onClick={() => setShowImageViewer(false)}>
          <div className="image-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <h3>{currentDocType}</h3>
              <button className="modal-close" onClick={() => setShowImageViewer(false)}>&times;</button>
            </div>
            <div className="image-modal-body">
              {currentImageUrl && currentImageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={currentImageUrl} alt="Document" className="document-image" />
              ) : (
                <iframe src={currentImageUrl} title="Document" className="document-iframe"></iframe>
              )}
            </div>
            <div className="image-modal-footer">
              <a href={currentImageUrl} download className="download-btn">Download</a>
              <button onClick={() => setShowImageViewer(false)} className="close-btn">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;