/**
 * Servicio de Notificaciones Omnicanal
 * Maneja el envío de alertas a Telegram y Discord.
 */

export interface NotificationPayload {
    title: string;
    message: string;
    sport?: string;
    confidence?: number;
    gameId?: string;
    imageUrl?: string;
}

class NotificationService {
    /**
     * Envía una notificación a Telegram
     * Requiere TELEGRAM_BOT_TOKEN en el servidor
     */
    async sendTelegramMessage(chatId: string, payload: NotificationPayload): Promise<boolean> {
        try {
            const token = process.env.TELEGRAM_BOT_TOKEN;
            if (!token) {
                console.error('❌ TELEGRAM_BOT_TOKEN no configurado');
                return false;
            }

            const text = `
🔥 *${payload.title}* 🔥

${payload.message}
${payload.confidence ? `\n🎯 Confianza: *${payload.confidence}%*` : ''}
${payload.sport ? `\n🏟️ Deporte: #${payload.sport.toUpperCase()}` : ''}

[Ver Pronóstico Completo](https://pickgeniuspro.vercel.app/match/${payload.sport}/${payload.gameId})
            `;

            const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: false
                })
            });

            return response.ok;
        } catch (error) {
            console.error('❌ Error enviando a Telegram:', error);
            return false;
        }
    }

    /**
     * Envía una notificación a Discord vía Webhook
     */
    async sendDiscordMessage(webhookUrl: string, payload: NotificationPayload): Promise<boolean> {
        try {
            const embed = {
                title: payload.title,
                description: payload.message,
                color: payload.confidence && payload.confidence > 90 ? 0x00ff00 : 0xffa500,
                fields: [
                    { name: 'Deporte', value: payload.sport?.toUpperCase() || 'N/A', inline: true },
                    { name: 'Confianza', value: `${payload.confidence}%` || 'N/A', inline: true }
                ],
                timestamp: new Date().toISOString(),
                footer: { text: 'PickGenius Pro Notifications' },
                url: `https://pickgeniuspro.vercel.app/match/${payload.sport}/${payload.gameId}`
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'PickGenius Bot',
                    embeds: [embed]
                })
            });

            return response.ok;
        } catch (error) {
            console.error('❌ Error enviando a Discord:', error);
            return false;
        }
    }

    /**
     * Lógica para decidir si enviar una notificación automática (Hot Picks)
     */
    shouldNotifyHotPick(confidence: number): boolean {
        return confidence >= 85;
    }
}

export const notificationService = new NotificationService();
