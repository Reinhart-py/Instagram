Task List (Batch 1)
Project Initialization
Scaffold a fresh Node.js + Express project.
Initialize package.json with project name and version.
Install core dependencies: express, ejs, dotenv, instagram-private-api, @supabase/supabase-js.
Folder Structure Setup
Create directory instagram-bot/ and copy all files from https://github.com/Reinhart-py/Instagram_direct_message_bot.git into it.
Create directory functions/ (for Netlify functions).
Add .env.example at project root listing all required ENV keys.
Environment Configuration
Add .env.example entries: IG_USERNAME, IG_PASSWORD, POST_ID, KEYWORD, PRESET_DM, SUPABASE_URL, SUPABASE_KEY.
Ensure application reads these via dotenv at startup.
Netlify Function: poll_comments.js
In functions/, create poll_comments.js: // Fetch new comments from Instagram Graph API
// Insert comment records into Supabase
// Use existing DM logic from instagram-bot/index.js to send DMs

Configure it to run as a Scheduled Function every 5 minutes.
Supabase Setup
In README comment: "Developer must create a Supabase project, setup table comments(id, user, text, sent)".
Create a Supabase Edge Function skeleton at functions/handle_webhook.js.

6. Supabase Trigger Webhook (handle_webhook.js)
functions/handle_webhook.js me Supabase Edge Function likh:
INSERT event suno on comments table.
Har new comment pe:
user, text extract karo.
Keyword match karo (case-insensitive REGEX).
Agar match ho to DM bhejo via PRESET_DM.
7. Frontend Integration
views/ folder banao, usme:
index.ejs: dashboard (status, logs).
Ek button: Send Test DM (POST /send-dm route call).
routes/index.js me route likho: GET /         => render index.ejs
POST /send-dm => trigger fixed test DM

8. Readability & Logging Enhancements
console.log ya chalk se colorful logs.
Har poll aur DM event ko log karo (Supabase table logs me bhi optionally).
9. CHANGELOG + Channel Log
CHANGELOG.md file banao: ## Present
- Loveable.dev used to scaffold bot infra
- Poll & webhook functions in place

## Next
- Frontend UI improvement
- Double-send prevention logic

## Completed
- Instagram bot code connected
- Netlify function setup

## Channel Log
- Loveable: Created poll_comments.js — 2025-05-12 17:04 IST
- Loveable: Webhook scaffolded — 2025-05-12 17:10 IST

10. Supabase Edge Security
Webhook secure kar:
X-SUPABASE-KEY header mangna.
Compare with .env me stored secret key.

Alright bhai, ab Batch 3 ka bhandar le — iss se project almost complete ho jayega aur Loveable ko bola gaya har kaam systematically ho jayega.

11. Netlify Scheduled Cron Job Setup
Netlify function poll_comments.js ko scheduled trigger karo:
Netlify netlify.toml me schedule define karo: [functions."poll_comments"]
schedule = "*/5 * * * *"  # Every 5 minutes

Ensure cron job continues to fetch and insert comments even if site is idle.
12. UI/UX Enhancements
Add dark-themed, aesthetic EJS styling using inline Tailwind CSS or custom dark mode CSS.
Animate dashboard with floating 3D icons (use Lordicon or Lottie animations).
Add subtle parallax/scroll animations for dashboard using AOS or vanilla-tilt.js.
13. DM Sending Optimization
Before sending DM, check if user already received DM using sent flag in Supabase table.
If sent === true, skip sending.
After successful DM, update sent to true.
14. Global Error Handling
Wrap every async call (Instagram login, Supabase insert, send DM) in try-catch blocks.
Log errors in logs table in Supabase and also in console with clear message + timestamp.
15. Mobile Optimization
Make frontend mobile responsive:
Ensure buttons, logs and status bars fit properly on mobile width.
Add hamburger menu if needed for future expansion.

