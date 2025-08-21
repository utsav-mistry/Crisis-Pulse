const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
require('dotenv').config({ path: './config.env' });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Make io available to the Express app
app.set('io', io);

require('./config/db')(); // MongoDB connection

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api', apiLimiter); // Apply rate limiting to all API routes
app.use('/api/auth', authLimiter); // Stricter rate limiting for auth routes

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/disasters', require('./routes/disasterRoutes'));
app.use('/api/contributions', require('./routes/contributionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api', require('./routes/aiRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/push', require('./routes/pushRoutes'));
app.use('/api/setup', require('./routes/setupRoutes'));
app.use('/api/crpf-notifications', require('./routes/crpfNotificationRoutes'));
app.use('/api/volunteer-help', require('./routes/volunteerHelpRoutes'));
app.use('/api/volunteer-tasks', require('./routes/volunteerTaskRoutes'));
app.use('/api/points', require('./routes/pointsRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/live-feed', require('./routes/liveFeedRoutes'));

// Socket Setup
require('./sockets/socketHandler')(io);

// Export app for testing
module.exports = app;

// Start Server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Crisis Pulse backend running on port ${PORT}`);

        // Initialize cron jobs
        const { scheduleVolunteerHelpCron } = require('./cron/volunteerHelpCron');
        const { scheduleDisasterAICron } = require('./cron/disasterAICron');
        const { scheduleVolunteerTaskCron } = require('./cron/volunteerTaskCron');
        scheduleVolunteerHelpCron();
        scheduleDisasterAICron(io);
        scheduleVolunteerTaskCron();
        console.log('Cron jobs initialized');
    });
}
