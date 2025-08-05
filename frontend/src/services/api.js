import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (userData) => api.post('/api/auth/register', userData),
    getCurrentUser: () => api.get('/api/users/me'),
    updateUser: (userId, userData) => api.patch(`/api/users/${userId}`, userData),
};

// Disaster API
export const disasterAPI = {
    getAll: () => api.get('/api/disasters'),
    getById: (id) => api.get(`/api/disasters/${id}`),
    create: (disasterData) => api.post('/api/disasters/raise', disasterData),
    update: (id, disasterData) => api.put(`/api/disasters/${id}`, disasterData),
    delete: (id) => api.delete(`/api/disasters/${id}`),
};

// Contribution API
export const contributionAPI = {
    contribute: (contributionData) => api.post('/api/contribute', contributionData),
    getUserContributions: (userId) => api.get(`/api/contributions/user/${userId}`),
};

// Notification API
export const notificationAPI = {
    broadcast: (notificationData) => api.post('/api/notifications/broadcast', notificationData),
    getLatest: () => api.get('/api/notifications/latest'),
};

// User API
export const userAPI = {
    getAll: () => api.get('/api/users'),
    getById: (id) => api.get(`/api/users/${id}`),
    getByLocation: (city) => api.get(`/api/users/nearby/${city}`),
    getPoints: (userId) => api.get(`/api/users/${userId}/points`),
    delete: (id) => api.delete(`/api/users/${id}`),
};

// AI Service API (Simplified Django endpoints)
export const aiAPI = {
    predictDisaster: (predictionData) => api.post('/api/predict', predictionData),
    getLLMAdvice: (adviceData) => api.post('/api/llm-advice', adviceData),
    getWeatherForecast: (location, days = 7) =>
        api.get('/api/weather/forecast', { params: { location: JSON.stringify(location), days } }),
    getCurrentWeather: (location) =>
        api.get('/api/weather/current', { params: { location: JSON.stringify(location) } }),
    getDisasterTrends: () => api.get('/api/analytics/disaster-trends'),
    riskAssessment: (location) => api.post('/api/analytics/risk-assessment', { location }),
    getHistoricalDisasters: () => api.get('/api/historical/disasters'),
    getDisastersByState: (state) => api.get(`/api/historical/disasters/${state}`),
    healthCheck: () => api.get('/api/health'),
    serviceStatus: () => api.get('/api/status'),
};

export default api; 