✍️ README.md & Instructions Task
16. Write README.md Automatically
Add Loveable instruction:
“Auto-generate README.md using project info with setup steps, env details, and usage.”
README must include:
How to run locally
How to deploy on Netlify
How to connect Supabase
How to configure DM trigger


17. Supabase Admin Dashboard (Optional UI)
Build a /admin EJS page (protected by basic auth via .env password):
Show list of users who received DMs
Show logs from Supabase logs table
Button to clear logs or reset sent status (dev purpose)
18. Message Template Editor (WYSIWYG)
Add /editor route (protected):
Simple rich text editor using Quill.js
Saves message template to Supabase table dm_templates
Dropdown on admin panel to select current DM template
On webhook trigger, fetch active template and send
19. Optional Telegram/Discord Integration
Add webhook forwarder:
When new comment is detected or DM sent, forward summary to:
Telegram Bot (use node-telegram-bot-api)
OR Discord channel (via webhook URL)
Configure via .env: TELEGRAM_BOT_TOKEN, DISCORD_WEBHOOK_URL
20. User Analytics (Basic Metrics)
Track:
Total comments scanned
Total DMs sent
Last DM time
Unique users reached
Show stats in /admin dashboard with auto-refresh
21. Auto Recovery System
Add health-check route /health:
Return bot status: "running", "idle", "error"
Check if Supabase connection + Instagram login is valid
Add .env flag: AUTO_RESTART_ON_ERROR=true
If bot crashes or login fails, auto-retry after 60 seconds

🔥 Optional Future Add-ons (Write in README or DEV-TASKS.md)
Add ai response system for comments (instead of static template)
Save comment + reply pair to Supabase for analysis
Add tag-based filtering: only reply to comments with hashtags like #helpme


Chal, ab Batch 5 se finalize karte hain, jo ki polish aur completion wala hoga. Yeh last round hai, sab kuch fine-tune karenge aur production ke liye ready karenge.

22. Final Testing & Debugging
Test every function thoroughly:
Make sure all endpoints (/send-dm, /admin, /health) are working fine.
Test with real Instagram accounts to ensure DMs are sent correctly.
Test error handling and logging functionality.
23. Optimize Supabase Query Performance
Ensure your comments and logs table queries are indexed for faster performance.
Add index on user_id and timestamp fields for efficient queries.
24. Add Caching for Frequent Queries
For high-traffic projects, consider using an in-memory cache (like Redis or Supabase Edge Functions caching) to reduce the load on Supabase for frequently accessed data.
25. Security Hardening
Ensure all sensitive environment variables are securely stored in .env and never exposed in the codebase.
Add a rate limit to /send-dm route to avoid abuse (e.g., 1 request per minute per user).
26. Deploy on Netlify / Vercel
For Netlify:
Ensure your netlify.toml file is properly configured.
Check that all environment variables are set up correctly in the Netlify UI.
Deploy and monitor live status.
For Vercel:
Make sure that Vercel functions work without issues.
Ensure environment variables and build settings are correct.
27. Finalize GitHub Actions for Continuous Deployment
Set up GitHub Actions:
When changes are pushed to main, trigger a build and deploy on Netlify/Vercel.
Add steps to check code quality with ESLint or Prettier.
Run tests before deployment.
28. Set Up Webhook Retry Mechanism
Implement automatic retry for failed webhooks or DM requests in case of temporary issues.
Use a job queue like Bull.js or BullMQ if needed.
Add retry logic to ensure 100% reliability.
29. Documentation & Final README Cleanup
Clean up README.md to ensure it includes all final instructions:
How to deploy on Netlify/Vercel
How to configure Supabase
How to add new DM templates or change existing templates
Troubleshooting tips
30. Monitoring & Logs
Set up Google Analytics or an equivalent for tracking visits, bot usage, and errors.
Ensure logs are written to a centralized location (Supabase or a third-party logging service).

🚀 Final Steps for Launch
Perform a full audit of the project to ensure everything works as expected.
Push everything to GitHub and ensure version control is on point.
Check the live version and monitor for any performance hits or errors.


