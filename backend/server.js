
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', require('./src/routes/catalogRoutes'));
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api', require('./src/routes/questionRoutes'));

// app.get('/api/health', (req, res) => res.json({ status: 'ok' }));


const PORT = process.env.PORT || 5000;

async function start(){
    await connectDB();
    app.listen(PORT , () => console.log(`Learnium backend running on port ${PORT}`));
}

start();