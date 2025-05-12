
import { createClient } from '@supabase/supabase-js';
import { IgApiClient } from 'instagram-private-api';

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function handle_webhook(req, res) {
  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  // Validate the request
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 405 
    });
  }

  // Get Supabase credentials and Instagram settings from environment
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const IG_USERNAME = Deno.env.get('IG_USERNAME');
  const IG_PASSWORD = Deno.env.get('IG_PASSWORD');
  const PRESET_DM = Deno.env.get('PRESET_DM');
  const KEYWORD = Deno.env.get('KEYWORD');

  // Init Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // Parse the request body
    const { record } = await req.json();
    
    if (!record) {
      console.error("No record found in webhook payload");
      return new Response(JSON.stringify({ error: "Invalid webhook payload" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    console.log("📥 Webhook received for comment:", record);
    
    // Skip if DM already sent
    if (record.sent) {
      console.log(`⏭️ DM already sent for comment ${record.comment_id}, skipping`);
      return new Response(JSON.stringify({ status: "skipped", message: "DM already sent" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Check for keyword
    if (!record.text.toLowerCase().includes(KEYWORD.toLowerCase())) {
      console.log(`❌ Comment does not contain keyword "${KEYWORD}", skipping`);
      return new Response(JSON.stringify({ status: "skipped", message: "Keyword not found" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`🎯 Keyword "${KEYWORD}" found in comment, sending DM to @${record.user}`);
    
    // Initialize Instagram client
    const ig = new IgApiClient();
    ig.state.generateDevice(IG_USERNAME);
    
    // Login
    await ig.account.login(IG_USERNAME, IG_PASSWORD);
    
    // Find the user
    const userResult = await ig.user.searchExact(record.user);
    
    if (!userResult) {
      throw new Error(`User @${record.user} not found`);
    }
    
    // Send DM
    const thread = ig.entity.directThread([userResult.pk.toString()]);
    await thread.broadcastText(PRESET_DM);
    
    console.log(`📨 DM sent to @${record.user}`);
    
    // Update comment as sent
    await supabase
      .from('comments')
      .update({ sent: true })
      .eq('comment_id', record.comment_id);
      
    // Log DM sent
    await supabase
      .from('logs')
      .insert([{
        event: 'dm_sent',
        username: record.user,
        details: `DM sent via webhook: "${PRESET_DM}"`,
        created_at: new Date().toISOString()
      }]);
      
    return new Response(JSON.stringify({ 
      status: "success", 
      message: `DM sent to @${record.user}` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("❌ Webhook handler error:", error);
    
    // Log error
    await supabase
      .from('logs')
      .insert([{
        event: 'webhook_error',
        username: 'system',
        details: `Error in webhook: ${error.message}`,
        created_at: new Date().toISOString()
      }]);
      
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// This is for Supabase Edge Functions
Deno.serve(handle_webhook);
