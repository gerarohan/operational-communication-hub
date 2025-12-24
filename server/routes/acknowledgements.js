const express = require('express');
const router = express.Router();
const Acknowledgement = require('../models/Acknowledgement');
const Announcement = require('../models/Announcement');

// Get all acknowledgements for an announcement
router.get('/announcement/:announcementId', async (req, res) => {
  try {
    const acknowledgements = await Acknowledgement.findByAnnouncementId(req.params.announcementId);
    res.json(acknowledgements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create acknowledgement
router.post('/', async (req, res) => {
  try {
    const { announcementId, userId, userName } = req.body;

    if (!announcementId || !userId) {
      return res.status(400).json({ error: 'announcementId and userId are required' });
    }

    // Check if announcement exists
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Check if already acknowledged
    const existing = await Acknowledgement.findByUserAndAnnouncement(userId, announcementId);
    if (existing) {
      return res.status(400).json({ error: 'Already acknowledged', acknowledgement: existing });
    }

    const acknowledgement = await Acknowledgement.create({
      announcementId,
      userId,
      userName: userName || userId
    });

    res.status(201).json(acknowledgement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get acknowledgement status for user and announcement
router.get('/check/:announcementId/:userId', async (req, res) => {
  try {
    const { announcementId, userId } = req.params;
    const acknowledgement = await Acknowledgement.findByUserAndAnnouncement(userId, announcementId);
    res.json({ acknowledged: !!acknowledgement, acknowledgement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

