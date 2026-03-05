const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Half-day', 'One-and-half'] },
    remarks: { type: String },
    isPaid: { type: Boolean, default: false },
    payoutDate: { type: Date }
}, { timestamps: true });

// Ensure unique attendance per worker per day
attendanceSchema.index({ worker: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
