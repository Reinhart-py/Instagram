
// Instagram Direct Message Bot
// Based on https://github.com/Reinhart-py/Instagram_direct_message_bot
const { IgApiClient } = require('instagram-private-api');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

class InstagramDMBot {
  constructor() {
    this.ig = new IgApiClient();
    this.username = process.env.IG_USERNAME;
    this.password = process.env.IG_PASSWORD;
    
    if (!this.username || !this.password) {
      throw new Error('Instagram credentials not set in environment variables');
    }
    
    this.loggedIn = false;
  }
  
  async login() {
    try {
      console.log(`Attempting to login as ${this.username}...`);
      
      // Generate device
      this.ig.state.generateDevice(this.username);
      
      // Login
      await this.ig.account.login(this.username, this.password);
      
      this.loggedIn = true;
      console.log('Login successful');
      return true;
      
    } catch (error) {
      console.error('Login failed:', error.message);
      return false;
    }
  }
  
  async sendDirectMessage(username, message) {
    if (!this.loggedIn) {
      const loginSuccessful = await this.login();
      if (!loginSuccessful) {
        throw new Error('Not logged in, cannot send message');
      }
    }
    
    try {
      console.log(`Finding user: ${username}...`);
      
      // Find user by username
      const user = await this.ig.user.searchExact(username);
      
      if (!user) {
        throw new Error(`User ${username} not found`);
      }
      
      // Create thread with this user
      const thread = this.ig.entity.directThread([user.pk.toString()]);
      
      // Send text message
      console.log(`Sending message to ${username}...`);
      await thread.broadcastText(message);
      
      console.log(`Message sent to ${username} successfully`);
      return true;
      
    } catch (error) {
      console.error(`Failed to send message to ${username}:`, error.message);
      throw error;
    }
  }
  
  async getPostComments(postId, limit = 50) {
    if (!this.loggedIn) {
      const loginSuccessful = await this.login();
      if (!loginSuccessful) {
        throw new Error('Not logged in, cannot get comments');
      }
    }
    
    try {
      console.log(`Fetching comments for post ${postId}...`);
      
      const feed = this.ig.feed.mediaComments(postId);
      const comments = await feed.items();
      
      return comments.slice(0, limit).map(comment => ({
        id: comment.pk,
        text: comment.text,
        user: {
          username: comment.user.username,
          full_name: comment.user.full_name,
          id: comment.user.pk
        },
        created_at: new Date(comment.created_at * 1000).toISOString()
      }));
      
    } catch (error) {
      console.error(`Failed to get comments for post ${postId}:`, error.message);
      throw error;
    }
  }
}

// Export the bot class for use in other files
module.exports = InstagramDMBot;

// Example usage (when run directly)
if (require.main === module) {
  (async () => {
    try {
      const bot = new InstagramDMBot();
      await bot.login();
      
      // Test sending a DM if username is provided
      const testUsername = process.argv[2];
      if (testUsername) {
        await bot.sendDirectMessage(testUsername, 'This is a test message from Aurora Nexus Bot');
        console.log(`Test message sent to ${testUsername}`);
      }
      
      // Test fetching comments if post ID is provided
      const testPostId = process.argv[3];
      if (testPostId) {
        const comments = await bot.getPostComments(testPostId, 5);
        console.log('Latest 5 comments:', comments);
      }
      
    } catch (error) {
      console.error('Error in test run:', error);
    }
  })();
}
