const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Attendance = require('../models/Attendance');

// @route   POST api/attendance
// @desc    Mark attendance for a worker
router.post('/', async (req, res) => {
    console.log('--- ATTEMPTING ATTENDANCE MARK ---', req.body);
    const { worker, site, date, status, remarks } = req.body;
    try {
        const queryDate = new Date(date);
        queryDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(queryDate);
        endDate.setUTCHours(23, 59, 59, 999);

        let attendance = await Attendance.findOne({
            worker,
            date: { $gte: queryDate, $lte: endDate }
        });

        if (attendance) {
            // isPaid check removed to allow admins to fix mistakes
            attendance.status = status;
            attendance.remarks = remarks;
            attendance.isPaid = false;
            attendance.payoutDate = undefined;
            await attendance.save();
        } else {
            attendance = new Attendance({ worker, site, date: queryDate, status, remarks, isPaid: false });
            await attendance.save();
        }
        res.json(attendance);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   GET api/attendance/all/:date
// @desc    Get attendance for all workers on a specific date
router.get('/all/:date', async (req, res) => {
    try {
        const queryDate = new Date(req.params.date);
        queryDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(queryDate);
        endDate.setUTCHours(23, 59, 59, 999);

        const attendance = await Attendance.find({
            date: { $gte: queryDate, $lte: endDate }
        }).populate('worker', 'name');

        res.json(attendance);
    } catch (err) {
        console.error('Error fetching global attendance:', err);
        res.status(500).send('Server error');
    }
});

// @route   GET api/attendance/:siteId/:date
// @desc    Get attendance for a site on a specific date
router.get('/:siteId/:date', async (req, res) => {
    try {
        const queryDate = new Date(req.params.date);
        queryDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(queryDate);
        endDate.setUTCHours(23, 59, 59, 999);

        const attendance = await Attendance.find({
            site: req.params.siteId,
            date: { $gte: queryDate, $lte: endDate }
        }).populate('worker', 'name specialization');
        res.json(attendance);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   GET api/attendance/stats
// @desc    Get attendance stats for the last 7 days
router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        // Set range from 7 days ago to 2 days in the future to capture all recent marks
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 2);
        endDate.setHours(23, 59, 59, 999);

        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);

        const stats = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $lookup: {
                    from: 'workers',
                    localField: 'worker',
                    foreignField: '_id',
                    as: 'workerInfo'
                }
            },
            { $unwind: '$workerInfo' },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    present: {
                        $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] }
                    },
                    halfDay: {
                        $sum: { $cond: [{ $eq: ["$status", "Half-day"] }, 1, 0] }
                    },
                    totalSalary: {
                        $sum: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$status", "Present"] }, then: "$workerInfo.dailyWage" },
                                    { case: { $eq: ["$status", "Half-day"] }, then: { $divide: ["$workerInfo.dailyWage", 2] } },
                                    { case: { $eq: ["$status", "One-and-half"] }, then: { $multiply: ["$workerInfo.dailyWage", 1.5] } }
                                ],
                                default: 0
                            }
                        }
                    }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json(stats);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   GET api/attendance/daily-expense
