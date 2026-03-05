const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'admin@construct.com' });
        if (user) {
            console.log('USER_EXISTS:', user.email, 'ROLE:', user.role);
        } else {
            console.log('USER_NOT_FOUND');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUser();
