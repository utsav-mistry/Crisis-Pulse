const cron = require('node-cron');
const VolunteerTask = require('../models/VolunteerTask');
const User = require('../models/User');

const scheduleVolunteerTaskCron = () => {
    // Run every hour to check for expired tasks
    cron.schedule('0 * * * *', async () => {
        console.log('Running volunteer task deadline check...');
        try {
            const now = new Date();
            const expiredTasks = await VolunteerTask.find({
                status: 'claimed',
                deadline: { $lt: now }
            });

            for (const task of expiredTasks) {
                task.status = 'expired';
                await task.save();

                // Deduct points from the volunteer
                const volunteer = await User.findById(task.volunteer);
                if (volunteer) {
                    volunteer.points = Math.max(0, volunteer.points - 10); // Deduct 10 points, ensuring it doesn't go below 0
                    await volunteer.save();
                    console.log(`Task ${task._id} expired. Deducted 10 points from volunteer ${volunteer.name}.`);
                }
            }
        } catch (error) {
            console.error('Error checking for expired volunteer tasks:', error);
        }
    });
};

module.exports = { scheduleVolunteerTaskCron };
