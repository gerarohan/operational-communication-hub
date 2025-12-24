const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Announcements
  async getAnnouncements(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });
    const query = queryParams.toString();
    return this.request(`/announcements${query ? `?${query}` : ''}`);
  }

  async getAnnouncement(id) {
    return this.request(`/announcements/${id}`);
  }

  async createAnnouncement(data) {
    return this.request('/announcements', {
      method: 'POST',
      body: data,
    });
  }

  async updateAnnouncement(id, data) {
    return this.request(`/announcements/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async sendAnnouncement(id) {
    return this.request(`/announcements/${id}/send`, {
      method: 'POST',
    });
  }

  async deleteAnnouncement(id) {
    return this.request(`/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  // Audiences
  async getAudiences() {
    return this.request('/audiences');
  }

  async getAudience(id) {
    return this.request(`/audiences/${id}`);
  }

  async createAudience(data) {
    return this.request('/audiences', {
      method: 'POST',
      body: data,
    });
  }

  async updateAudience(id, data) {
    return this.request(`/audiences/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteAudience(id) {
    return this.request(`/audiences/${id}`, {
      method: 'DELETE',
    });
  }

  // Acknowledgements
  async createAcknowledgement(data) {
    return this.request('/acknowledgements', {
      method: 'POST',
      body: data,
    });
  }

  async getAcknowledgements(announcementId) {
    return this.request(`/acknowledgements/announcement/${announcementId}`);
  }

  async checkAcknowledgement(announcementId, userId) {
    return this.request(`/acknowledgements/check/${announcementId}/${userId}`);
  }
}

export default new ApiService();

