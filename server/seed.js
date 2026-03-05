const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Site = require('./models/Site');
const Worker = require('./models/Worker');

dotenv.config();

const seed = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);

        console.log('Clearing data...');
        await Promise.all([
            User.deleteMany(),
            Site.deleteMany(),
            Worker.deleteMany()
        ]);

        console.log('Creating Super Admin (hook will handle hashing)...');
        // DON'T manual hash here, let the model hook do it
        const admin = new User({
            name: 'Super Admin',
            email: 'devan020480@gmail.com',
            password: 'Devan@1980',
            role: 'super-admin'
        });
        await admin.save();
        console.log('Super Admin created!');

        console.log('Creating Sample Sites...');
        const sites = await Site.insertMany([
            { name: 'Skyline Residency', location: 'Downtown, Blocks 4-6', clientName: 'Skyline Corp' },
            { name: 'Green Valley', location: 'Suburbs, Sector 12', clientName: 'Valley Devs' }
        ]);

        console.log('Creating Sample Workers...');
        const workers = [
            { name: 'John Doe', phone: '1234567890', dailyWage: 800, specialization: 'Slab', site: sites[0]._id },
            { name: 'Jane Smith', phone: '0987654321', dailyWage: 750, specialization: 'Beam', site: sites[0]._id },
            { name: 'Mike Ross', phone: '1122334455', dailyWage: 900, specialization: 'Column', site: sites[1]._id }
        ];
        await Worker.insertMany(workers);

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('ERROR OCCURRED:', err.message);
        process.exit(1);
    }
};

seed();
