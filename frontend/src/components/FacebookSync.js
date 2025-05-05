import React, { useState, useEffect } from 'react';
import {
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Facebook as FacebookIcon, Refresh as RefreshIcon, Info as InfoIcon } from '@mui/icons-material';
import axios from 'axios';

const FacebookSync = ({ onSyncComplete }) => {
  const [accessToken, setAccessToken] = useState('');
  const [pageId, setPageId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');

  useEffect(() => {
    // Check for Facebook callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleFacebookCallback(code);
    } else {
      // Try to get stored token
      getStoredToken();
    }
  }, []);

  const getStoredToken = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/leads/facebook-token`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.accessToken) {
        setAccessToken(response.data.accessToken);
        setPages(response.data.pages);
      }
    } catch (error) {
      console.error('Error getting stored token:', error);
    }
  };

  const handleFacebookCallback = async (code) => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/leads/facebook-callback?code=${code}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setAccessToken(response.data.accessToken);
      setPages(response.data.pages);
      
      // Remove the code from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Facebook callback error:', error);
      setError(error.response?.data?.error || error.response?.data?.message || 'Error connecting to Facebook');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/leads/sync-facebook`,
        { accessToken, pageId: selectedPage },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSuccess(true);
      setLastSync(new Date());
      onSyncComplete(response.data.syncedLeads);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error syncing leads';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectFacebook = () => {
    window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.REACT_APP_FACEBOOK_APP_ID}&redirect_uri=${window.location.origin}/dashboard&scope=pages_show_list,pages_manage_metadata,pages_read_engagement`;
  };

  return (
    <Card sx={{ mt: 3, maxWidth: 600, mx: 'auto' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FacebookIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Facebook Lead Integration
            </Typography>
          </Box>
          <Tooltip title="Help">
            <IconButton onClick={() => setShowHelp(true)}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Leads synced successfully!
          </Alert>
        )}

        {lastSync && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Last synced: {new Date(lastSync).toLocaleString()}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<FacebookIcon />}
            onClick={handleConnectFacebook}
            disabled={loading}
          >
            Connect Facebook
          </Button>
          
          <Tooltip title="Refresh leads">
            <IconButton
              onClick={handleSync}
              disabled={loading || !selectedPage}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {pages.length > 0 && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Page</InputLabel>
            <Select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              label="Select Page"
            >
              {pages.map((page) => (
                <MenuItem key={page.id} value={page.id}>
                  {page.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <TextField
          fullWidth
          label="Facebook Access Token"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          margin="normal"
          helperText="Get this from Facebook Developer Console"
          disabled={pages.length > 0}
        />
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        <Button
          variant="contained"
          onClick={handleSync}
          disabled={loading || (!selectedPage && !accessToken)}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Syncing...' : 'Sync Leads'}
        </Button>
      </CardActions>

      <Dialog open={showHelp} onClose={() => setShowHelp(false)}>
        <DialogTitle>How to Connect Facebook</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            To connect your Facebook account:
          </Typography>
          <Typography variant="body2" component="div" sx={{ mb: 2 }}>
            <ol>
              <li>Click the "Connect Facebook" button</li>
              <li>Log in to your Facebook account if prompted</li>
              <li>Authorize the app to access your pages and leads</li>
              <li>Select your page from the dropdown</li>
              <li>Click "Sync Leads" to fetch your leads</li>
            </ol>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHelp(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default FacebookSync; 