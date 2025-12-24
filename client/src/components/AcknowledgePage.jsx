import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function AcknowledgePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [alreadyAcknowledged, setAlreadyAcknowledged] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get or generate user ID (in production, this would come from auth)
    const storedUserId = localStorage.getItem('userId') || `user-${Date.now()}`;
    localStorage.setItem('userId', storedUserId);
    setUserId(storedUserId);

    loadAnnouncement();
    checkAcknowledgement(storedUserId);
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

  const checkAcknowledgement = async (userId) => {
    try {
      const result = await api.checkAcknowledgement(id, userId);
      if (result.acknowledged) {
        setAlreadyAcknowledged(true);
      }
    } catch (error) {
      // Ignore errors for check
    }
  };

  const handleAcknowledge = async () => {
    try {
      setAcknowledging(true);
      setError('');
      await api.createAcknowledgement({
        announcementId: id,
        userId: userId,
        userName: userId, // In production, get from auth
      });
      setSuccess(true);
      setAlreadyAcknowledged(true);
    } catch (error) {
      if (error.message.includes('Already acknowledged')) {
        setAlreadyAcknowledged(true);
      } else {
        setError(error.message || 'Failed to acknowledge');
      }
    } finally {
      setAcknowledging(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading announcement...</div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="container">
        <div className="error">Announcement not found</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="card-title">{announcement.title}</h1>

        {error && <div className="error">{error}</div>}
        {success && (
          <div className="success">
            Thank you! Your acknowledgement has been recorded.
          </div>
        )}

        <div
          style={{
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            marginBottom: '1.5rem',
            marginTop: '1.5rem',
          }}
        >
          {announcement.body}
        </div>

        <div style={{ marginBottom: '1.5rem', color: '#7f8c8d' }}>
          <p>
            <strong>Type:</strong> {announcement.type}
          </p>
          <p>
            <strong>Created:</strong>{' '}
            {new Date(announcement.createdAt).toLocaleString()}
          </p>
        </div>

        {announcement.expectedAction === 'Acknowledge' && (
          <div>
            {alreadyAcknowledged ? (
              <div className="success">
                <p>You have already acknowledged this announcement.</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/announcements')}
                  style={{ marginTop: '1rem' }}
                >
                  View All Announcements
                </button>
              </div>
            ) : (
              <div>
                <p style={{ marginBottom: '1rem' }}>
                  Please acknowledge that you have read and understood this
                  announcement.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={handleAcknowledge}
                  disabled={acknowledging}
                >
                  {acknowledging ? 'Acknowledging...' : 'Acknowledge'}
                </button>
              </div>
            )}
          </div>
        )}

        {announcement.expectedAction === 'None' && (
          <div>
            <p>No acknowledgement required for this announcement.</p>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/announcements')}
              style={{ marginTop: '1rem' }}
            >
              View All Announcements
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AcknowledgePage;

