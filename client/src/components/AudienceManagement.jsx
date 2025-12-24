import React, { useState, useEffect } from 'react';
import api from '../services/api';

function AudienceManagement() {
  const [audiences, setAudiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    channels: '',
  });

  useEffect(() => {
    loadAudiences();
  }, []);

  const loadAudiences = async () => {
    try {
      setLoading(true);
      const data = await api.getAudiences();
      setAudiences(data);
    } catch (error) {
      setError('Failed to load audiences');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const channels = formData.channels
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      if (editingId) {
        await api.updateAudience(editingId, {
          name: formData.name,
          channels: channels,
        });
      } else {
        await api.createAudience({
          name: formData.name,
          channels: channels,
        });
      }

      setFormData({ name: '', channels: '' });
      setShowForm(false);
      setEditingId(null);
      await loadAudiences();
    } catch (error) {
      setError(error.message || 'Failed to save audience');
    }
  };

  const handleEdit = (audience) => {
    setFormData({
      name: audience.name,
      channels: audience.channels.join(', '),
    });
    setEditingId(audience.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this audience?')) {
      return;
    }

    try {
      await api.deleteAudience(id);
      await loadAudiences();
    } catch (error) {
      setError(error.message || 'Failed to delete audience');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', channels: '' });
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) {
    return <div className="loading">Loading audiences...</div>;
  }

  return (
    <div>
      <div className="card-header">
        <h1 className="card-title">Audience Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Create Audience
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>
            {editingId ? 'Edit Audience' : 'Create Audience'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Audience Name *</label>
              <input
                type="text"
                className="form-input"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., All Stores, Engineering Team"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Slack Channel IDs (comma-separated) *
              </label>
              <input
                type="text"
                className="form-input"
                name="channels"
                value={formData.channels}
                onChange={handleChange}
                placeholder="e.g., C1234567890, C0987654321"
                required
              />
              <small style={{ color: '#7f8c8d', marginTop: '0.5rem', display: 'block' }}>
                To find channel IDs, right-click on a Slack channel → View channel
                details → Copy the Channel ID
              </small>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {audiences.length === 0 ? (
        <div className="card">
          <p>No audiences configured. Create your first audience!</p>
        </div>
      ) : (
        audiences.map((audience) => (
          <div key={audience.id} className="card">
            <div className="card-header">
              <h3>{audience.name}</h3>
              <div>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleEdit(audience)}
                  style={{ marginRight: '0.5rem' }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(audience.id)}
                >
                  Delete
                </button>
              </div>
            </div>
            <div>
              <p>
                <strong>Channels:</strong>{' '}
                {audience.channels.length > 0
                  ? audience.channels.join(', ')
                  : 'No channels configured'}
              </p>
              <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>
                Created: {new Date(audience.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AudienceManagement;

