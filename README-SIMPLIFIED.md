# Crisis Pulse - Simplified Setup Guide

## Quick Start

### Option 1: Automated Start (Windows)
```bash
# Double-click start.bat or run:
start.bat
```

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm install
npm start
```

## Application URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Key Features
- **Disaster Management**: Real-time alerts and reporting
- **Community System**: Points, leaderboard, contributions
- **Admin Dashboard**: User management and analytics
- **Volunteer System**: Help logging and verification
- **Real-time Notifications**: Socket.io integration

## Simplified Architecture

### Backend (Node.js)
- **Single Admin Route**: `/api/admin/*` (consolidated)
- **Streamlined Auth**: JWT with role-based access
- **Real-time**: Socket.io for live updates

### Frontend (React)
- **Simplified Auth**: useState instead of useReducer
- **Clean Notifications**: Simple toast messages
- **Responsive Design**: Mobile-first approach

## User Roles
- **Admin**: Full system access
- **Volunteer**: Help logging and disaster response
- **User**: Contributions and safety features

## Environment Setup
1. Copy `backend/config.env.example` to `backend/config.env`
2. Update MongoDB connection string
3. Set JWT_SECRET and other required variables

## Deployment Ready
- All features intact
- Simplified codebase
- Production optimized
