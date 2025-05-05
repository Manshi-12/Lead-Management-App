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
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/auth/facebook/callback
```

### Frontend (.env)
Create a `.env` file in the frontend directory with:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
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
 
