const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  rules: {
    type: String,
    required: true
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('rule', ruleSchema)