const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');
const AUDIENCES_FILE = path.join(DATA_DIR, 'audiences.json');
const ACKNOWLEDGEMENTS_FILE = path.join(DATA_DIR, 'acknowledgements.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Initialize files if they don't exist
async function initializeFiles() {
  await ensureDataDir();
  
  try {
    await fs.access(ANNOUNCEMENTS_FILE);
  } catch {
    await fs.writeFile(ANNOUNCEMENTS_FILE, JSON.stringify([], null, 2));
  }
  
  try {
    await fs.access(AUDIENCES_FILE);
  } catch {
    const defaultAudiences = [
      {
        id: 'default-all',
        name: 'All Teams',
        channels: [],
        createdAt: new Date().toISOString()
      }
    ];
    await fs.writeFile(AUDIENCES_FILE, JSON.stringify(defaultAudiences, null, 2));
  }
  
  try {
    await fs.access(ACKNOWLEDGEMENTS_FILE);
  } catch {
    await fs.writeFile(ACKNOWLEDGEMENTS_FILE, JSON.stringify([], null, 2));
  }
}

// Read data
async function readAnnouncements() {
  await initializeFiles();
  const data = await fs.readFile(ANNOUNCEMENTS_FILE, 'utf8');
  return JSON.parse(data);
}

async function readAudiences() {
  await initializeFiles();
  const data = await fs.readFile(AUDIENCES_FILE, 'utf8');
  return JSON.parse(data);
}

async function readAcknowledgements() {
  await initializeFiles();
  const data = await fs.readFile(ACKNOWLEDGEMENTS_FILE, 'utf8');
  return JSON.parse(data);
}

// Write data
async function writeAnnouncements(data) {
  await initializeFiles();
  await fs.writeFile(ANNOUNCEMENTS_FILE, JSON.stringify(data, null, 2));
}

async function writeAudiences(data) {
  await ensureDataDir();
  await fs.writeFile(AUDIENCES_FILE, JSON.stringify(data, null, 2));
}

async function writeAcknowledgements(data) {
  await ensureDataDir();
  await fs.writeFile(ACKNOWLEDGEMENTS_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  readAnnouncements,
  writeAnnouncements,
  readAudiences,
  writeAudiences,
  readAcknowledgements,
  writeAcknowledgements
};

