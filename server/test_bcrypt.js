const bcrypt = require('bcryptjs');

const test = async () => {
    try {
        console.log('Testing bcryptjs...');
        const salt = await bcrypt.genSalt(10);
        console.log('Salt generated:', salt);
        const hash = await bcrypt.hash('adminpassword', salt);
        console.log('Hash generated:', hash);
        process.exit(0);
    } catch (err) {
        console.error('Bcrypt test failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
};

test();
