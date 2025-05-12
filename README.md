
# Aurora Nexus - Instagram Comment-to-DM Automation Bot

![Aurora Nexus Logo](https://via.placeholder.com/150x150/111/a855f7?text=Aurora)

## Overview

Aurora Nexus is an Instagram automation tool that monitors comments on a specified post and automatically sends direct messages to users based on keyword triggers. The system provides a beautiful dark-themed dashboard for monitoring activity, customizing message templates, and managing automation settings.

## Features

- **Comment Monitoring**: Automatically polls a specified Instagram post for new comments
- **Keyword Triggers**: Sends DMs when comments contain specified keywords
- **Custom Message Templates**: Create and manage multiple DM templates
- **Real-time Dashboard**: Monitor comments, DMs, and system activity
- **Manual Controls**: Send test DMs directly from the dashboard
- **Secure Authentication**: Protected admin interface
- **Responsive Design**: Works on desktop and mobile devices

## Technical Architecture

- **Frontend**: React with Tailwind CSS, deployed on Netlify 
- **Backend**: Netlify Functions (Node.js 18.x) & Supabase (PostgreSQL)
- **Scheduled Tasks**: Netlify Cron Functions (polling every 5 minutes)
- **Instagram API**: Private API wrapper for direct message functionality

## Installation

### Prerequisites

- Node.js 18.x or higher
- Netlify CLI for local development
- Instagram account
- Supabase account

### Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/aurora-nexus.git
cd aurora-nexus
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file based on `.env.example`:

```
# Instagram Credentials
IG_USERNAME=your_instagram_username
IG_PASSWORD=your_instagram_password

# Instagram Configuration
POST_ID=target_post_id
KEYWORD=comment_trigger_keyword
PRESET_DM=Your automated response message here.

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key
```

4. **Set up Supabase database tables**

Create the following tables in your Supabase project:

- `comments`: Store tracked Instagram comments
- `logs`: System activity logging
- `templates`: Message templates for DMs
- `config`: System configuration settings

5. **Run locally**

```bash
npm run dev
```

## Deployment

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `functions`
3. Add all environment variables from your `.env` file
4. Deploy the site

### Configure Scheduled Functions

Add the following to your `netlify.toml` file:

```toml
[functions."poll_comments"]
schedule = "*/5 * * * *"
```

This configures the `poll_comments` function to run every 5 minutes.

## Usage

1. **Sign in** to the admin dashboard using your credentials
2. **Monitor comments** on your specified Instagram post
3. **Create message templates** for automatic responses
4. **View activity logs** to track system performance
5. **Send test DMs** to verify functionality

## Security Considerations

- **Instagram Rate Limits**: Be mindful of Instagram's rate limits to avoid account restrictions
- **Password Storage**: Instagram credentials are stored as environment variables
- **Authentication**: Admin dashboard is protected by email/password authentication

## Troubleshooting

Common issues and solutions:

- **Instagram Login Fails**: Check credentials and ensure 2FA is disabled or properly handled
- **Comments Not Detected**: Verify POST_ID is correct and polling function is running
- **DMs Not Sending**: Check Instagram account permissions and message rate limits

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Instagram Private API](https://github.com/dilame/instagram-private-api)
- [Supabase](https://supabase.io)
- [Netlify](https://netlify.com)
- [React](https://reactjs.org)
- [Tailwind CSS](https://tailwindcss.com)

---

Built with ❤️ using [Lovable](https://lovable.dev)
