const Settings = require('../models/setting');
const bcrypt = require('bcryptjs'); // Optional, if hashing admin passwords

// Get system & portal settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    // If settings do not exist yet, seed a default document
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update system & portal settings
exports.updateSettings = async (req, res) => {
  try {
    const updateData = req.body;
    
    // Find the single settings document and update it (or create if missing)
    const updatedSettings = await Settings.findOneAndUpdate({}, updateData, { 
      new: true, 
      upsert: true, 
      setDefaultsOnInsert: true 
    });

    res.status(200).json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handle Admin Master Password change
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required.' });
    }

    // Add your user authentication / password comparison logic here
    // e.g., verify currentPassword against logged-in admin's hash

    res.status(200).json({ message: 'Admin master password updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};