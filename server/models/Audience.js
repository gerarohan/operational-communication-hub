const { v4: uuidv4 } = require('uuid');
const { readAudiences, writeAudiences } = require('./database');

class Audience {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.channels = data.channels || []; // Array of Slack channel IDs
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static async create(data) {
    const audience = new Audience(data);
    const audiences = await readAudiences();
    audiences.push(audience);
    await writeAudiences(audiences);
    return audience;
  }

  static async findAll() {
    return await readAudiences();
  }

  static async findById(id) {
    const audiences = await readAudiences();
    return audiences.find(a => a.id === id);
  }

  static async update(id, updates) {
    const audiences = await readAudiences();
    const index = audiences.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Audience not found');
    }
    audiences[index] = { ...audiences[index], ...updates };
    await writeAudiences(audiences);
    return audiences[index];
  }

  static async delete(id) {
    const audiences = await readAudiences();
    const filtered = audiences.filter(a => a.id !== id);
    await writeAudiences(filtered);
    return true;
  }

  validate() {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Audience name is required');
    }
    if (!Array.isArray(this.channels)) {
      throw new Error('Channels must be an array');
    }
    return true;
  }
}

module.exports = Audience;

