const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Middleware
const auth = require('./middleware/auth');

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));

// Protected Admin Routes
app.use('/api/workers', auth(['admin', 'super-admin']), require('./routes/workers'));
app.use('/api/sites', auth(['admin', 'super-admin']), require('./routes/sites'));
app.use('/api/attendance', auth(['admin', 'super-admin']), require('./routes/attendance'));
app.use('/api/gallery', auth(['admin', 'super-admin']), require('./routes/gallery'));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/construct_db';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

app.get('/', (req, res) => {
    res.send('Construction System API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
