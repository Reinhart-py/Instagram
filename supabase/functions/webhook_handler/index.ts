
// Follow this setup guide to integrate the Deno standard library
// https://deno.land/manual/examples/manage_dependencies

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { IgApiClient } from "https://esm.sh/instagram-private-api@1.46.1";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-key",
};

// Main function to send DM via Instagram API
async function sendDirectMessage(username: string, message: string, igUsername: string, igPassword: string) {
  console.log(`📱 Attempting to send DM to @${username}...`);
  
  const ig = new IgApiClient();
  ig.state.generateDevice(igUsername);
  
  try {
    // Login to Instagram
    await ig.account.login(igUsername, igPassword);
    console.log('✅ Successfully logged in to Instagram!');
    
    // Search for the user
    console.log(`🔍 Looking up @${username}...`);
    const targetUser = await ig.user.searchExact(username);
    
    if (!targetUser) {
      throw new Error(`User @${username} not found`);
    }
    
    console.log(`✅ Found user @${username}!`);
    
    // Send DM
    console.log(`📨 Sending DM: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"...`);
    const thread = ig.entity.directThread([targetUser.pk.toString()]);
    await thread.broadcastText(message);
    
    console.log('✅ Direct message sent successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error sending DM:', error.message);
    throw error;
  }
}

async function handleNewComment(comment: any, supabase: any) {
  try {
    // Get environment variables
    const igUsername = Deno.env.get("IG_USERNAME");
    const igPassword = Deno.env.get("IG_PASSWORD");
    const defaultKeyword = Deno.env.get("KEYWORD") || "help";
    const defaultDm = Deno.env.get("PRESET_DM") || "Thanks for your comment! How can I help you today?";
    
    if (!igUsername || !igPassword) {
      throw new Error("Instagram credentials not configured");
    }
    
    // Get configuration from database
    const { data: config, error: configError } = await supabase
      .from("config")
      .select("keyword")
      .single();
      
    if (configError && configError.code !== 'PGRST116') {
      throw configError;
    }
    
    const keyword = config?.keyword || defaultKeyword;
    
    // Check if the comment contains the keyword
    const hasKeyword = comment.text.toLowerCase().includes(keyword.toLowerCase());
    
    if (!hasKeyword) {
      console.log(`Comment doesn't contain keyword "${keyword}"`);
      return new Response(JSON.stringify({ status: "skipped", message: "No keyword match" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log(`Keyword "${keyword}" found in comment from @${comment.username}`);
    
    // Get active message template
    const { data: template, error: templateError } = await supabase
      .from("templates")
      .select("content")
      .eq("is_active", true)
      .single();
      
    if (templateError && templateError.code !== 'PGRST116') {
      throw templateError;
    }
    
    const messageToSend = template?.content || defaultDm;
    
    // Send the DM
    await sendDirectMessage(comment.username, messageToSend, igUsername, igPassword);
    
    // Update the comment as sent
    const { data: updateData, error: updateError } = await supabase
      .from("comments")
      .update({ sent: true })
      .eq("id", comment.id)
      .select();
      
    if (updateError) throw updateError;
    
    // Log the action
    const { error: logError } = await supabase
      .from("logs")
      .insert([{
        event: "dm_sent",
        username: comment.username,
        details: `DM sent by webhook handler: "${messageToSend.substring(0, 50)}${messageToSend.length > 50 ? '...' : ''}"`,
      }]);
      
    if (logError) throw logError;
    
    return new Response(JSON.stringify({
      status: "success",
      message: `DM sent to @${comment.username}`,
      comment: updateData[0]
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error processing comment:", error);
    
    // Log the error
    await supabase
      .from("logs")
      .insert([{
        event: "webhook_error",
        username: comment?.username || "unknown",
        details: `Error: ${error.message}`,
      }]);
      
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

serve(async (req) => {
  // This is needed for preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Check for authorization
    const supabaseKey = req.headers.get("x-supabase-key");
    const envKey = Deno.env.get("SUPABASE_KEY");
    
    if (supabaseKey !== envKey) {
      return new Response(JSON.stringify({ 
        error: "Unauthorized: Invalid or missing API key" 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse the webhook payload
    const payload = await req.json();
    
    // Handle different types of events
    if (payload.type === "INSERT" && payload.table === "comments") {
      return handleNewComment(payload.record, supabase);
    }
    
    return new Response(JSON.stringify({ 
      status: "ignored", 
      message: "Not a relevant webhook event" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Webhook handler error:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
