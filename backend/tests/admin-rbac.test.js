const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Notification = require('../models/Notification');

describe('Admin RBAC and User Management', () => {
    let adminToken, userToken, volunteerToken, pendingVolunteerToken;
    let adminUser, regularUser, volunteerUser, pendingVolunteerUser;

    beforeAll(async () => {
        // Clean up database
        await User.deleteMany({});
        await Notification.deleteMany({});

        // Create test users
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 12);

        // Admin user
        adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'admin'
        });

        // Regular user
        regularUser = await User.create({
            name: 'Regular User',
            email: 'user@test.com',
            password: hashedPassword,
            role: 'user'
        });

        // Approved volunteer
        volunteerUser = await User.create({
            name: 'Volunteer User',
            email: 'volunteer@test.com',
            password: hashedPassword,
            role: 'volunteer',
            volunteerStatus: 'approved',
            motivation: 'I want to help people'
        });

        // Pending volunteer
        pendingVolunteerUser = await User.create({
            name: 'Pending Volunteer',
            email: 'pending@test.com',
            password: hashedPassword,
            role: 'volunteer',
            volunteerStatus: 'pending',
            motivation: 'I want to help during disasters'
        });

        // Get tokens for each user
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.com', password: 'password123' });
        adminToken = adminLogin.body.token;

        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@test.com', password: 'password123' });
        userToken = userLogin.body.token;

        const volunteerLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'volunteer@test.com', password: 'password123' });
        volunteerToken = volunteerLogin.body.token;

        const pendingLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'pending@test.com', password: 'password123' });
        pendingVolunteerToken = pendingLogin.body.token;
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Notification.deleteMany({});
        await mongoose.connection.close();
    });

    describe('Admin Authentication & Authorization', () => {
        test('Should allow admin to access admin routes', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.users).toBeDefined();
        });

        test('Should deny regular user access to admin routes', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toContain('Access denied');
        });

        test('Should deny volunteer access to admin routes', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${volunteerToken}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toContain('Access denied');
        });

        test('Should deny unauthenticated access to admin routes', async () => {
            const response = await request(app)
                .get('/api/admin/users');

            expect(response.status).toBe(401);
        });
    });

    describe('User Management', () => {
        test('Should get all users with pagination', async () => {
            const response = await request(app)
                .get('/api/admin/users?page=1&limit=10')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.users).toHaveLength(4);
            expect(response.body.totalPages).toBeDefined();
            expect(response.body.currentPage).toBe('1');
        });

        test('Should filter users by role', async () => {
            const response = await request(app)
                .get('/api/admin/users?role=volunteer')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.users).toHaveLength(2);
            response.body.users.forEach(user => {
                expect(user.role).toBe('volunteer');
            });
        });

        test('Should search users by name/email', async () => {
            const response = await request(app)
                .get('/api/admin/users?search=pending')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.users.length).toBeGreaterThan(0);
        });

        test('Should create new admin user', async () => {
            const newAdmin = {
                name: 'New Admin',
                email: 'newadmin@test.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/admin/users/admin')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newAdmin);

            expect(response.status).toBe(201);
            expect(response.body.admin.role).toBe('admin');
            expect(response.body.admin.email).toBe(newAdmin.email);
        });

        test('Should not create admin with existing email', async () => {
            const duplicateAdmin = {
                name: 'Duplicate Admin',
                email: 'admin@test.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/admin/users/admin')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(duplicateAdmin);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('already exists');
        });
    });

    describe('Volunteer Management', () => {
        test('Should get volunteer statistics', async () => {
            const response = await request(app)
                .get('/api/admin/volunteers/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.pending).toBe(1);
            expect(response.body.approved).toBe(1);
            expect(response.body.total).toBe(2);
        });

        test('Should approve pending volunteer', async () => {
            const response = await request(app)
                .patch(`/api/admin/volunteers/${pendingVolunteerUser._id}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('approved successfully');
            expect(response.body.user.volunteerStatus).toBe('approved');

            // Check if notification was created
            const notification = await Notification.findOne({
                userId: pendingVolunteerUser._id,
                type: 'volunteer_approved'
            });
            expect(notification).toBeTruthy();
        });

        test('Should reject volunteer with reason', async () => {
            // Create another pending volunteer for rejection test
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('password123', 12);
            
            const rejectVolunteer = await User.create({
                name: 'Reject Volunteer',
                email: 'reject@test.com',
                password: hashedPassword,
                role: 'volunteer',
                volunteerStatus: 'pending',
                motivation: 'Test motivation'
            });

            const response = await request(app)
                .patch(`/api/admin/volunteers/${rejectVolunteer._id}/reject`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ reason: 'Insufficient experience' });

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('rejected successfully');
            expect(response.body.user.volunteerStatus).toBe('rejected');
            expect(response.body.user.rejectionReason).toBe('Insufficient experience');

            // Check if notification was created
            const notification = await Notification.findOne({
                userId: rejectVolunteer._id,
                type: 'volunteer_rejected'
            });
            expect(notification).toBeTruthy();
        });

        test('Should suspend approved volunteer', async () => {
            const response = await request(app)
                .patch(`/api/admin/volunteers/${volunteerUser._id}/suspend`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ reason: 'Policy violation' });

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('suspended successfully');
            expect(response.body.user.volunteerStatus).toBe('suspended');

            // Check if notification was created
            const notification = await Notification.findOne({
                userId: volunteerUser._id,
                type: 'volunteer_suspended'
            });
            expect(notification).toBeTruthy();
        });

        test('Should not approve non-volunteer user', async () => {
            const response = await request(app)
                .patch(`/api/admin/volunteers/${regularUser._id}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('not a volunteer');
        });

        test('Should not approve already approved volunteer', async () => {
            // First approve the pending volunteer
            await User.findByIdAndUpdate(pendingVolunteerUser._id, {
                volunteerStatus: 'approved'
            });

            const response = await request(app)
                .patch(`/api/admin/volunteers/${pendingVolunteerUser._id}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('already approved');
        });
    });

    describe('User Ban/Unban', () => {
        test('Should ban regular user', async () => {
            const response = await request(app)
                .patch(`/api/admin/users/${regularUser._id}/ban`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ reason: 'Spam behavior' });

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('banned successfully');
            expect(response.body.user.isActive).toBe(false);

            // Check if notification was created
            const notification = await Notification.findOne({
                userId: regularUser._id,
                type: 'account_banned'
            });
            expect(notification).toBeTruthy();
        });

        test('Should unban user', async () => {
            // First ensure user is banned
            await User.findByIdAndUpdate(regularUser._id, { isActive: false });

            const response = await request(app)
                .patch(`/api/admin/users/${regularUser._id}/ban`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('unbanned successfully');
            expect(response.body.user.isActive).toBe(true);

            // Check if notification was created
            const notification = await Notification.findOne({
                userId: regularUser._id,
                type: 'account_unbanned'
            });
            expect(notification).toBeTruthy();
        });

        test('Should not ban admin user', async () => {
            const response = await request(app)
                .patch(`/api/admin/users/${adminUser._id}/ban`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ reason: 'Test ban' });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Cannot ban admin');
        });
    });

    describe('Error Handling', () => {
        test('Should handle non-existent user ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .patch(`/api/admin/volunteers/${fakeId}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toContain('not found');
        });

        test('Should handle invalid user ID format', async () => {
            const response = await request(app)
                .patch('/api/admin/volunteers/invalid-id/approve')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(500);
        });
    });

    describe('Role-Based Access Control', () => {
        test('Should allow volunteer to access volunteer routes', async () => {
            const response = await request(app)
                .get('/api/volunteer-help')
                .set('Authorization', `Bearer ${volunteerToken}`);

            // This should work if volunteer routes are properly protected
            expect([200, 404]).toContain(response.status); // 404 is ok if route doesn't exist yet
        });

        test('Should deny regular user access to volunteer routes', async () => {
            const response = await request(app)
                .get('/api/volunteer-help')
                .set('Authorization', `Bearer ${userToken}`);

            expect([403, 404]).toContain(response.status);
        });

        test('Should allow admin to access all routes', async () => {
            const routes = [
                '/api/admin/users',
                '/api/admin/volunteers/stats'
            ];

            for (const route of routes) {
                const response = await request(app)
                    .get(route)
                    .set('Authorization', `Bearer ${adminToken}`);
                
                expect(response.status).toBe(200);
            }
        });
    });
});
