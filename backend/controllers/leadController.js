const Lead = require('../models/Lead');
const axios = require('axios');

// Store Facebook tokens
let facebookTokens = {};

// Create a new lead manually
exports.createLead = async (req, res) => {
  try {
    const lead = new Lead({
      ...req.body,
      source: 'manual'
    });
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all leads with filtering
exports.getLeads = async (req, res) => {
  try {
    const { source, status, startDate, endDate } = req.query;
    const filter = {};

    if (source) filter.source = source;
    if (status) filter.status = status;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle Facebook OAuth callback
exports.handleFacebookCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Check if we already have a valid token
    if (facebookTokens.accessToken && facebookTokens.expiresAt > Date.now()) {
      return res.json({
        accessToken: facebookTokens.accessToken,
        pages: facebookTokens.pages
      });
    }

    // Exchange code for access token
    const tokenResponse = await axios.get(
      'https://graph.facebook.com/v19.0/oauth/access_token',
      {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: `${process.env.APP_URL}/dashboard`,
          code
        }
      }
    );

    const { access_token, expires_in } = tokenResponse.data;
    
    // Get user's pages
    const pagesResponse = await axios.get(
      'https://graph.facebook.com/v19.0/me/accounts',
      {
        params: {
          access_token,
          fields: 'id,name,access_token',
          limit: 100
        }
      }
    );

    // Store the token and pages
    facebookTokens = {
      accessToken: access_token,
      pages: pagesResponse.data.data,
      expiresAt: Date.now() + (expires_in * 1000) // Convert to milliseconds
    };

    res.json({
      accessToken: access_token,
      pages: pagesResponse.data.data
    });
  } catch (error) {
    console.error('Facebook callback error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Error connecting to Facebook',
      error: error.response?.data?.error?.message || error.message
    });
  }
};

// Get stored Facebook token
exports.getFacebookToken = async (req, res) => {
  try {
    if (!facebookTokens.accessToken || facebookTokens.expiresAt <= Date.now()) {
      return res.status(404).json({ message: 'No valid Facebook token found' });
    }

    res.json({
      accessToken: facebookTokens.accessToken,
      pages: facebookTokens.pages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sync Facebook leads
exports.syncFacebookLeads = async (req, res) => {
  try {
    const { accessToken, pageId } = req.body;
    
    // First, verify the access token and page ID
    try {
      await axios.get(
        `https://graph.facebook.com/v18.0/${pageId}`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,name'
          }
        }
      );
    } catch (error) {
      return res.status(400).json({ 
        message: 'Invalid access token or page ID',
        error: error.response?.data?.error?.message || 'Facebook API error'
      });
    }

    // Get lead forms for the page
    let forms = [];
    try {
      const formsResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${pageId}/leadgen_forms`,
        {
          params: {
            access_token: accessToken
          }
        }
      );
      forms = formsResponse.data.data || [];
    } catch (error) {
      console.error('Error fetching forms:', error.response?.data);
      return res.status(400).json({ 
        message: 'Error fetching lead forms',
        error: error.response?.data?.error?.message || 'Facebook API error'
      });
    }

    if (!forms || forms.length === 0) {
      return res.status(200).json({ 
        message: 'No lead forms found for this page',
        syncedLeads: []
      });
    }

    let syncedLeads = [];

    // Get leads for each form
    for (const form of forms) {
      try {
        const leadsResponse = await axios.get(
          `https://graph.facebook.com/v18.0/${form.id}/leads`,
          {
            params: {
              access_token: accessToken
            }
          }
        );

        const leads = leadsResponse.data.data || [];

        // Save each lead
        for (const lead of leads) {
          const existingLead = await Lead.findOne({ facebookLeadId: lead.id });
          
          if (!existingLead) {
            const newLead = new Lead({
              firstName: lead.field_data?.find(f => f.name === 'first_name')?.values?.[0] || '',
              lastName: lead.field_data?.find(f => f.name === 'last_name')?.values?.[0] || '',
              email: lead.field_data?.find(f => f.name === 'email')?.values?.[0] || '',
              phone: lead.field_data?.find(f => f.name === 'phone_number')?.values?.[0] || '',
              source: 'facebook',
              facebookLeadId: lead.id,
              formData: new Map(lead.field_data?.map(f => [f.name, f.values?.[0]]) || [])
            });

            await newLead.save();
            syncedLeads.push(newLead);
          }
        }
      } catch (error) {
        console.error(`Error processing form ${form.id}:`, error.response?.data);
        // Continue with next form even if one fails
      }
    }

    res.json({ 
      message: 'Leads synced successfully', 
      syncedLeads,
      totalForms: forms.length
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ 
      message: 'Error syncing leads',
      error: error.message
    });
  }
}; 