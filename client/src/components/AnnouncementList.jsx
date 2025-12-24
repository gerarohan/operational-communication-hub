import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AnnouncementList.css';

function AnnouncementList() {
  const [announcements, setAnnouncements] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    audienceId: '',
    status: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [announcementsData, audiencesData] = await Promise.all([
        api.getAnnouncements(filters),
        api.getAudiences(),
      ]);
      setAnnouncements(announcementsData);
      setAudiences(audiencesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const getTypeBadgeClass = (type) => {
    const typeMap = {
      Info: 'badge-info',
      Operational: 'badge-operational',
      Urgent: 'badge-urgent',
    };
    return `badge ${typeMap[type] || ''}`;
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      Draft: 'badge-draft',
      Sent: 'badge-sent',
      Closed: 'badge-closed',
    };
    return `badge ${statusMap[status] || ''}`;
  };

  if (loading) {
    return <div className="loading">Loading announcements...</div>;
  }

  return (
    <div>
      <div className="card-header">
        <h1 className="card-title">Announcements</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/announcements/create')}
        >
          Create Announcement
        </button>
      </div>

      <div className="filters">
        <div className="filters-row">
          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Info">Info</option>
              <option value="Operational">Operational</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Audience</label>
            <select
              className="form-select"
              value={filters.audienceId}
              onChange={(e) => handleFilterChange('audienceId', e.target.value)}
            >
              <option value="">All Audiences</option>
              {audiences.map((audience) => (
                <option key={audience.id} value={audience.id}>
                  {audience.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="card">
          <p>No announcements found. Create your first announcement!</p>
        </div>
      ) : (
        announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="announcement-item"
            onClick={() => navigate(`/announcements/${announcement.id}`)}
          >
            <div className="announcement-header">
              <div>
                <h3 className="announcement-title">{announcement.title}</h3>
                <div className="announcement-meta">
                  <span className={getTypeBadgeClass(announcement.type)}>
                    {announcement.type}
                  </span>
                  <span className={getStatusBadgeClass(announcement.status)}>
                    {announcement.status}
                  </span>
                  {announcement.audience && (
                    <span>Audience: {announcement.audience.name}</span>
                  )}
                  <span>
                    Created: {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="announcement-body-preview">
              {announcement.body.substring(0, 200)}
              {announcement.body.length > 200 && '...'}
            </div>
            <div className="announcement-footer">
              <div className="ack-status">
                {announcement.expectedAction === 'Acknowledge' && (
                  <>
                    <span className="ack-count">
                      {announcement.acknowledgementCount || 0} acknowledged
                    </span>
                  </>
                )}
              </div>
              <div>
                Action Required: <strong>{announcement.expectedAction}</strong>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AnnouncementList;

