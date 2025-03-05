const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
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
    required: false
  },
  preferredLanguages: [{
    type: String,
    enum: ['en', 'hi', 'mr', 'te']
  }],
  status: {
    type: String,
    enum: ['new_inquiry', 'interested', 'highly_interested', 'viewing_scheduled', 'offer_made', 'closed'],
    default: 'new_inquiry'
  },
  requirements: [{
    type: {
      type: String,
      enum: ['location', 'budget', 'property_type', 'bedrooms', 'feature', 'custom']
    },
    value: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  lastContact: {
    type: Date,
    default: Date.now
  },
  followUpDate: Date,
  notes: [{
    text: String,
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
  }],
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


ClientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Client', ClientSchema);