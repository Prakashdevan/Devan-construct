const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');

async function migrate() {
    try {
        await mongoose.connect('mongodb://localhost:27017/construct');
        console.log('Connected to MongoDB');
        const res = await Attendance.updateMany(
            { isPaid: { $exists: false } },
            { $set: { isPaid: false } }
        );
        console.log(`Successfully updated ${res.modifiedCount} attendance records.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
