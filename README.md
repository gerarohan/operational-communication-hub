# Operational Communication Hub

A friendly web application that helps teams create structured announcements, share them via Slack, and track acknowledgements—all in one place. Think of it as your team's communication command center! 🚀

## What's This About?

We've all been there: important announcements get lost in Slack, you're not sure if people actually read them, and tracking who's acknowledged what becomes a nightmare. This app solves that by giving you:

- **Structured announcement creation** - No more typos or missing information
- **Slack integration** - Send announcements directly to your channels
- **Acknowledgement tracking** - See who's read and acknowledged your messages
- **Audience management** - Organize your channels into reusable audiences
- **Full history** - Keep track of everything that's been sent

## Features

### 📢 Create Announcements
Build announcements with:
- Title and body (with Slack markdown support)
- Type classification (Info, Operational, Urgent)
- Expected actions (None, Acknowledge)
- Audience selection
- Live preview before sending

### 👥 Manage Audiences
- Create reusable audience groups
- Map them to Slack channels
- Update channels in one place, affects all announcements
- Simplify your workflow

### 📤 Slack Integration
- Send announcements directly to Slack
- Rich message formatting
- Type badges and metadata
- Acknowledge button (when required)
- Link back to the web app for tracking

### ✅ Acknowledgement Tracking
- Users acknowledge via Slack → web app
- See who's acknowledged what
- Track acknowledgement rates
- Reliable accountability

### 📊 History & Outcomes
- Filter by type, audience, status, date
- View complete announcement history
- Drill down into details
- Keep an institutional memory

## Getting Started

### Prerequisites

Make sure you have these installed:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A **Slack workspace** with a bot token (we'll help you get this)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gerarohan/operational-communication-hub.git
   cd operational-communication-hub
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```
   This installs everything for both the frontend and backend. Grab a coffee ☕ while it runs!

3. **Set up environment variables**

   Copy the example environment file:
   ```bash
   cp server/.env.example server/.env
   ```

   Edit `server/.env` and add your configuration:
   ```env
   SLACK_BOT_TOKEN=xoxb-your-slack-bot-token-here
   WEB_APP_URL=http://localhost:3000
   PORT=5001
   ```
   
   **Note:** We're using port 5001 by default because macOS uses port 5000 for AirPlay. If you prefer a different port, just change it here!

### Getting a Slack Bot Token

Don't worry, it's easier than it sounds! Here's how:

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"** → **"From scratch"**
3. Give your app a name (like "Communication Hub Bot") and select your workspace
4. Go to **"OAuth & Permissions"** in the sidebar
5. Scroll down to **"Scopes"** → **"Bot Token Scopes"** and add:
   - `chat:write` (to send messages)
   - `channels:read` (to read channel info)
   - `channels:history` (optional, for advanced features)
6. Scroll back up and click **"Install to Workspace"**
7. Copy the **"Bot User OAuth Token"** (it starts with `xoxb-`)
8. Paste it into your `server/.env` file

### Running the Application

The easiest way to start everything:

```bash
npm start
```

Or use the start script:
```bash
./start.sh
```

This starts both servers:
- **Backend**: http://localhost:5001
- **Frontend**: http://localhost:3000 (opens automatically in your browser)

That's it! You're ready to go! 🎉

### Development Mode

If you want auto-reload during development:

```bash
npm run dev
```

This uses `nodemon` for the backend so it restarts automatically when you make changes.

## How to Use

### 1. Create an Audience

Before you can send announcements, you need at least one audience:

1. Go to **"Audiences"** in the navigation
2. Click **"Add Audience"**
3. Enter a name (e.g., "Engineering Team")
4. Add Slack channel IDs (comma-separated, e.g., `C1234567890,C0987654321`)
5. Save it

**Finding Channel IDs:** In Slack, right-click on a channel → "View channel details" → look for the channel ID at the bottom, or use Slack's API.

### 2. Create an Announcement

1. Go to **"Create Announcement"**
2. Fill in the details:
   - **Title** (required)
   - **Body** (required, supports Slack markdown)
   - **Type** (Info, Operational, or Urgent)
   - **Expected Action** (None or Acknowledge)
   - **Audience** (select one)
3. Use the preview to see how it'll look in Slack
4. Click **"Save as Draft"** or **"Send to Slack"**

### 3. Send to Slack

1. Click **"Send to Slack"** on any draft announcement
2. Confirm in the modal (safety first!)
3. Your announcement is posted to all channels in the audience
4. If acknowledgement is required, users will see an "Acknowledge" button

### 4. Track Acknowledgements

1. View announcement details
2. See the acknowledgement count
3. See who's acknowledged it
4. Users acknowledge via the Slack button → redirected to web app

### 5. Review History

Use the filters on the announcements page to:
- Filter by type, audience, or status
- View all your announcements
- See outcomes and acknowledgement rates
- Close announcements when complete

## Project Structure

```
operational-communication-hub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── services/          # Slack integration
│   └── index.js           # Server entry point
└── package.json           # Root package.json
```

## API Endpoints

### Announcements
- `GET /api/announcements` - List all announcements (supports filters)
- `GET /api/announcements/:id` - Get a single announcement
- `POST /api/announcements` - Create a new announcement
- `PUT /api/announcements/:id` - Update an announcement
- `POST /api/announcements/:id/send` - Send to Slack
- `DELETE /api/announcements/:id` - Delete an announcement

### Audiences
- `GET /api/audiences` - List all audiences
- `GET /api/audiences/:id` - Get a single audience
- `POST /api/audiences` - Create a new audience
- `PUT /api/audiences/:id` - Update an audience
- `DELETE /api/audiences/:id` - Delete an audience

### Acknowledgements
- `POST /api/acknowledgements` - Create an acknowledgement
- `GET /api/acknowledgements/announcement/:announcementId` - Get acknowledgements for an announcement
- `GET /api/acknowledgements/check/:announcementId/:userId` - Check if a user has acknowledged

## Safety Features

We've built in several safety measures:

- ✅ **Confirmation modals** before sending announcements
- ✅ **Validation** prevents sending incomplete announcements
- ✅ **Immutable sent announcements** - once sent, they can't be modified or deleted
- ✅ **Audience validation** - can't send without configured channels
- ✅ **Title required** for urgent announcements

## Tech Stack

- **Frontend**: React 19, React Router 6
- **Backend**: Node.js, Express
- **Slack Integration**: @slack/web-api
- **Storage**: JSON files (easily replaceable with a database)

## Troubleshooting

### Port Already in Use

If you see `EADDRINUSE` errors:
- The backend defaults to port 5001 (to avoid macOS AirPlay conflicts)
- You can change the port in `server/.env`
- Make sure to update `client/src/services/api.js` if you change the port

### Slack Not Working

- Double-check your `SLACK_BOT_TOKEN` in `server/.env`
- Make sure the bot has the required scopes (`chat:write`, `channels:read`)
- Verify the bot is installed in your workspace
- Check the server console for error messages

### Can't Find Channel IDs

- Use Slack's API tester: https://api.slack.com/methods/conversations.list/test
- Or install a Slack app that shows channel IDs
- Right-click channel → "View channel details" → scroll to the bottom

## Contributing

Found a bug? Have an idea? We'd love to hear from you! Feel free to:
- Open an issue
- Submit a pull request
- Share feedback

## License

MIT License - feel free to use this for your own projects!

## Acknowledgments

Built with ❤️ for better team communication. If this helps your team stay organized, we've done our job!

---

**Happy announcing!** 🎉

