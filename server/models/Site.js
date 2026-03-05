const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    clientName: { type: String },
    status: { type: String, enum: ['Active', 'Completed', 'On Hold'], default: 'Active' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Site', siteSchema);
