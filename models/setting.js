const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  organizationName: { type: String, required: true, default: 'EVO Global Solutions Inc.' },
  enterpriseDomain: { type: String, required: true, default: 'evo-erp.com' },
  supportEmail: { type: String, required: true, default: 'support@evo-erp.com' },
  timezone: { type: String, default: '(UTC-05:00) Eastern Time (US & Canada)' },
  defaultCurrency: { type: String, default: 'USD ($) - US Dollar' },
  fiscalYearStart: { type: String, default: 'January 1st' },
  systemPlan: { type: String, default: 'Enterprise Scale' },
  twoFactorEnforced: { type: Boolean, default: true },
  forcePasswordChange: { type: Boolean, default: true },
  emailNotifs: { type: Boolean, default: true },
  weeklyReport: { type: Boolean, default: false },
  apiKey: { type: String, default: 'evo_live_89f92a41b7e0982c44' },
  quickbooksConnected: { type: Boolean, default: true },
  salesforceConnected: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);