
const { createClient } = require('@supabase/supabase-js');
const { IgApiClient } = require('instagram-private-api');

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;
const AUTO_RESTART = process.env.AUTO_RESTART_ON_ERROR === 'true';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Global state for health tracking
const healthState = {
  lastCheck: Date.now(),
  status: 'initializing',
  details: {},
  checks: {
    instagram: false,
    supabase: false,
    scheduler: false
  },
  errors: []
};

// Set a basic retry timeout if needed
let retryTimeout = null;

async function checkInstagram() {
  try {
    // Check if Instagram credentials exist
    if (!IG_USERNAME || !IG_PASSWORD) {
      throw new Error('Instagram credentials not configured');
    }
    
    // Initialize Instagram client
    const ig = new IgApiClient();
    ig.state.generateDevice(IG_USERNAME);
    
    // Test login (but catch error for bad credentials)
    await ig.account.login(IG_USERNAME, IG_PASSWORD);
    
    healthState.checks.instagram = true;
    return true;
  } catch (error) {
    healthState.errors.push({
      component: 'instagram',
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    healthState.checks.instagram = false;
    return false;
  }
}

async function checkSupabase() {
  try {
    // Check Supabase connection
    const { data, error } = await supabase.from('config').select('id').limit(1);
    
    if (error) throw error;
    
    healthState.checks.supabase = true;
    return true;
  } catch (error) {
    healthState.errors.push({
      component: 'supabase',
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    healthState.checks.supabase = false;
    return false;
  }
}

async function checkScheduler() {
  try {
    // For Netlify, we'll check when the last poll happened
    const { data, error } = await supabase
      .from('logs')
      .select('created_at')
      .eq('event', 'poll_error')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) throw error;
    
    // If there's a recent poll error within the last 10 minutes, consider the scheduler unhealthy
    if (data && data.length > 0) {
      const lastErrorTime = new Date(data[0].created_at).getTime();
      const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
      
      if (lastErrorTime > tenMinutesAgo) {
        throw new Error('Recent polling errors detected');
      }
    }
    
    healthState.checks.scheduler = true;
    return true;
  } catch (error) {
    healthState.errors.push({
      component: 'scheduler',
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    healthState.checks.scheduler = false;
    return false;
  }
}

async function performHealthCheck() {
  healthState.lastCheck = Date.now();
  
  // Perform all checks in parallel
  const [instagramOk, supabaseOk, schedulerOk] = await Promise.all([
    checkInstagram(),
    checkSupabase(),
    checkScheduler()
  ]);
  
  // Determine overall health status
  if (instagramOk && supabaseOk && schedulerOk) {
    healthState.status = 'running';
  } else if (supabaseOk) { // As long as Supabase is OK, we're not completely down
    healthState.status = 'degraded';
  } else {
    healthState.status = 'error';
  }
  
  // If auto-restart is enabled and we're in error, schedule a retry
  if (AUTO_RESTART && healthState.status === 'error') {
    if (retryTimeout) clearTimeout(retryTimeout);
    
    retryTimeout = setTimeout(async () => {
      console.log('🔄 Auto-recovery: Attempting to restart services...');
      await performHealthCheck();
    }, 60000); // Retry after 60 seconds
  }
  
  // Log health check result to Supabase
  try {
    await supabase.from('logs').insert([{
      event: 'health_check',
      username: 'system',
      details: `Health check: ${healthState.status}`,
    }]);
  } catch (logError) {
    console.error('Error logging health check:', logError);
  }
  
  return healthState;
}

exports.handler = async function(event, context) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'no-cache'
  };
  
  // Handle OPTIONS requests for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }
  
  try {
    // Perform health check
    const health = await performHealthCheck();
    
    // Return health data
    return {
      statusCode: health.status === 'error' ? 503 : 200, // Service unavailable if error
      headers,
      body: JSON.stringify({
        status: health.status,
        checks: health.checks,
        lastCheck: new Date(health.lastCheck).toISOString(),
        errors: health.errors.slice(0, 5), // Only return the 5 most recent errors
        autoRecovery: AUTO_RESTART
      })
    };
  } catch (error) {
    console.error('❌ Error in health check:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: 'Failed to perform health check',
        error: error.message
      })
    };
  }
};
