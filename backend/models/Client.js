// /server/models/Client.js - Updated model with conversations support

const mongoose = require('mongoose');

// Define the requirement schema (subdocument)
const requirementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['property_type', 'location', 'feature', 'budget', 'bedrooms', 'custom'],
    required: true
  },
  value: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
});

// Define the note schema (subdocument)
const noteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  translatedText: String,
  date: {
    type: Date,
    default: Date.now
  },
  keywords: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Define the conversation schema (subdocument)
const conversationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['call', 'meeting', 'email', 'message', 'other'],
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Main client schema
const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: true
  },
  preferredLanguages: {
    type: [String],
    default: ['en']
  },
  requirements: [requirementSchema],
  status: {
    type: String,
    enum: ['new_inquiry', 'interested', 'highly_interested', 'viewing_scheduled', 'offer_made', 'closed'],
    default: 'new_inquiry'
  },
  notes: [noteSchema],
  conversations: [conversationSchema],
  lastContact: {
    type: Date,
    default: Date.now
  },
  followUpDate: Date,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

clientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Client', clientSchema);