// @desc    Get total wage expense for a specific date
router.get('/daily-expense', async (req, res) => {
    const { date } = req.query;
    let queryDate;
    if (date) {
        queryDate = new Date(date);
        queryDate.setUTCHours(0, 0, 0, 0);
    } else {
        const now = new Date();
        queryDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }
    const endDate = new Date(queryDate);
    endDate.setUTCHours(23, 59, 59, 999);

    try {
        const attendance = await Attendance.find({
            date: { $gte: queryDate, $lte: endDate }
        }).populate('worker', 'dailyWage');

        let totalExpense = 0;
        let presentCount = 0;
        let halfDayCount = 0;

        attendance.forEach(a => {
            if (!a.worker) return; // Skip if worker no longer exists
            if (a.status === 'Present') {
                totalExpense += a.worker.dailyWage;
                presentCount++;
            }
            else if (a.status === 'Half-day') {
                totalExpense += (a.worker.dailyWage / 2);
                halfDayCount++;
            }
            else if (a.status === 'One-and-half') {
                totalExpense += (a.worker.dailyWage * 1.5);
                presentCount++; // Counts as work day
            }
        });

        res.json({
            date: queryDate,
            totalExpense,
            presentCount,
            halfDayCount,
            totalMarked: attendance.length
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   GET api/attendance/worker-salary
// @desc    Get salary report for all workers (filters by payment status)
router.get('/worker-salary', async (req, res) => {
    const { payoutDate } = req.query;

    let query = { isPaid: { $ne: true } }; // Default: ALL unpaid records

    if (payoutDate) {
        // If searching history, filter by exact payout timestamp
        query = { isPaid: true, payoutDate: new Date(payoutDate) };
    }

    try {
        console.log('Fetching worker salary. payoutDate param:', payoutDate);
        console.log('Query being used:', query);
        const attendance = await Attendance.find(query).populate('worker', 'name dailyWage phone specialization');
        console.log(`Found ${attendance.length} records for this query.`);

        const report = {};

        attendance.forEach(a => {
            if (!a.worker) return;
            const workerId = a.worker._id;
            if (!report[workerId]) {
                report[workerId] = {
                    name: a.worker.name,
                    phone: a.worker.phone,
                    specialization: a.worker.specialization,
                    dailyWage: a.worker.dailyWage,
                    presentDays: 0,
                    halfDays: 0,
                    oneHalfDays: 0,
                    absentDays: 0,
                    totalSalary: 0,
                    attendanceDetails: []
                };
            }

            report[workerId].attendanceDetails.push({
                date: a.date,
                status: a.status
            });

            if (a.status === 'Present') {
                report[workerId].presentDays += 1;
                report[workerId].totalSalary += a.worker.dailyWage;
            } else if (a.status === 'Half-day') {
                report[workerId].halfDays += 1;
                report[workerId].totalSalary += (a.worker.dailyWage / 2);
            } else if (a.status === 'One-and-half') {
                report[workerId].oneHalfDays += 1;
                report[workerId].totalSalary += (a.worker.dailyWage * 1.5);
            } else {
                report[workerId].absentDays += 1;
            }
        });

        res.json(Object.values(report));
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   POST api/attendance/reset
// @desc    Confirm payment and reset for new cycle
router.post('/reset', async (req, res) => {
    const { password } = req.body;
    const User = require('../models/User');

    try {
        const user = await User.findById(req.user.id);
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password. Reset failed.' });
        }

        const payoutDate = new Date();
        await Attendance.updateMany(
            { isPaid: false },
            { $set: { isPaid: true, payoutDate: payoutDate } }
        );

        res.json({ message: 'Salary cycle reset successfully. New cycle started.', payoutDate });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   GET api/attendance/payouts
// @desc    Get all unique payout dates for history
router.get('/payouts', async (req, res) => {
    try {
        const payouts = await Attendance.distinct('payoutDate', { isPaid: true });
        res.json(payouts.filter(d => d).sort((a, b) => b - a));
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   GET api/attendance/salary/:workerId
// @desc    Get total salary for a specific worker
router.get('/salary/:workerId', async (req, res) => {
    try {
        const Worker = require('../models/Worker');
        const worker = await Worker.findById(req.params.workerId);

        if (!worker) return res.status(404).json({ message: 'Worker not found' });

        const presentCount = await Attendance.countDocuments({
            worker: worker._id,
            status: "Present"
        });

        const halfDays = await Attendance.countDocuments({
            worker: worker._id,
            status: "Half-day"
        });

        const oneAndHalfDays = await Attendance.countDocuments({
            worker: worker._id,
            status: "One-and-half"
        });

        const salary = (presentCount * worker.dailyWage) +
            (halfDays * (worker.dailyWage / 2)) +
            (oneAndHalfDays * (worker.dailyWage * 1.5));

        res.json({
            workerName: worker.name,
            presentDays: presentCount,
            halfDays,
            oneAndHalfDays,
            salary
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/attendance/day-details/:date
// @desc    Get names of workers present on a specific date
router.get('/day-details/:date', async (req, res) => {
    console.log('Day Details request for date:', req.params.date);
    try {
        const queryDate = new Date(req.params.date);
        queryDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(queryDate);
        endDate.setUTCHours(23, 59, 59, 999);

        console.log(`Searching between ${queryDate.toISOString()} and ${endDate.toISOString()}`);

        const attendance = await Attendance.find({
            date: { $gte: queryDate, $lte: endDate },
            status: { $in: ['Present', 'Half-day', 'One-and-half'] }
        }).populate('worker', 'name');

        console.log(`Found ${attendance.length} total records on this day`);

        const details = attendance.map(a => ({
            name: a.worker?.name || 'Unknown',
            status: a.status
        }));

        res.json(details);
    } catch (err) {
        console.error('Error fetching day details:', err);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/attendance/:workerId/:date
// @desc    Clear attendance for a worker on a specific date (un-mark)
router.delete('/:workerId/:date', async (req, res) => {
    console.log('--- ATTEMPTING ATTENDANCE DELETE ---', req.params);
    try {
        const queryDate = new Date(req.params.date);
        queryDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(queryDate);
        endDate.setUTCHours(23, 59, 59, 999);

        await Attendance.findOneAndDelete({
            worker: req.params.workerId,
            date: { $gte: queryDate, $lte: endDate }
            // isPaid check removed to allow admins to fix mistakes
        });

        res.json({ message: 'Attendance record cleared' });
    } catch (err) {
        console.error('Error clearing attendance:', err);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/attendance/bulk-clear
// @desc    Clear attendance for all workers on a site for a specific date
router.delete('/bulk-clear', async (req, res) => {
    const { siteId, date } = req.query;
    try {
        const queryDate = new Date(date);
        queryDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(queryDate);
        endDate.setUTCHours(23, 59, 59, 999);

        let query = {
            date: { $gte: queryDate, $lte: endDate },
            isPaid: false
        };

        if (siteId && siteId !== 'all') {
            query.site = siteId;
        }

        await Attendance.deleteMany(query);
        res.json({ message: 'All attendance records for the selection cleared' });
    } catch (err) {
        console.error('Error in bulk clear:', err);
        res.status(500).send('Server error');
    }
});

// @route   POST api/attendance/notify
// @desc    Send direct notification via SMS or WhatsApp
router.post('/notify', async (req, res) => {
    const { workerId, method, message } = req.body;
    const Worker = require('../models/Worker');
    const { sendSMS, sendWhatsApp } = require('../utils/messaging');

    try {
        const worker = await Worker.findById(workerId);
        if (!worker || !worker.phone) {
            return res.status(400).json({ message: 'Worker or phone number not found' });
        }

        let phone = worker.phone.replace(/\D/g, '');
        if (phone.length === 10 && method === 'whatsapp') {
            phone = '91' + phone; // Add country code for WhatsApp
        }

        let result;
        if (method === 'whatsapp') {
            result = await sendWhatsApp(phone, message);
        } else {
            result = await sendSMS(phone, message);
        }

        if (result.success) {
            res.json({ message: 'Notification sent successfully', data: result.data });
        } else {
            // Include message for frontend to know it failed but keys might be missing
            res.status(200).json({ success: false, message: result.message || 'Messaging not configured', error: result.error });
        }
    } catch (err) {
        console.error('Notification error:', err);
        res.status(500).send('Server error');
    }
});


module.exports = router;
