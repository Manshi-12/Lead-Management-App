# Lead Management System

A modern lead management solution with Facebook integration, automated follow-ups, and comprehensive analytics.

## Features

- Multi-source lead collection (Manual, Facebook, Custom Forms)
- Lead tracking and management
- Automated follow-up system
- Facebook lead form integration
- Real-time analytics and reporting
- User-friendly dashboard

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Facebook Developer Account

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd Lead-Management-App
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Environment Setup

### Backend (.env)
Create a `.env` file in the backend directory with:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/leadsdb
JWT_SECRET=test_jwt_secret_123
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
FACEBOOK_APP_ID=your_id
FACEBOOK_APP_SECRET=your_secret
FACEBOOK_VERIFY_TOKEN=dummy_verify_token_123
APP_URL=http://localhost:3000 
```

### Frontend (.env)
Create a `.env` file in the frontend directory with:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FACEBOOK_APP_ID=your_id
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Facebook Integration Setup

1. Create a Facebook Developer account
2. Create a new app in the Facebook Developer Console
3. Configure OAuth settings with the callback URL
4. Add the app credentials to your environment files
