const request = require('supertest');
const mongoose = require('mongoose');

// Import the actual server app
const app = require('../server');

describe('API Endpoints Test', () => {
    let authToken;
    let adminToken;
    let userId;
    let disasterId;

    beforeAll(async () => {
        // Connect to test database
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crisis-pulse-test');
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('Authentication Endpoints', () => {
        test('POST /api/auth/register - should register a new user', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'user'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('email', userData.email);
            authToken = response.body.token;
            userId = response.body.user._id;
        });

        test('POST /api/auth/login - should login user', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('email', loginData.email);
        });

        test('POST /api/auth/register - should register admin user', async () => {
            const adminData = {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(adminData)
                .expect(201);

            adminToken = response.body.token;
        });
    });

    describe('User Endpoints', () => {
        test('GET /api/users/profile - should get current user profile', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('email', 'test@example.com');
        });

        test('PUT /api/users/profile - should update user profile', async () => {
            const updateData = {
                name: 'Updated Test User',
                phone: '1234567890'
            };

            const response = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty('name', updateData.name);
            expect(response.body).toHaveProperty('phone', updateData.phone);
        });

        test('GET /api/users - should get all users (admin only)', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('Disaster Endpoints', () => {
        test('POST /api/disasters - should create new disaster', async () => {
            const disasterData = {
                title: 'Test Flood',
                description: 'Test flood in test city',
                type: 'flood',
                location: 'Test City',
                severity: 'medium'
            };

            const response = await request(app)
                .post('/api/disasters')
                .set('Authorization', `Bearer ${authToken}`)
                .send(disasterData)
                .expect(201);

            expect(response.body).toHaveProperty('title', disasterData.title);
            expect(response.body).toHaveProperty('type', disasterData.type);
            disasterId = response.body._id;
        });

        test('GET /api/disasters - should get all disasters', async () => {
            const response = await request(app)
                .get('/api/disasters')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        test('GET /api/disasters/:id - should get disaster by ID', async () => {
            const response = await request(app)
                .get(`/api/disasters/${disasterId}`)
                .expect(200);

            expect(response.body).toHaveProperty('_id', disasterId);
            expect(response.body).toHaveProperty('title', 'Test Flood');
        });

        test('PUT /api/disasters/:id - should update disaster', async () => {
            const updateData = {
                severity: 'high',
                status: 'monitoring'
            };

            const response = await request(app)
                .put(`/api/disasters/${disasterId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty('severity', updateData.severity);
            expect(response.body).toHaveProperty('status', updateData.status);
        });
    });

    describe('Contribution Endpoints', () => {
        test('POST /api/contributions - should create new contribution', async () => {
            const contributionData = {
                disasterId: disasterId,
                item: 'Water Bottles',
                quantity: 50,
                category: 'water',
                deliveryMethod: 'drop-off'
            };

            const response = await request(app)
                .post('/api/contributions')
                .set('Authorization', `Bearer ${authToken}`)
                .send(contributionData)
                .expect(201);

            expect(response.body).toHaveProperty('item', contributionData.item);
            expect(response.body).toHaveProperty('quantity', contributionData.quantity);
        });

        test('GET /api/contributions - should get user contributions', async () => {
            const response = await request(app)
                .get('/api/contributions')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('Points Endpoints', () => {
        test('GET /api/points/user - should get user points', async () => {
            const response = await request(app)
                .get('/api/points/user')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('points');
            expect(response.body).toHaveProperty('user');
        });

        test('GET /api/points/leaderboard - should get leaderboard', async () => {
            const response = await request(app)
                .get('/api/points/leaderboard')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('CRPF Notification Endpoints', () => {
        test('POST /api/crpf-notifications - should create CRPF notification (admin only)', async () => {
            const notificationData = {
                disasterId: disasterId,
                message: 'Test CRPF notification',
                severity: 'high'
            };

            const response = await request(app)
                .post('/api/crpf-notifications')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(notificationData)
                .expect(201);

            expect(response.body).toHaveProperty('message', notificationData.message);
        });

        test('GET /api/crpf-notifications - should get CRPF notifications', async () => {
            const response = await request(app)
                .get('/api/crpf-notifications')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('AI Service Endpoints', () => {
        test('POST /api/predict - should get disaster prediction', async () => {
            const predictionData = {
                location: 'Test City',
                weatherData: {
                    temperature: 25,
                    humidity: 80,
                    rainfall: 50
                },
                historicalData: []
            };

            const response = await request(app)
                .post('/api/predict')
                .set('Authorization', `Bearer ${authToken}`)
                .send(predictionData)
                .expect(200);

            expect(response.body).toHaveProperty('prediction');
        });

        test('POST /api/llm-advice - should get AI safety advice', async () => {
            const adviceData = {
                disasterType: 'flood',
                location: 'Test City',
                severity: 'medium'
            };

            const response = await request(app)
                .post('/api/llm-advice')
                .set('Authorization', `Bearer ${authToken}`)
                .send(adviceData)
                .expect(200);

            expect(response.body).toHaveProperty('advice');
        });

        test('GET /api/weather/forecast/:location - should get weather forecast', async () => {
            const location = 'Test City';
            
            const response = await request(app)
                .get(`/api/weather/forecast/${location}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('forecast');
        });

        test('GET /api/analytics/disaster-trends - should get disaster analytics', async () => {
            const response = await request(app)
                .get('/api/analytics/disaster-trends')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('trends');
        });
    });

    describe('Error Handling', () => {
        test('GET /api/nonexistent - should return 404', async () => {
            await request(app)
                .get('/api/nonexistent')
                .expect(404);
        });

        test('Protected route without token - should return 401', async () => {
            await request(app)
                .get('/api/users/profile')
                .expect(401);
        });

        test('Admin route with user token - should return 403', async () => {
            await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(403);
        });
    });
});
