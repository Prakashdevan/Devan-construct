const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
dotenv.config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        console.log('Users found:', users.length);
        users.forEach(u => {
            console.log(`Email: ${u.email}`);
            console.log(`Password (start): ${u.password.substring(0, 10)}...`);
            console.log(`Password length: ${u.password.length}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

check();
