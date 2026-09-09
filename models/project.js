const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  members: { type: Number, default: 1 },
  color: { type: String, default: 'bg-blue-500' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);