const { v4: uuidv4 } = require('uuid');
const { readAnnouncements, writeAnnouncements } = require('./database');

class Announcement {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.body = data.body;
    this.type = data.type; // 'Info' | 'Operational' | 'Urgent'
    this.expectedAction = data.expectedAction; // 'None' | 'Acknowledge'
    this.audienceId = data.audienceId;
    this.createdBy = data.createdBy || 'system';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.status = data.status || 'Draft'; // 'Draft' | 'Sent' | 'Closed'
    this.sentAt = data.sentAt || null;
    this.slackMessageIds = data.slackMessageIds || [];
  }

  static async create(data) {
    const announcement = new Announcement(data);
    const announcements = await readAnnouncements();
    announcements.push(announcement);
    await writeAnnouncements(announcements);
    return announcement;
  }

  static async findAll() {
    return await readAnnouncements();
  }

  static async findById(id) {
    const announcements = await readAnnouncements();
    return announcements.find(a => a.id === id);
  }

  static async update(id, updates) {
    const announcements = await readAnnouncements();
    const index = announcements.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Announcement not found');
    }
    announcements[index] = { ...announcements[index], ...updates };
    await writeAnnouncements(announcements);
    return announcements[index];
  }

  static async delete(id) {
    const announcements = await readAnnouncements();
    const filtered = announcements.filter(a => a.id !== id);
    await writeAnnouncements(filtered);
    return true;
  }

  validate() {
    if (!this.title || this.title.trim().length === 0) {
      throw new Error('Title is required');
    }
    if (!this.body || this.body.trim().length === 0) {
      throw new Error('Body is required');
    }
    if (!['Info', 'Operational', 'Urgent'].includes(this.type)) {
      throw new Error('Invalid type. Must be Info, Operational, or Urgent');
    }
    if (!['None', 'Acknowledge'].includes(this.expectedAction)) {
      throw new Error('Invalid expectedAction. Must be None or Acknowledge');
    }
    if (!this.audienceId) {
      throw new Error('Audience is required');
    }
    // Urgent announcements must have a title
    if (this.type === 'Urgent' && !this.title) {
      throw new Error('Urgent announcements require a title');
    }
    return true;
  }
}

module.exports = Announcement;

