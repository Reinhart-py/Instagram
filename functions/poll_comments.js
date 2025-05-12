
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const POST_ID = process.env.POST_ID;
const KEYWORD = process.env.KEYWORD;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async function(event, context) {
  console.log('Instagram comment polling started');
  
  try {
    // Get configuration from database
    const { data: config, error: configError } = await supabase
      .from('config')
      .select('keyword, post_id')
      .single();
      
    if (configError) throw configError;
    
    // Use config from DB or fallback to env variables
    const keyword = config?.keyword || KEYWORD;
    const postId = config?.post_id || POST_ID;
    
    if (!postId) {
      throw new Error('No Instagram post ID configured');
    }
    
    console.log(`Fetching comments for post: ${postId}, keyword: "${keyword}"`);
    
    // Fetch comments from Instagram Graph API (in a real implementation)
    // For demo purposes, we'll simulate this with a mock response
    
    // In a real implementation, you'd use the Instagram Graph API:
    // const response = await fetch(`https://graph.instagram.com/${postId}/comments?access_token=${IG_ACCESS_TOKEN}`);
    // const data = await response.json();
    
    // For demo purposes, generate a mock comment
    const username = `test_user_${Math.floor(Math.random() * 1000)}`;
    const mockComment = {
      id: `comment_${Date.now()}`,
      username: username,
      text: Math.random() > 0.5 ? 
        `I need ${keyword} with my order please!` : 
        "Great product, love it!"
    };
    
    // Check if the comment contains the keyword
    const matchesKeyword = mockComment.text.toLowerCase().includes(keyword.toLowerCase());
    
    if (matchesKeyword) {
      console.log(`Found comment with keyword "${keyword}" from @${mockComment.username}`);
      
      // Check if comment already exists in database
      const { data: existingComment } = await supabase
        .from('comments')
        .select()
        .eq('comment_id', mockComment.id)
        .single();
      
      if (!existingComment) {
        // Insert new comment into database
        const { data: newComment, error: insertError } = await supabase
          .from('comments')
          .insert([{
            comment_id: mockComment.id,
            username: mockComment.username,
            text: mockComment.text,
            sent: false,
            post_id: postId
          }]);
          
        if (insertError) throw insertError;
        
        console.log(`New comment saved: "${mockComment.text}" by @${mockComment.username}`);
        
        // Log the activity
        await supabase
          .from('logs')
          .insert([{
            event: 'comment_detected',
            username: mockComment.username,
            details: `New comment detected with keyword "${keyword}"`,
          }]);
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Instagram comments polled successfully',
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Error polling Instagram comments:', error);
    
    // Log the error
    try {
      await supabase
        .from('logs')
        .insert([{
          event: 'poll_error',
          username: 'system',
          details: `Error: ${error.message}`,
        }]);
    } catch (logError) {
      console.error('Error logging to Supabase:', logError);
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to poll Instagram comments',
        error: error.message
      })
    };
  }
};
