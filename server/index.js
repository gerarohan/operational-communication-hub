const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const announcementRoutes = require('./routes/announcements');
const audienceRoutes = require('./routes/audiences');
const acknowledgementRoutes = require('./routes/acknowledgements');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/announcements', announcementRoutes);
app.use('/api/audiences', audienceRoutes);
app.use('/api/acknowledgements', acknowledgementRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

