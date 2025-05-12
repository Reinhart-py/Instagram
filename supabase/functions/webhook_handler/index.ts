
// Follow this setup guide to integrate the Deno standard library
// https://deno.land/manual/examples/manage_dependencies

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function handleNewComment(comment: any, supabase: any, env: any) {
  try {
    // Check if the comment contains the keyword
    if (!comment.text.toLowerCase().includes(env.KEYWORD.toLowerCase())) {
      console.log(`Comment doesn't contain keyword "${env.KEYWORD}"`);
      return new Response(JSON.stringify({ status: "skipped", message: "No keyword match" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Keyword match found in comment from @${comment.user}`);

    // In a real implementation, this is where you'd call the Instagram API to send a DM
    // For security reasons, we'll just log it and update the database

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
        username: comment.user,
        details: `DM sent by webhook handler: "${env.PRESET_DM}"`,
        created_at: new Date().toISOString()
      }]);

    if (logError) throw logError;

    return new Response(JSON.stringify({
      status: "success",
      message: `DM sent to @${comment.user}`,
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
        username: comment?.user || "unknown",
        details: `Error: ${error.message}`,
        created_at: new Date().toISOString()
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
    // Get environment variables
    const env = {
      KEYWORD: Deno.env.get("KEYWORD") || "help", // Default keyword
      PRESET_DM: Deno.env.get("PRESET_DM") || "Thanks for your comment! How can I help you today?",
    };

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the webhook payload
    const payload = await req.json();
    
    // For this demo, we're simplifying the webhook payload structure
    if (payload.type === "INSERT" && payload.table === "comments") {
      const comment = payload.record;
      return handleNewComment(comment, supabase, env);
    }

    return new Response(JSON.stringify({ status: "ignored", message: "Not a comment insert event" }), {
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
