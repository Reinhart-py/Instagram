
const { IgApiClient } = require('instagram-private-api');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const username = process.env.IG_USERNAME;
const password = process.env.IG_PASSWORD;
const targetUsername = process.argv[2]; // Get username from command line argument
const messageText = process.env.PRESET_DM || "Thanks for your comment! How can I help you today?";

// Main function to send a DM
async function sendDirectMessage() {
  if (!username || !password) {
    console.error('❌ Error: Instagram username and password must be provided in .env file');
    process.exit(1);
  }

  if (!targetUsername) {
    console.error('❌ Error: Please provide a target username as a command line argument');
    console.log('Usage: node index.js <target_username>');
    process.exit(1);
  }

  console.log(`📱 Logging in as @${username}...`);
  
  const ig = new IgApiClient();
  ig.state.generateDevice(username);
  
  try {
    // Login
    await ig.account.login(username, password);
    console.log('✅ Successfully logged in!');
    
    // Search for the user
    console.log(`🔍 Looking up @${targetUsername}...`);
    const targetUser = await ig.user.searchExact(targetUsername);
    
    if (!targetUser) {
      throw new Error(`User @${targetUsername} not found`);
    }
    
    console.log(`✅ Found user @${targetUsername} (${targetUser.full_name || 'No name'})!`);
    
    // Send DM
    console.log(`📨 Sending DM: "${messageText}"...`);
    const thread = ig.entity.directThread([targetUser.pk.toString()]);
    await thread.broadcastText(messageText);
    
    console.log('✅ Direct message sent successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Execute the main function
sendDirectMessage();
