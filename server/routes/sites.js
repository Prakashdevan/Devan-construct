const express = require('express');
const router = express.Router();
const Site = require('../models/Site');

// @route   GET api/sites
router.get('/', async (req, res) => {
    try {
        const sites = await Site.find();
        res.json(sites);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   POST api/sites
router.post('/', async (req, res) => {
    try {
        const newSite = new Site(req.body);
        const site = await newSite.save();
        res.json(site);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   PUT api/sites/:id
router.put('/:id', async (req, res) => {
    try {
        const site = await Site.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!site) return res.status(404).json({ message: 'Site not found' });
        res.json(site);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/sites/:id
router.delete('/:id', async (req, res) => {
    console.log(`DELETE request for site ${req.params.id} by user role: ${req.user.role}`);
    try {
        const site = await Site.findByIdAndDelete(req.params.id);
        if (!site) return res.status(404).json({ message: 'Site not found' });
        res.json({ message: 'Site removed' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
