
# Instagram Comment-to-DM Automation Bot

This system automatically sends direct messages to users who comment on specific Instagram posts containing certain keywords. The app runs on a 5-minute polling cycle, continuously monitoring for new comments even when the dashboard isn't open.

## Features

- **Automatic DM Sending**: When a user comments with specific keywords, they automatically receive a preset DM
- **Manual Trigger**: Send test DMs directly from the admin dashboard
- **Custom Message Templates**: Create and manage multiple message templates
- **Comment Tracking**: Monitor all comments on target posts
- **Activity Logs**: Keep records of all system activity
- **Scheduled Polling**: Checks for new comments every 5 minutes

## Setup Instructions

### Prerequisites

1. Instagram account with valid credentials
2. Supabase account (free tier works)
3. Netlify account for deployment

### Local Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/instagram-dm-bot.git
   cd instagram-dm-bot
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory using the template from `.env.example`
   ```
   IG_USERNAME=your_instagram_username
   IG_PASSWORD=your_instagram_password
   POST_ID=target_post_id
   KEYWORD=comment_trigger_keyword
   PRESET_DM=Your automated response message here.
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

4. Create a Supabase project and set up the required tables:
   - comments (id, comment_id, username, text, sent, post_id)
   - logs (id, event, username, details, created_at)
   - templates (id, name, content, is_active, created_at)
   - config (id, keyword, post_id, poll_frequency, created_at, updated_at)

5. Run the development server
   ```bash
   npm run dev
   ```

### Deploying to Netlify

1. Push your code to GitHub

2. Connect your GitHub repository to Netlify

3. Configure build settings in Netlify:
   - Build command: `npm run build`
   - Publish directory: `dist`

4. Add environment variables in Netlify's environment settings (copy from your `.env` file)

5. Enable Scheduled Functions in Netlify:
   - The `netlify.toml` file already has the configuration for the 5-minute polling

### Configuration

1. **Instagram Post ID**: The ID of the post you want to monitor for comments
   - Find this in the URL of the post or use a third-party tool

2. **Trigger Keyword**: The keyword that will trigger a DM when found in a comment
   - Configure in the dashboard or through the `.env` file

3. **Message Templates**: Create and manage templates through the dashboard
   - Set one template as active to be used for automated DMs

## Usage

1. **Dashboard**: Access the admin dashboard to monitor activity and manage settings
   
2. **Automatic Mode**: The system will automatically poll for new comments every 5 minutes and send DMs when the keyword is detected

3. **Manual Mode**: Use the "Send Test DM" button to manually trigger a DM to a specific user

## Troubleshooting

- **Instagram Login Issues**: Ensure your credentials are correct and your account doesn't have 2FA enabled
- **Missing Comments**: Verify the correct POST_ID is configured
- **Supabase Connection Errors**: Check your Supabase URL and key in the environment variables

## Security Notes

- Instagram credentials are stored in environment variables and should be kept secure
- The system uses Row Level Security in Supabase for data protection

## License

MIT

