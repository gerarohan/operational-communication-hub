import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AnnouncementCreate() {
  const navigate = useNavigate();
  const [audiences, setAudiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'Info',
    expectedAction: 'None',
    audienceId: '',
  });

  useEffect(() => {
    loadAudiences();
  }, []);

  const loadAudiences = async () => {
    try {
      const data = await api.getAudiences();
      setAudiences(data);
      if (data.length > 0) {
        setFormData({ ...formData, audienceId: data[0].id });
      }
    } catch (error) {
      setError('Failed to load audiences');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.body.trim()) {
      setError('Body is required');
      return false;
    }
    if (!formData.audienceId) {
      setError('Please select an audience');
      return false;
    }
    if (formData.type === 'Urgent' && !formData.title.trim()) {
      setError('Urgent announcements require a title');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await api.createAnnouncement(formData);
      navigate('/announcements');
    } catch (error) {
      setError(error.message || 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    // Safety guard: Show confirmation modal
    setShowConfirmModal(true);
  };

  const confirmSend = async () => {
    try {
      setLoading(true);
      setShowConfirmModal(false);
      const announcement = await api.createAnnouncement(formData);
      await api.sendAnnouncement(announcement.id);
      navigate('/announcements');
    } catch (error) {
      setError(error.message || 'Failed to send announcement');
      setLoading(false);
    }
  };

  const renderPreview = () => {
    if (!showPreview) return null;

    return (
      <div className="preview-panel">
        <h3 className="preview-title">Preview</h3>
        <div className="card">
          <h2>{formData.title || '(No title)'}</h2>
          <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
            {formData.body || '(No body)'}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <span className={`badge badge-${formData.type.toLowerCase()}`}>
              {formData.type}
            </span>
            <span style={{ marginLeft: '1rem' }}>
              Action: {formData.expectedAction}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="card-header">
        <h1 className="card-title">Create Announcement</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/announcements')}
        >
          Cancel
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input
            type="text"
            className="form-input"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter announcement title"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Body *</label>
          <textarea
            className="form-textarea"
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="Enter announcement body (supports Slack markdown)"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Type *</label>
          <select
            className="form-select"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="Info">Info</option>
            <option value="Operational">Operational</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Expected Action *</label>
          <select
            className="form-select"
            name="expectedAction"
            value={formData.expectedAction}
            onChange={handleChange}
          >
            <option value="None">None</option>
            <option value="Acknowledge">Acknowledge</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Audience *</label>
          <select
            className="form-select"
            name="audienceId"
            value={formData.audienceId}
            onChange={handleChange}
          >
            <option value="">Select an audience</option>
            {audiences.map((audience) => (
              <option key={audience.id} value={audience.id}>
                {audience.name} ({audience.channels?.length || 0} channels)
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            Save as Draft
          </button>
          <button
            className="btn btn-success"
            onClick={handleSend}
            disabled={loading}
          >
            Send to Slack
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>

      {renderPreview()}

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
              <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                Title: {formData.title}
              </p>
              <p>
                Audience: {audiences.find((a) => a.id === formData.audienceId)?.name}
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

export default AnnouncementCreate;

