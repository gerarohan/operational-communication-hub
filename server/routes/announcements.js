const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const Audience = require('../models/Audience');
const Acknowledgement = require('../models/Acknowledgement');
const slackService = require('../services/slackService');

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const { type, audienceId, status, startDate, endDate } = req.query;
    let announcements = await Announcement.findAll();

    // Apply filters
    if (type) {
      announcements = announcements.filter(a => a.type === type);
    }
    if (audienceId) {
      announcements = announcements.filter(a => a.audienceId === audienceId);
    }
    if (status) {
      announcements = announcements.filter(a => a.status === status);
    }
    if (startDate) {
      announcements = announcements.filter(a => new Date(a.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      announcements = announcements.filter(a => new Date(a.createdAt) <= new Date(endDate));
    }

    // Sort by created date (newest first)
    announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Enrich with acknowledgement data
    const enriched = await Promise.all(
      announcements.map(async (announcement) => {
        const acknowledgements = await Acknowledgement.findByAnnouncementId(announcement.id);
        const audience = await Audience.findById(announcement.audienceId);
        return {
          ...announcement,
          acknowledgementCount: acknowledgements.length,
          acknowledgements: acknowledgements,
          audience: audience
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single announcement
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    const acknowledgements = await Acknowledgement.findByAnnouncementId(announcement.id);
    const audience = await Audience.findById(announcement.audienceId);

    res.json({
      ...announcement,
      acknowledgements: acknowledgements,
      audience: audience
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create announcement
router.post('/', async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    announcement.validate();

    const audience = await Audience.findById(announcement.audienceId);
    if (!audience) {
      return res.status(400).json({ error: 'Invalid audience ID' });
    }

    const created = await Announcement.create(announcement);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update announcement
router.put('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Don't allow updating sent announcements
    if (announcement.status === 'Sent' && req.body.status !== 'Closed') {
      return res.status(400).json({ error: 'Cannot modify sent announcements' });
    }

    const updated = await Announcement.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Send announcement to Slack
router.post('/:id/send', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    if (announcement.status === 'Sent') {
      return res.status(400).json({ error: 'Announcement already sent' });
    }

    // Safety guard: Validate before sending
    if (!announcement.title || announcement.title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required before sending' });
    }

    const audience = await Audience.findById(announcement.audienceId);
    if (!audience) {
      return res.status(400).json({ error: 'Invalid audience ID' });
    }

    if (!audience.channels || audience.channels.length === 0) {
      return res.status(400).json({ error: 'Audience has no channels configured' });
    }

    // Send to Slack
    const { slackMessageIds, errors } = await slackService.sendAnnouncement(announcement, audience);

    // Update announcement status
    const updated = await Announcement.update(req.params.id, {
      status: 'Sent',
      sentAt: new Date().toISOString(),
      slackMessageIds: slackMessageIds
    });

    res.json({
      ...updated,
      slackMessageIds: slackMessageIds,
      errors: errors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete announcement
router.delete('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Don't allow deleting sent announcements
    if (announcement.status === 'Sent') {
      return res.status(400).json({ error: 'Cannot delete sent announcements' });
    }

    await Announcement.delete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

