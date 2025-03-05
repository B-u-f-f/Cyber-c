const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true 
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'agent', 'user'],
    default: 'agent'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', function(next) {
 
  if (!this.username && this.isNew) {
    
    if (this.email) {
      
      this.username = this.email.split('@')[0] + Math.floor(Math.random() * 10000);
    } else if (this.name) {
      
      this.username = this.name.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 10000);
    }
  }
  next();
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);