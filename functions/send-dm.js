
const { createClient } = require('@supabase/supabase-js');
const { IgApiClient } = require('instagram-private-api');

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;
const PRESET_DM = process.env.PRESET_DM;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper function to rate limit requests
const rateLimitState = {
  lastRequest: {},
  cooldownPeriod: 60000 // 1 minute cooldown
};

function checkRateLimit(username) {
  const now = Date.now();
  const lastReq = rateLimitState.lastRequest[username] || 0;
  
  if (now - lastReq < rateLimitState.cooldownPeriod) {
    const waitTime = Math.ceil((rateLimitState.cooldownPeriod - (now - lastReq)) / 1000);
    throw new Error(`Rate limited: Please wait ${waitTime} seconds before sending another DM to this user`);
  }
  
  rateLimitState.lastRequest[username] = now;
  return true;
}

exports.handler = async function(event, context) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  
  // Handle OPTIONS requests for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }
  
  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { username, message = PRESET_DM } = body;
    
    if (!username) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Username is required' })
      };
    }
    
    // Apply rate limiting
    try {
      checkRateLimit(username);
    } catch (rateLimitError) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ 
          message: rateLimitError.message,
          retryAfter: Math.ceil(rateLimitState.cooldownPeriod / 1000)
        })
      };
    }
    
    console.log(`📨 Sending test DM to @${username}`);
    
    // Get active template if no message is provided
    if (!message) {
      const { data: template, error: templateError } = await supabase
        .from('templates')
        .select('content')
        .eq('is_active', true)
        .single();
        
      if (!templateError) {
        message = template.content;
      }
    }
    
    // Initialize Instagram client
    const ig = new IgApiClient();
    ig.state.generateDevice(IG_USERNAME);
    
    // Login to Instagram
    await ig.account.login(IG_USERNAME, IG_PASSWORD);
    
    // Find the user
    const searchResult = await ig.user.searchExact(username);
    
    if (!searchResult) {
      throw new Error(`User @${username} not found`);
    }
    
    // Send DM
    const thread = ig.entity.directThread([searchResult.pk.toString()]);
    await thread.broadcastText(message);
    
    console.log(`✅ DM sent to @${username}`);
    
    // Log the test DM
    await supabase
      .from('logs')
      .insert([{
        event: 'test_dm_sent',
        username,
        details: `Test DM sent to @${username}`,
        created_at: new Date().toISOString()
      }]);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: `DM sent successfully to @${username}`,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Error sending test DM:', error);
    
    // Log the error
    try {
      await supabase
        .from('logs')
        .insert([{
          event: 'test_dm_error',
          username: body?.username || 'unknown',
          details: `Error sending test DM: ${error.message}`,
          created_at: new Date().toISOString()
        }]);
    } catch (logError) {
      console.error('Error logging to Supabase:', logError);
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Failed to send DM',
        error: error.message
      })
    };
  }
};
