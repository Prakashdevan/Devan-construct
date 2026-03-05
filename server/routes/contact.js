const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

// @route   POST api/contact
// @desc    Submit a contact message (Public)
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: "Please fill all fields" });
        }
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.status(201).json({ message: "Message sent successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// @route   GET api/contact
// @desc    Get all contact messages (Admin)
router.get('/', auth(), async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// @route   PUT api/contact/:id
// @desc    Update message status (Admin)
router.put('/:id', auth(), async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ error: "Message not found" });
        contact.status = req.body.status || contact.status;
        await contact.save();
        res.json(contact);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// @route   DELETE api/contact/:id
// @desc    Delete message (Admin)
router.delete('/:id', auth(), async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: "Message deleted" });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
