import nodemailer from 'nodemailer';

/**
 * Professional Email Service for PickGenius Pro
 * Handles transactional and marketing emails.
 */
export async function sendEmail({ to, subject, html }: { to: string | string[], subject: string, html: string }) {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Configuración de transporte (Se recomienda Resend o SMTP profesional en Prod)
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.resend.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
            user: process.env.SMTP_USER || 'resend',
            pass: process.env.SMTP_PASSWORD, // Configura esto en .env
        },
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"PickGenius Pro" <noreply@pickgenius.com>',
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            html,
        });

        console.log(`[Email Service] Sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[Email Service Error]:', error);
        if (isDevelopment) {
            console.warn('Check SMTP credentials in .env.local');
        }
        return { success: false, error };
    }
}

/**
 * Builds a premium HTML template for the Weekly Picks Newsletter
 */
export function buildWeeklyPicksTemplate(picks: any[]) {
    return `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #050505; color: #ffffff; padding: 40px; border-radius: 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #00FF41; font-style: italic; text-transform: uppercase;">PickGenius Pro</h1>
            <p style="color: #666; text-transform: uppercase; letter-spacing: 2px; font-size: 10px;">Resumen Semanal de Élite</p>
        </div>
        
        <div style="background-color: #111; padding: 30px; border-radius: 15px; border: 1px solid #222;">
            <h2 style="margin-top: 0;">🎯 Top Picks de la Semana</h2>
            <p style="color: #aaa;">Aquí tienes las oportunidades de mayor valor detectadas por nuestra IA:</p>
            
            ${picks.map(p => `
                <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #00FF41; background: #0a0a0a;">
                    <div style="font-weight: bold; font-size: 16px;">${p.match}</div>
                    <div style="color: #00FF41; font-size: 14px;">Recomendación: ${p.recommendation}</div>
                    <div style="color: #666; font-size: 12px;">Confianza: ${p.confidence}%</div>
                </div>
            `).join('')}
        </div>

        <div style="margin-top: 40px; text-align: center; color: #444; font-size: 11px;">
            Has recibido este email porque estás suscrito a la terminal de PickGenius Pro.<br>
            © 2025 PickGenius AI. Todos los derechos reservados.
        </div>
    </div>
    `;
}
