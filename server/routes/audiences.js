const express = require('express');
const router = express.Router();
const Audience = require('../models/Audience');

// Get all audiences
router.get('/', async (req, res) => {
  try {
    const audiences = await Audience.findAll();
    res.json(audiences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single audience
router.get('/:id', async (req, res) => {
  try {
    const audience = await Audience.findById(req.params.id);
    if (!audience) {
      return res.status(404).json({ error: 'Audience not found' });
    }
    res.json(audience);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create audience
router.post('/', async (req, res) => {
  try {
    const audience = new Audience(req.body);
    audience.validate();

    const created = await Audience.create(audience);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update audience
router.put('/:id', async (req, res) => {
  try {
    const audience = await Audience.findById(req.params.id);
    if (!audience) {
      return res.status(404).json({ error: 'Audience not found' });
    }

    const updated = await Audience.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete audience
router.delete('/:id', async (req, res) => {
  try {
    const audience = await Audience.findById(req.params.id);
    if (!audience) {
      return res.status(404).json({ error: 'Audience not found' });
    }

    await Audience.delete(req.params.id);
    res.json({ message: 'Audience deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

