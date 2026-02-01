const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: mongoose.Schema.Types.Mixed,
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
