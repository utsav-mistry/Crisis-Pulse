// Test setup file
const mongoose = require('mongoose');

// Mock AI service responses for testing
jest.mock('axios', () => ({
    post: jest.fn(() => Promise.resolve({
        data: {
            prediction: { risk: 'medium', confidence: 0.75 },
            advice: 'Stay indoors and avoid flood-prone areas',
            forecast: { temperature: 25, humidity: 80, conditions: 'rainy' },
            trends: { totalDisasters: 10, riskLevel: 'medium' }
        }
    })),
    get: jest.fn(() => Promise.resolve({
        data: {
            forecast: { temperature: 25, humidity: 80, conditions: 'rainy' },
            trends: { totalDisasters: 10, riskLevel: 'medium' }
        }
    }))
}));

// Increase timeout for database operations
jest.setTimeout(30000);

beforeAll(async () => {
    // Clear any existing connections
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
});

afterAll(async () => {
    // Clean up database connections
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
});
