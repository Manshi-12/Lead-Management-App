const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const auth = require('../middleware/auth');

// Protected routes
router.post('/', auth, leadController.createLead);
router.get('/', auth, leadController.getLeads);
router.post('/sync-facebook', auth, leadController.syncFacebookLeads);
router.get('/facebook-callback', leadController.handleFacebookCallback);
router.get('/facebook-token', auth, leadController.getFacebookToken);

module.exports = router; 