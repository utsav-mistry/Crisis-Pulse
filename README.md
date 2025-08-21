# Crisis Pulse - AI-Powered Disaster Prediction & Response Platform

A comprehensive disaster management platform that combines AI-powered prediction, real-time alerts, and community response coordination.

## Features

### Core Functionality
- **AI-Powered Disaster Prediction**: Machine learning models for flood, earthquake, drought, and cyclone prediction
- **Real-time Alerts**: Socket.io based real-time notifications and emergency broadcasts
- **Multi-role System**: Support for Volunteers, CRPF personnel, and Administrators
- **Volunteer Ticket System**: Admins can create tasks for disasters; volunteers can claim, complete, and submit them for verification.
- **Community Response**: Volunteer contribution tracking and points system.
- **Weather Integration**: Current weather data and forecasting
- **LLM-Powered Advice**: AI-generated safety and prevention advice

### User Roles
- **Volunteers**: Contribute resources, receive alerts, earn points
- **CRPF Personnel**: Manage disaster response, coordinate volunteers
- **Administrators**: System management, user oversight, and an advanced analytics dashboard with data visualizations and AI-powered insights.

## Architecture

### Tech Stack
- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js/Express with MongoDB
- **AI Service**: Django with REST Framework
- **Real-time**: Socket.io
- **Authentication**: JWT tokens
- **Database**: MongoDB (main), SQLite (AI service)

### Project Structure
```
crisis-pulse/
├── frontend/                 # React.js frontend
├── backend/                  # Node.js/Express backend
├── disaster_ai/             # Django AI service
├── api/                     # Django API models/views
├── india_disaster_data.csv   # Historical disaster data
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Disasters
- `GET /api/disasters` - Get all disasters
- `POST /api/disasters/raise` - Create new disaster alert
- `GET /api/disasters/:id` - Get specific disaster

### AI Service
- `POST /api/predict` - Disaster prediction
- `POST /api/llm-advice` - AI safety advice
- `GET /api/weather/forecast` - Weather forecasting
- `GET /api/analytics/disaster-trends` - Trend analysis
- `GET /api/analytics/insights` - AI-powered insights for the admin dashboard

### Volunteer Tasks
- `GET /api/volunteer-tasks` - Get all open volunteer tasks
- `GET /api/volunteer-tasks/my-tasks` - Get tasks claimed by the logged-in volunteer
- `POST /api/volunteer-tasks/:id/claim` - Claim a volunteer task
- `POST /api/volunteer-tasks/:id/submit` - Submit proof for a volunteer task
- `GET /api/admin/volunteer-tasks` - Get all tasks for admin verification
- `POST /api/admin/volunteer-tasks/:id/verify` - Verify a volunteer task

### Contributions
- `POST /api/contribute` - Submit contribution
- `GET /api/contributions/user/:userId` - User contributions

### Users
- `GET /api/users/me` - Current user profile
- `GET /api/users/nearby/:city` - Users by location
- `GET /api/users/:userId/points` - User points

## Key Features Implementation

### Real-time Alerts
- Socket.io integration for instant notifications
- Location-based alert filtering
- Emergency broadcast system
- User-specific notifications

### AI Prediction System
- Multiple ML model support (LSTM, CNN, Random Forest)
- Ensemble prediction capabilities
- Weather-based prediction triggers
- Historical data analysis

### Points & Rewards
- Contribution-based point system
- Real-time point updates
- Achievement tracking
- Leaderboard functionality

### Safety Center
- AI-generated safety advice
- Emergency contact information
- Evacuation route planning
- Resource availability tracking

## Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Rate limiting

## Data Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['volunteer', 'crpf', 'admin'],
  points: Number,
  location: {
    city: String,
    state: String,
    coordinates: { lat: Number, lon: Number }
  }
}
```

### Disaster Model
```javascript
{
  type: String,
  location: Object,
  severity: ['low', 'medium', 'high'],
  source: ['ai', 'external', 'manual'],
  predictionDate: Date,
  raisedBy: ObjectId (User)
}
```

### Contribution Model
```javascript
{
  userId: ObjectId (User),
  disasterId: ObjectId (Disaster),
  item: String,
  quantity: Number,
  pointsEarned: Number
}
```

### VolunteerTask Model
```javascript
{
  disaster: ObjectId (Disaster),
  description: String,
  requiredSkills: [String],
  status: ['open', 'claimed', 'submitted', 'approved', 'rejected', 'expired'],
  volunteer: ObjectId (User),
  claimedAt: Date,
  deadline: Date,
  proof: String,
  adminFeedback: String
}
```

### Notification Model
```javascript
{
  recipient: String, // User ID or role
  type: String,
  message: String,
  read: Boolean,
  link: String // URL for client-side navigation
}
```

**Crisis Pulse** - Empowering communities through AI-driven disaster preparedness and response.
