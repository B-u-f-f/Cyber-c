const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Client = require('../models/Client');
const User = require('../models/User');

// @route   GET /api/clients
// @desc    Get all clients
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get clients assigned to current user (for agents) or all clients (for admin)
    const user = await User.findById(req.user.id);
    
    let query = {};
    if (user.role !== 'admin') {
      query.assignedTo = req.user.id;
    }
    
    const clients = await Client.find(query)
      .populate('assignedTo', 'name email')
      .sort({ lastContact: -1 });
    
    res.json(clients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/clients
// @desc    Create a new client
// @access  Private
router.post('/', [
  auth,
  [check('name', 'Name is required').not().isEmpty()]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      email,
      phone,
      preferredLanguages,
      status,
      requirements,
      followUpDate,
      notes
    } = req.body;

    // Create client object
    const clientFields = {
      assignedTo: req.user.id,
      name,
      email,
      phone,
      preferredLanguages: preferredLanguages || ['en'],
      status: status || 'new_inquiry',
      lastContact: Date.now()
    };

    if (requirements) clientFields.requirements = requirements;
    if (followUpDate) clientFields.followUpDate = followUpDate;
    
    // Process notes if provided
    if (notes && notes.length > 0) {
      clientFields.notes = notes.map(note => ({
        ...note,
        createdBy: req.user.id,
        date: note.date || Date.now()
      }));
    }

    const client = new Client(clientFields);
    await client.save();

    res.json(client);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/clients/:id
// @desc    Get client by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('notes.createdBy', 'name');
    
    if (!client) {
      return res.status(404).json({ msg: 'Client not found' });
    }

    // Check if user has permission to view this client
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && client.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to view this client' });
    }

    res.json(client);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Client not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ msg: 'Client not found' });
    }

    // Check if user has permission to update this client
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && client.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this client' });
    }

    // Build update object
    const {
      name,
      email,
      phone,
      preferredLanguages,
      status,
      requirements,
      followUpDate,
      assignedTo
    } = req.body;

    if (name) client.name = name;
    if (email) client.email = email;
    if (phone) client.phone = phone;
    if (preferredLanguages) client.preferredLanguages = preferredLanguages;
    if (status) client.status = status;
    if (requirements) client.requirements = requirements;
    if (followUpDate) client.followUpDate = followUpDate;
    if (assignedTo && user.role === 'admin') client.assignedTo = assignedTo;
    
    // Update lastContact if specified
    if (req.body.updateLastContact) {
      client.lastContact = Date.now();
    }

    await client.save();
    res.json(client);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Client not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/clients/:id/notes
// @desc    Add a note to client
// @access  Private
router.post('/:id/notes', [
  auth,
  [check('text', 'Note text is required').not().isEmpty()]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ msg: 'Client not found' });
    }

    // Check if user has permission
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && client.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { text, translatedText, keywords } = req.body;
    
    const newNote = {
      text,
      translatedText,
      keywords: keywords || [],
      createdBy: req.user.id,
      date: Date.now()
    };

    client.notes.unshift(newNote);
    client.lastContact = Date.now();
    
    await client.save();
    res.json(client.notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private/Admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ msg: 'Client not found' });
    }

    await client.remove();
    res.json({ msg: 'Client removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Client not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;