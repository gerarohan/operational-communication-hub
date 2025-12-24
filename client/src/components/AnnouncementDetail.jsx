import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadAnnouncement();
  }, [id]);

  const loadAnnouncement = async () => {
    try {
      setLoading(true);
      const data = await api.getAnnouncement(id);
      setAnnouncement(data);
    } catch (error) {
      setError(error.message || 'Failed to load announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (announcement.status === 'Sent') {
      setError('Announcement already sent');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSend = async () => {
    try {
      setLoading(true);
      setShowConfirmModal(false);
      await api.sendAnnouncement(id);
      await loadAnnouncement();
    } catch (error) {
      setError(error.message || 'Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      await api.updateAnnouncement(id, { status: 'Closed' });
      await loadAnnouncement();
    } catch (error) {
      setError(error.message || 'Failed to close announcement');
    }
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
    return <div className="loading">Loading announcement...</div>;
  }

  if (error && !announcement) {
    return <div className="error">{error}</div>;
  }

  if (!announcement) {
    return <div className="error">Announcement not found</div>;
  }

  return (
    <div>
      <div className="card-header">
        <h1 className="card-title">{announcement.title}</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/announcements')}
        >
          Back
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <span className={getTypeBadgeClass(announcement.type)}>
            {announcement.type}
          </span>
          <span
            className={getStatusBadgeClass(announcement.status)}
            style={{ marginLeft: '0.5rem' }}
          >
            {announcement.status}
          </span>
        </div>

        <div style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
          <p>
            <strong>Created:</strong>{' '}
            {new Date(announcement.createdAt).toLocaleString()}
          </p>
          {announcement.sentAt && (
            <p>
              <strong>Sent:</strong> {new Date(announcement.sentAt).toLocaleString()}
            </p>
          )}
          {announcement.audience && (
            <p>
              <strong>Audience:</strong> {announcement.audience.name}
            </p>
          )}
          <p>
            <strong>Action Required:</strong> {announcement.expectedAction}
          </p>
        </div>

        <div
          style={{
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            marginBottom: '1.5rem',
          }}
        >
          {announcement.body}
        </div>

        {announcement.status !== 'Sent' && announcement.status !== 'Closed' && (
          <div style={{ marginTop: '1.5rem' }}>
            <button className="btn btn-success" onClick={handleSend}>
              Send to Slack
            </button>
          </div>
        )}

        {announcement.status === 'Sent' && announcement.status !== 'Closed' && (
          <div style={{ marginTop: '1.5rem' }}>
            <button className="btn btn-secondary" onClick={handleClose}>
              Close Announcement
            </button>
          </div>
        )}
      </div>

      {announcement.expectedAction === 'Acknowledge' && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Acknowledgements</h2>
          {announcement.acknowledgements && announcement.acknowledgements.length > 0 ? (
            <div>
              <p style={{ marginBottom: '1rem' }}>
                <strong>
                  {announcement.acknowledgements.length} user(s) acknowledged
                </strong>
              </p>
              <ul>
                {announcement.acknowledgements.map((ack) => (
                  <li key={ack.id} style={{ marginBottom: '0.5rem' }}>
                    {ack.userName} ({ack.userId}) -{' '}
                    {new Date(ack.acknowledgedAt).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No acknowledgements yet.</p>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Send</h2>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to send this announcement to Slack? This
                action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-success" onClick={confirmSend}>
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnnouncementDetail;

