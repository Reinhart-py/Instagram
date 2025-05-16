
const { IgApiClient } = require('instagram-private-api');
const { createClient } = require('@supabase/supabase-js');

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async function(event, context) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  try {
    // Test Instagram login
    const igStatus = await testInstagramConnection();
    
    // Test Supabase connection
    const { data, error } = await supabase.from('logs').select('id').limit(1);
    const supabaseStatus = error ? 'error' : 'connected';
    
    // Get latest poll time
    const { data: latestLog } = await supabase
      .from('logs')
      .select('created_at')
      .eq('event', 'poll_comments')
      .order('created_at', { ascending: false })
      .limit(1);
      
    const lastPollTime = latestLog && latestLog.length > 0 ? latestLog[0].created_at : null;
    
    // Get system status
    const systemStatus = igStatus === 'connected' && supabaseStatus === 'connected' 
      ? 'running' : 'error';
      
    // Log health check
    await supabase
      .from('logs')
      .insert([{
        event: 'health_check',
        username: 'system',
        details: `Health check completed. System status: ${systemStatus}`,
      }]);
      
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: systemStatus,
        instagram: igStatus,
        supabase: supabaseStatus,
        lastPollTime,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Health check error:', error);
    
    // Log the error
    await supabase
      .from('logs')
      .insert([{
        event: 'health_check_error',
        username: 'system',
        details: `Error: ${error.message}`,
      }]);
      
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Function to test Instagram connection
async function testInstagramConnection() {
  try {
    if (!IG_USERNAME || !IG_PASSWORD) {
      return 'unconfigured';
    }
    
    console.log(`🔑 Testing Instagram login for @${IG_USERNAME}...`);
    
    const ig = new IgApiClient();
    ig.state.generateDevice(IG_USERNAME);
    
    // Try to login
    await ig.account.login(IG_USERNAME, IG_PASSWORD);
    
    console.log('✅ Instagram connection successful!');
    return 'connected';
  } catch (error) {
    console.error('❌ Instagram connection error:', error.message);
    return 'error';
  }
}
