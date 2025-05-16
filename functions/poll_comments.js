
const { createClient } = require('@supabase/supabase-js');
const { IgApiClient } = require('instagram-private-api');
const fetch = require('node-fetch');

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const POST_ID = process.env.POST_ID;
const KEYWORD = process.env.KEYWORD;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to fetch comments using private Instagram API
async function fetchCommentsWithPrivateApi(postId) {
  console.log('📱 Attempting to fetch comments using Private API...');
  
  if (!IG_USERNAME || !IG_PASSWORD) {
    throw new Error('Instagram credentials not configured');
  }
  
  const ig = new IgApiClient();
  ig.state.generateDevice(IG_USERNAME);
  
  try {
    // Login
    await ig.account.login(IG_USERNAME, IG_PASSWORD);
    console.log('✅ Successfully logged in!');
    
    // Get media ID (if numeric ID is provided)
    let mediaId = postId;
    if (!/^\d+_\d+$/.test(postId)) {
      // If the ID format doesn't match Instagram's internal format, try to get it from the shortcode
      const mediaInfo = await ig.media.info(postId);
      mediaId = mediaInfo.id;
    }
    
    // Fetch comments
    const commentsResponse = await ig.media.comments(mediaId);
    console.log(`✅ Retrieved ${commentsResponse.comments?.length || 0} comments`);
    
    // Format comments to match our schema
    return (commentsResponse.comments || []).map(comment => ({
      id: comment.pk.toString(),
      username: comment.user.username,
      text: comment.text,
      timestamp: new Date(comment.created_at_utc * 1000).toISOString()
    }));
  } catch (error) {
    console.error('❌ Error using Private API:', error.message);
    throw error;
  }
}

// Function to fetch comments from Instagram Graph API
async function fetchCommentsWithGraphApi(postId, accessToken) {
  if (!accessToken) {
    throw new Error('Instagram Graph API token not available');
  }
  
  try {
    console.log('📊 Fetching comments via Graph API...');
    const response = await fetch(`https://graph.instagram.com/${postId}/comments?access_token=${accessToken}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Instagram API Error: ${data.error.message}`);
    }
    
    return data.data.map(comment => ({
      id: comment.id,
      username: comment.username || 'unknown_user',
      text: comment.text,
      timestamp: comment.timestamp
    }));
  } catch (error) {
    console.error('❌ Error using Graph API:', error);
    throw error;
  }
}

// Function to create mock comments for testing/development
function getMockComments() {
  // Generate random comments with the keyword about 50% of the time
  const username = `test_user_${Math.floor(Math.random() * 1000)}`;
  const hasKeyword = Math.random() > 0.5;
  const keyword = KEYWORD || 'help';
  
  return [{
    id: `comment_${Date.now()}`,
    username: username,
    text: hasKeyword ? 
      `I need ${keyword} with my order please!` : 
      "Great product, love it!",
    timestamp: new Date().toISOString()
  }];
}

// Main handler function
exports.handler = async function(event, context) {
  console.log('📊 Instagram comment polling started');
  
  try {
    // Log the poll event
    await supabase
      .from('logs')
      .insert([{
        event: 'poll_comments',
        username: 'system',
        details: 'Polling for new comments started',
      }]);
      
    // Get configuration from database
    const { data: config, error: configError } = await supabase
      .from('config')
      .select('keyword, post_id')
      .single();
      
    if (configError && configError.code !== 'PGRST116') {
      throw configError;
    }
    
    // Use config from DB or fallback to env variables
    const keyword = config?.keyword || KEYWORD || 'help';
    const postId = config?.post_id || POST_ID;
    
    if (!postId) {
      throw new Error('No Instagram post ID configured');
    }
    
    console.log(`🔎 Fetching comments for post: ${postId}, keyword: "${keyword}"`);
    
    // Try to fetch comments using various methods
    let comments = [];
    let methodUsed = 'none';
    
    try {
      // Try Private API first
      comments = await fetchCommentsWithPrivateApi(postId);
      methodUsed = 'private_api';
    } catch (privateApiError) {
      console.log('⚠️ Private API failed, trying Graph API...');
      
      try {
        // Fall back to Graph API
        if (IG_ACCESS_TOKEN) {
          comments = await fetchCommentsWithGraphApi(postId, IG_ACCESS_TOKEN);
          methodUsed = 'graph_api';
        } else {
          throw new Error('No Graph API token available');
        }
      } catch (graphApiError) {
        console.log('⚠️ Both APIs failed, using mock data for development');
        
        // Fall back to mock data for development
        comments = getMockComments();
        methodUsed = 'mock';
      }
    }
    
    console.log(`📝 Retrieved ${comments.length} comments to process (method: ${methodUsed})`);
    
    let newComments = 0;
    let keywordMatches = 0;
    
    // Process each comment
    for (const comment of comments) {
      // Check if comment already exists in database
      const { data: existingComment } = await supabase
        .from('comments')
        .select()
        .eq('comment_id', comment.id)
        .single();
      
      // Skip if we've already processed this comment
      if (existingComment) {
        console.log(`⏭️ Comment ${comment.id} already processed, skipping`);
        continue;
      }
      
      newComments++;
      
      // Check if the comment contains the keyword (case insensitive)
      const matchesKeyword = comment.text.toLowerCase().includes(keyword.toLowerCase());
      if (matchesKeyword) {
        keywordMatches++;
      }
      
      // Insert the new comment into the database
      const { data: newComment, error: insertError } = await supabase
        .from('comments')
        .insert([{
          comment_id: comment.id,
          username: comment.username,
          text: comment.text,
          sent: false, // Will be set to true when DM is sent
          post_id: postId
        }]);
        
      if (insertError) {
        console.error(`❌ Error inserting comment:`, insertError);
        continue;
      }
      
      console.log(`✅ New comment saved: "${comment.text}" by @${comment.username}`);
      
      // Log the activity
      await supabase
        .from('logs')
        .insert([{
          event: matchesKeyword ? 'keyword_detected' : 'comment_saved',
          username: comment.username,
          details: matchesKeyword ? 
            `New comment detected with keyword "${keyword}"` :
            `New comment saved without keyword match`,
        }]);
      
      if (matchesKeyword) {
        console.log(`🎯 Found keyword "${keyword}" in comment from @${comment.username}`);
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Instagram comments polled successfully',
        commentsProcessed: comments.length,
        newComments,
        keywordMatches,
        method: methodUsed,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Error polling Instagram comments:', error);
    
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
