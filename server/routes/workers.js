const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');

// @route   GET api/workers
// @desc    Get all workers
router.get('/', async (req, res) => {
    try {
        const query = req.query.all === 'true' ? {} : { isActive: { $ne: false } };
        const workers = await Worker.find(query).populate('site', 'name location');
        res.json(workers);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   POST api/workers
// @desc    Create a worker
router.post('/', async (req, res) => {
    try {
        const newWorker = new Worker(req.body);
        const worker = await newWorker.save();
        res.json(worker);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   PUT api/workers/:id
// @desc    Update a worker
router.put('/:id', async (req, res) => {
    try {
        const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(worker);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/workers/:id
// @desc    Delete a worker
router.delete('/:id', async (req, res) => {
    try {
        await Worker.findByIdAndDelete(req.params.id);
        res.json({ message: 'Worker removed' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   GET api/workers/stats/specialization
// @desc    Get worker counts by specialization
router.get('/stats/specialization', async (req, res) => {
    try {
        const stats = await Worker.aggregate([
            { $match: { isActive: { $ne: false } } },
            {
                $group: {
                    _id: "$specialization",
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json(stats);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
