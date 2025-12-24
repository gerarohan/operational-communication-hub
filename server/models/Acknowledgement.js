const { v4: uuidv4 } = require('uuid');
const { readAcknowledgements, writeAcknowledgements } = require('./database');

class Acknowledgement {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.announcementId = data.announcementId;
    this.userId = data.userId;
    this.userName = data.userName || 'Unknown';
    this.acknowledgedAt = data.acknowledgedAt || new Date().toISOString();
  }

  static async create(data) {
    const acknowledgement = new Acknowledgement(data);
    const acknowledgements = await readAcknowledgements();
    acknowledgements.push(acknowledgement);
    await writeAcknowledgements(acknowledgements);
    return acknowledgement;
  }

  static async findAll() {
    return await readAcknowledgements();
  }

  static async findByAnnouncementId(announcementId) {
    const acknowledgements = await readAcknowledgements();
    return acknowledgements.filter(a => a.announcementId === announcementId);
  }

  static async findByUserAndAnnouncement(userId, announcementId) {
    const acknowledgements = await readAcknowledgements();
    return acknowledgements.find(
      a => a.userId === userId && a.announcementId === announcementId
    );
  }

  static async delete(id) {
    const acknowledgements = await readAcknowledgements();
    const filtered = acknowledgements.filter(a => a.id !== id);
    await writeAcknowledgements(filtered);
    return true;
  }
}

module.exports = Acknowledgement;

