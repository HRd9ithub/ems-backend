const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  note: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user"
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('note', noteSchema)