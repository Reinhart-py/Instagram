
const { createClient } = require('@supabase/supabase-js');

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;
const POST_ID = process.env.POST_ID;
const KEYWORD = process.env.KEYWORD;
const PRESET_DM = process.env.PRESET_DM;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Instagram API wrapper from instagram-private-api
const { IgApiClient } = require('instagram-private-api');

exports.handler = async function(event, context) {
  console.log("🔄 Starting poll_comments function");
  
  try {
    // Initialize Instagram client
    const ig = new IgApiClient();
    ig.state.generateDevice(IG_USERNAME);
    
    // Login to Instagram
    await ig.account.login(IG_USERNAME, IG_PASSWORD);
    console.log("✅ Logged in to Instagram as", IG_USERNAME);
    
    // Fetch comments from the target post
    console.log(`🔍 Fetching comments for post ID: ${POST_ID}`);
    const comments = await ig.feed.mediaComments(POST_ID).items();
    console.log(`📊 Found ${comments.length} comments`);
    
    // Process each comment
    for (const comment of comments) {
      const commentText = comment.text.toLowerCase();
      const username = comment.user.username;
      const commentId = comment.pk;
      
      // Check if comment already exists in our database
      const { data: existingComment } = await supabase
        .from('comments')
        .select()
        .eq('comment_id', commentId)
        .single();
      
      if (!existingComment) {
        console.log(`📝 Processing new comment from @${username}: "${comment.text}"`);
        
        // Add comment to database
        const { data, error } = await supabase
          .from('comments')
          .insert([
            {
              comment_id: commentId,
              user: username,
              text: comment.text,
              sent: false,
              created_at: new Date().toISOString(),
              post_id: POST_ID
            }
          ]);
        
        if (error) {
          console.error("❌ Error inserting comment:", error);
        } else {
          console.log(`✅ Added comment to database with ID: ${commentId}`);
          
          // Check if comment contains the keyword
          if (commentText.includes(KEYWORD.toLowerCase())) {
            console.log(`🎯 Keyword "${KEYWORD}" found in comment`);
            
            // Log keyword match
            await supabase
              .from('logs')
              .insert([
                {
                  event: 'keyword_match',
                  username: username,
                  details: `Comment "${comment.text}" matched keyword "${KEYWORD}"`,
                  created_at: new Date().toISOString()
                }
              ]);
              
            // Send DM - this could be handled by webhook instead
            // but adding here as fallback
            try {
              const thread = ig.entity.directThread([comment.user.pk.toString()]);
              await thread.broadcastText(PRESET_DM);
              console.log(`📨 DM sent to @${username}`);
              
              // Update comment as sent in database
              await supabase
                .from('comments')
                .update({ sent: true })
                .eq('comment_id', commentId);
              
              // Log DM sent
              await supabase
                .from('logs')
                .insert([
                  {
                    event: 'dm_sent',
                    username: username,
                    details: `DM sent to @${username}`,
                    created_at: new Date().toISOString()
                  }
                ]);
            } catch (dmError) {
              console.error(`❌ Error sending DM to @${username}:`, dmError);
              
              // Log DM error
              await supabase
                .from('logs')
                .insert([
                  {
                    event: 'dm_error',
                    username: username,
                    details: `Error sending DM: ${dmError.message}`,
                    created_at: new Date().toISOString()
                  }
                ]);
            }
          }
        }
      } else {
        console.log(`⏭️ Comment ${commentId} already processed, skipping`);
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: "Comments polling completed",
        processed: comments.length
      })
    };
    
  } catch (error) {
    console.error("❌ Poll comments function error:", error);
    
    // Log the error
    await supabase
      .from('logs')
      .insert([
        {
          event: 'poll_error',
          username: 'system',
          details: `Error in poll_comments function: ${error.message}`,
          created_at: new Date().toISOString()
        }
      ]);
      
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
