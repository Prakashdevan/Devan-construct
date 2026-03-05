const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');

// Setup storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/gallery';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// @route   GET api/gallery
// @desc    Get all gallery images
router.get('/', async (req, res) => {
    try {
        const images = await Gallery.find().sort({ createdAt: -1 });
        res.json(images);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   POST api/gallery/upload
// @desc    Upload an image
router.post('/upload', auth(), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const newImage = new Gallery({
            title: req.body.title || 'Work Progress',
            url: `http://localhost:5000/uploads/gallery/${req.file.filename}`,
            uploadedBy: req.user.id
        });

        await newImage.save();
        res.json(newImage);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/gallery/:id
// @desc    Delete an image
router.delete('/:id', auth(), async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);
        if (!image) return res.status(404).json({ message: 'Image not found' });

        // Delete local file if it exists
        const filename = image.url.split('/').pop();
        const filePath = path.join(__dirname, '../uploads/gallery', filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await image.deleteOne();
        res.json({ message: 'Image removed' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
