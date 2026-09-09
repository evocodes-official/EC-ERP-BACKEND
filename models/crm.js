const mongoose = require('mongoose');

const User = require('./User');

const stageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, required: true }, 
  sortOrder: { type: Number, required: true }
});
const Stage = mongoose.model('Stage', stageSchema);

const dealSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  amount: { type: Number, required: true },
  stageId: { type: String, required: true },
  assigneeId: { type: String, },
  description: { type: String }, 
  tagLabel: { type: String },  
  tagTheme: { type: String },  
  footerText: { type: String }, 
  footerIcon: { type: String }, 
  commentCount: { type: Number, default: 0 }
}, { timestamps: true }); 
const Deal = mongoose.model('Deal', dealSchema);

module.exports = {
  User,
  Stage,
  Deal
};