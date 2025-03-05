const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Client = require('../models/Client');
const User = require('../models/User');

// @route   GET /api/clients
// @desc    Get all clients
// @access  Private

// /server/routes/clients.js - Add this route to your existing clients.js file

// @route   POST /api/clients/:id/notes
// @desc    Add a note to a client
// @access  Private
// /server/routes/clients.js - Add this route to your existing clients.js file

// @route   POST /api/clients/:id/conversations
// @desc    Add a conversation to a client
// @access  Private
router.post('/:id/conversations', auth, async (req, res) => {
  try {
    const { type, summary, date } = req.body;
    
    // Validate required fields
    if (!type || !summary) {
      return res.status(400).json({ msg: 'Type and summary are required' });
    }

    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ msg: 'Client not found' });
    }

    // Check if client has a conversations array, create if not
    if (!client.conversations) {
      client.conversations = [];
    }

    // Create new conversation
    const newConversation = {
      type,
      summary,
      date: date || new Date(),
      createdBy: req.user.id
    };

    // Add to conversations array
    client.conversations.push(newConversation);
    
    // Update last contact date
    client.lastContact = newConversation.date;
    client.updatedAt = new Date();

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
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ msg: 'Note text is required' });
    }

    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ msg: 'Client not found' });
    }

    // Create new note
    const newNote = {
      text,
      date: new Date(),
      createdBy: req.user.id
    };

    // Add to notes array
    client.notes.push(newNote);
    
    // Update last contact date
    client.lastContact = new Date();
    client.updatedAt = new Date();

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

// @route   PUT /api/clients/:id
// @desc    Update a client
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ msg: 'Client not found' });
    }

    // Check if user is authorized to update this client
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && client.assignedTo.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this client' });
    }

    // Fields that can be updated
    const {
      name,
      email,
      phone,
      preferredLanguages,
      status,
      requirements,
      followUpDate,
      notes,
      updateLastContact
    } = req.body;

    // Build client update object
    if (name) client.name = name;
    if (email) client.email = email;
    if (phone) client.phone = phone;
    if (preferredLanguages) client.preferredLanguages = preferredLanguages;
    if (status) client.status = status;
    if (requirements) client.requirements = requirements;
    if (followUpDate) client.followUpDate = followUpDate;
    
    // Handle notes separately to avoid overwriting existing notes
    if (notes && Array.isArray(notes)) {
      const newNotes = notes.filter(note => 
        !client.notes.some(existingNote => 
          existingNote._id && note._id && existingNote._id.toString() === note._id.toString()
        )
      );
      
      // Add new notes with creator info
      newNotes.forEach(note => {
        client.notes.push({
          text: note.text,
          date: note.date || new Date(),
          createdBy: req.user.id
        });
      });
    }

    // Update timestamp if requested
    if (updateLastContact) {
      client.lastContact = new Date();
    }
    
    client.updatedAt = new Date();

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

    // Check if user is authorized to view this client
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && client.assignedTo && client.assignedTo.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to view this client' });
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
router.get('/', auth, async (req, res) => {
  try {
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

module.exports = router;