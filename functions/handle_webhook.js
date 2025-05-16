
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

// Main function to send a DM
async function sendDirectMessage(username, message) {
  console.log(`📱 Logging in as @${IG_USERNAME}...`);
  
  const ig = new IgApiClient();
  ig.state.generateDevice(IG_USERNAME);
  
  try {
    // Login
    await ig.account.login(IG_USERNAME, IG_PASSWORD);
    console.log('✅ Successfully logged in!');
    
    // Search for the user
    console.log(`🔍 Looking up @${username}...`);
    const targetUser = await ig.user.searchExact(username);
    
    if (!targetUser) {
      throw new Error(`User @${username} not found`);
    }
    
    console.log(`✅ Found user @${username} (${targetUser.full_name || 'No name'})!`);
    
    // Send DM
    console.log(`📨 Sending DM: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"...`);
    const thread = ig.entity.directThread([targetUser.pk.toString()]);
    await thread.broadcastText(message);
    
    console.log('✅ Direct message sent successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

exports.handler = async function(event, context) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Supabase-Key',
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
    // Check for authorization
    const supabaseKey = event.headers['x-supabase-key'];
    if (supabaseKey !== SUPABASE_KEY) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Unauthorized: Invalid or missing API key' })
      };
    }
    
    // Parse the webhook payload
    const payload = JSON.parse(event.body || '{}');
    const { type, table, record } = payload;
    
    // We only care about new comments that haven't been processed
    if (type !== 'INSERT' || table !== 'comments' || record.sent === true) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          status: 'ignored',
          message: 'Not a relevant webhook event' 
        })
      };
    }
    
    console.log(`📬 Processing new comment from @${record.username}`);
    
    // Get the active message template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .single();
      
    if (templateError && templateError.code !== 'PGRST116') {
      throw new Error(`Failed to get template: ${templateError.message}`);
    }
    
    // Get keyword from configuration
    const { data: config, error: configError } = await supabase
      .from('config')
      .select('keyword')
      .single();
      
    if (configError && configError.code !== 'PGRST116') {
      throw new Error(`Failed to get config: ${configError.message}`);
    }
    
    const keyword = config?.keyword || KEYWORD || 'help';
    
    // Check if comment contains the keyword
    const hasKeyword = record.text.toLowerCase().includes((keyword || '').toLowerCase());
    
    if (!hasKeyword) {
      console.log(`Comment doesn't contain keyword "${keyword}", skipping`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          status: 'skipped',
          message: 'Comment does not contain the trigger keyword' 
        })
      };
    }
    
    // Use the template or fallback to environment variable
    const messageToSend = template?.content || PRESET_DM || "Thanks for your comment!";
    
    // Send the DM
    await sendDirectMessage(record.username, messageToSend);
    
    // Update the comment as sent
    const { data: updateData, error: updateError } = await supabase
      .from('comments')
      .update({ sent: true })
      .eq('id', record.id)
      .select();
      
    if (updateError) {
      throw new Error(`Failed to update comment: ${updateError.message}`);
    }
    
    // Log the successful DM
    await supabase
      .from('logs')
      .insert([{
        event: 'dm_sent',
        username: record.username,
        details: `DM sent: "${messageToSend.substring(0, 50)}${messageToSend.length > 50 ? '...' : ''}"`,
      }]);
      
    console.log(`✅ DM sent to @${record.username}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        message: `DM sent to @${record.username}`,
        template: template?.name || 'Default'
      })
    };
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    
    // Log the error
    try {
      await supabase
        .from('logs')
        .insert([{
          event: 'webhook_error',
          username: 'system',
          details: `Error: ${error.message}`,
        }]);
    } catch (logError) {
      console.error('Error logging to Supabase:', logError);
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: 'Failed to process webhook',
        error: error.message
      })
    };
  }
};
