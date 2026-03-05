const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    dailyWage: { type: Number, required: true },
    specialization: { type: String, enum: ['Slab', 'Beam', 'Column', 'Helper', 'Supervisor'], default: 'Helper' },
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
    joiningDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Worker', workerSchema);
