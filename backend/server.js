const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const socketIo = require('socket.io');
const { scheduleVolunteerHelpCron } = require('./cron/volunteerHelpCron');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Make io available to the Express app
app.set('io', io);

dotenv.config();
require('./config/db')(); // MongoDB connection

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/disasters', require('./routes/disasterRoutes'));
app.use('/api/contribute', require('./routes/contributionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/crpf-notifications', require('./routes/crpfNotificationRoutes'));
app.use('/api/volunteer-help', require('./routes/volunteerHelpRoutes'));

// Socket Setup
require('./sockets/socketHandler')(io);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Crisis Pulse backend running on port ${PORT}`);
    
    // Initialize cron jobs
    scheduleVolunteerHelpCron();
    console.log('Cron jobs initialized');
});
