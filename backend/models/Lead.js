const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  source: {
    type: String,
    enum: ['manual', 'facebook'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'lost'],
    default: 'new'
  },
  facebookLeadId: {
    type: String,
    sparse: true
  },
  formData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lead', leadSchema); 