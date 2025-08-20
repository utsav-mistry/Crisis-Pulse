# Crisis Pulse - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### 1. Start the Application
Run the batch file to start all services:
```bash
./start-app.bat
```

Or start manually:

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

### 2. First-Time Setup

1. **Access Admin Setup**: http://localhost:3000/setup/admin
2. **Admin Creation Key**: `crisis-pulse-admin-2025`
3. **Create First Admin Account**:
   - Name: Your admin name
   - Email: admin@crisisresponse.com
   - Password: Strong password (min 6 chars)
   - Admin Key: crisis-pulse-admin-2025

### 3. Application URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Setup**: http://localhost:3000/setup/admin
- **Admin Dashboard**: http://localhost:3000/admin/dashboard

## 🔐 Security Features

### Admin Creation Lock
- **One-time setup**: Only the first admin can be created via setup
- **Automatic lock**: Admin creation is locked after first admin
- **Secure key**: Requires admin creation key for setup

### Authentication
- **JWT tokens** with 7-day expiration
- **Role-based access control** (admin, volunteer, user)
- **Protected routes** with middleware validation
- **Rate limiting** on API endpoints

## 📋 User Roles & Permissions

### Admin
- Full system access
- User management (approve/reject/suspend volunteers)
- Disaster management
- CRPF notifications (dummy system)
- System analytics

### Volunteer (Requires Admin Approval)
- Help logging during disasters
- Disaster response participation
- Points earning system
- Status: pending → approved/rejected/suspended

### User
- Disaster reporting
- Resource contributions
- Safety information access
- Leaderboard participation

## 🛠 API Endpoints

### Setup & Authentication
- `POST /api/setup/admin` - Create first admin (one-time)
- `GET /api/setup/status` - Check admin creation status
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Admin Management
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/volunteers/:id/approve` - Approve volunteer
- `PATCH /api/admin/volunteers/:id/reject` - Reject volunteer
- `PATCH /api/admin/volunteers/:id/suspend` - Suspend volunteer
- `GET /api/admin/volunteers/stats` - Volunteer statistics

### Core Features
- `GET /api/disasters` - List disasters
- `POST /api/disasters` - Create disaster report
- `GET /api/contributions` - List contributions
- `POST /api/contributions` - Create contribution
- `GET /api/points/leaderboard` - Get leaderboard

## 🔧 Configuration

### Environment Variables (backend/config.env)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/crisis-pulse
JWT_SECRET=crisis-pulse-jwt-secret-key-2025-production-ready
ADMIN_CREATION_KEY=crisis-pulse-admin-2025
ADMIN_RESET_KEY=crisis-pulse-reset-2025
```

### Frontend Configuration
- **Proxy**: http://localhost:5000 (configured in package.json)
- **Socket.io**: Real-time notifications enabled
- **Axios**: API client with automatic proxy

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Test Admin RBAC
```bash
cd backend
npm run test:admin
```

## 📱 Features Overview

### ✅ Completed Features
- **User Registration & Authentication**
- **Admin User Management System**
- **Volunteer Approval Workflow**
- **Role-Based Access Control**
- **Real-time Notifications**
- **Disaster Management**
- **Contribution System**
- **Points & Leaderboard**
- **Admin Dashboard**
- **Secure Admin Creation**

### 🔒 Security Measures
- **One-time admin setup** with secure key
- **JWT authentication** with role validation
- **Rate limiting** on API endpoints
- **Input validation** and sanitization
- **Protected routes** with middleware
- **Admin creation lock** after first setup

## 🚨 Important Notes

1. **Admin Key**: Keep `crisis-pulse-admin-2025` secure
2. **First Admin**: Only one admin can be created via setup
3. **MongoDB**: Ensure MongoDB is running before starting backend
4. **Ports**: Frontend (3000), Backend (5000)
5. **CRPF**: Removed login, operates as dummy notification system

## 🔄 Development Workflow

1. **Setup**: Use `/setup/admin` for first admin
2. **Login**: Use admin credentials to access dashboard
3. **Users**: Register new users via `/register`
4. **Volunteers**: Admin approval required for volunteer access
5. **Testing**: Use test suite for validation

## 📞 Support

For issues or questions:
1. Check console logs (browser/terminal)
2. Verify MongoDB connection
3. Ensure all dependencies installed
4. Check port availability (3000, 5000)

---

**Crisis Pulse** - Disaster Management System
Ready for production deployment with comprehensive RBAC and security features.
