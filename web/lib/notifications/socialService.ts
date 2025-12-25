/**
 * Service to handle social notifications via Discord and Telegram Webhooks.
 */

export interface NotificationPayload {
    title: string;
    message: string;
    url?: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
}

export class SocialService {
    private discordWebhook?: string;
    private telegramToken?: string;
    private telegramChatId?: string;

    constructor() {
        this.discordWebhook = process.env.DISCORD_WEBHOOK_URL;
        this.telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        this.telegramChatId = process.env.TELEGRAM_CHAT_ID;
    }

    /**
     * Send notification to Discord
     */
    async sendToDiscord(payload: NotificationPayload): Promise<boolean> {
        if (!this.discordWebhook) {
            console.warn('Discord Webhook URL not configured');
            return false;
        }

        try {
            const response = await fetch(this.discordWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embeds: [{
                        title: payload.title,
                        description: payload.message,
                        url: payload.url,
                        color: this.getSeverityColor(payload.severity),
                        timestamp: new Date().toISOString(),
                    }],
                }),
            });

            return response.ok;
        } catch (error) {
            console.error('Error sending to Discord:', error);
            return false;
        }
    }

    /**
     * Send notification to Telegram
     */
    async sendToTelegram(payload: NotificationPayload): Promise<boolean> {
        if (!this.telegramToken || !this.telegramChatId) {
            console.warn('Telegram credentials not configured');
            return false;
        }

        try {
            const text = `*${this.escapeMarkdown(payload.title)}*\n\n${this.escapeMarkdown(payload.message)}${payload.url ? `\n\n[Ver más](${payload.url})` : ''}`;

            const response = await fetch(`https://api.telegram.org/bot${this.telegramToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.telegramChatId,
                    text: text,
                    parse_mode: 'MarkdownV2',
                }),
            });

            return response.ok;
        } catch (error) {
            console.error('Error sending to Telegram:', error);
            return false;
        }
    }

    private getSeverityColor(severity: NotificationPayload['severity']): number {
        switch (severity) {
            case 'success': return 3066993; // Green
            case 'warning': return 16776960; // Yellow
            case 'error': return 15158332; // Red
            case 'info':
            default: return 3447003; // Blue
        }
    }

    private escapeMarkdown(text: string): string {
        return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
    }
}

export const socialService = new SocialService();
