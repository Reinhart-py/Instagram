
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
      
    if (templateError) {
      throw new Error(`Failed to get template: ${templateError.message}`);
    }
    
    // Use the template or fallback to environment variable
    const messageToSend = template?.content || PRESET_DM || "Thanks for your comment!";
    
    // In a real implementation, we'd send the DM via Instagram API
    // For demo purposes, we'll just simulate a successful send
    
    /*
    // Real implementation would look like:
    const ig = new IgApiClient();
    ig.state.generateDevice(IG_USERNAME);
    await ig.account.login(IG_USERNAME, IG_PASSWORD);
    
    const targetUser = await ig.user.searchExact(record.username);
    const thread = ig.entity.directThread([targetUser.pk.toString()]);
    await thread.broadcastText(messageToSend);
    */
    
    // Simulate delay for the "API call"
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
