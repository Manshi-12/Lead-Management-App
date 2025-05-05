import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box, Typography } from '@mui/material';
import LeadForm from './components/LeadForm';
import LeadList from './components/LeadList';
import FacebookSync from './components/FacebookSync';
import Login from './components/Login';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Container>
                <Box sx={{ my: 4 }}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    Lead Management System
                  </Typography>
                  <FacebookSync />
                  <LeadForm />
                  <LeadList />
                </Box>
              </Container>
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App; 