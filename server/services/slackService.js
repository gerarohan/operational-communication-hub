const { WebClient } = require('@slack/web-api');

class SlackService {
  constructor() {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) {
      console.warn('SLACK_BOT_TOKEN not set. Slack integration will be disabled.');
      this.client = null;
    } else {
      this.client = new WebClient(token);
    }
    this.webAppUrl = process.env.WEB_APP_URL || 'http://localhost:3000';
  }

  async sendAnnouncement(announcement, audience) {
    if (!this.client) {
      throw new Error('Slack integration not configured. Please set SLACK_BOT_TOKEN.');
    }

    if (!audience || !audience.channels || audience.channels.length === 0) {
      throw new Error('Audience has no channels configured');
    }

    const slackMessageIds = [];
    const errors = [];

    // Build the message blocks
    const blocks = this.buildMessageBlocks(announcement);

    // Send to each channel in the audience
    for (const channelId of audience.channels) {
      try {
        const result = await this.client.chat.postMessage({
          channel: channelId,
          text: announcement.title,
          blocks: blocks,
          unfurl_links: false,
          unfurl_media: false
        });

        if (result.ok) {
          slackMessageIds.push({
            channelId: channelId,
            messageTs: result.ts,
            channel: result.channel
          });
        } else {
          errors.push(`Failed to send to channel ${channelId}: ${result.error}`);
        }
      } catch (error) {
        errors.push(`Error sending to channel ${channelId}: ${error.message}`);
      }
    }

    if (slackMessageIds.length === 0 && errors.length > 0) {
      throw new Error(`Failed to send announcement: ${errors.join('; ')}`);
    }

    return { slackMessageIds, errors };
  }

  buildMessageBlocks(announcement) {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: announcement.title,
          emoji: true
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: announcement.body
        }
      }
    ];

    // Add type badge
    const typeColors = {
      'Info': '#36a64f',
      'Operational': '#ff9900',
      'Urgent': '#ff0000'
    };

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*Type:* ${announcement.type} | *Action Required:* ${announcement.expectedAction}`
        }
      ]
    });

    // Add action button if acknowledgement is required
    if (announcement.expectedAction === 'Acknowledge') {
      blocks.push({
        type: 'divider'
      });
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Please acknowledge this announcement:'
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Acknowledge',
            emoji: true
          },
          style: 'primary',
          url: `${this.webAppUrl}/acknowledge/${announcement.id}`,
          action_id: 'acknowledge_button'
        }
      });
    }

    // Add link to web app
    blocks.push({
      type: 'divider'
    });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `View in <${this.webAppUrl}/announcements/${announcement.id}|Operational Communication Hub>`
      }
    });

    return blocks;
  }

  async testConnection() {
    if (!this.client) {
      return { ok: false, error: 'Slack client not initialized' };
    }

    try {
      const result = await this.client.auth.test();
      return { ok: result.ok, team: result.team, user: result.user };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}

module.exports = new SlackService();

