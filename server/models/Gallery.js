const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    public_id: { type: String }, // For future Cloudinary use
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
