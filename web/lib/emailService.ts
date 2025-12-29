// Email Marketing Service using Resend

interface EmailData {
    to: string;
    subject: string;
    html: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'PickGenius <noreply@pickgenius.com>';

/**
 * Send email using Resend API
 */
async function sendEmail(data: EmailData): Promise<boolean> {
    if (!RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured');
        return false;
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: data.to,
                subject: data.subject,
                html: data.html,
            }),
        });

        if (!response.ok) {
            console.error('Resend API error:', await response.text());
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
    const displayName = name || email.split('@')[0];

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #050505; color: #ffffff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
          .logo span { color: #a855f7; }
          .content { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 40px; }
          .title { font-size: 28px; font-weight: 900; margin-bottom: 20px; }
          .text { color: #9ca3af; line-height: 1.6; margin-bottom: 20px; }
          .cta { display: inline-block; background: linear-gradient(to right, #a855f7, #3b82f6); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; margin-top: 20px; }
          .footer { text-align: center; margin-top: 40px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PICK<span>GENIUS</span></div>
          </div>
          <div class="content">
            <h1 class="title">¡Bienvenido a PickGenius, ${displayName}! 🎯</h1>
            <p class="text">
              Estamos emocionados de tenerte con nosotros. Has desbloqueado <strong>15 días de acceso premium gratis</strong> para que explores todas nuestras funcionalidades.
            </p>
            <p class="text">
              <strong>¿Qué puedes hacer ahora?</strong><br>
              • Genera predicciones ilimitadas con IA<br>
              • Accede a Hot Picks (>75% probabilidad)<br>
              • Comparte tus predicciones en redes<br>
              • Desbloquea logros y sube en el ranking
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/props" class="cta">Empezar Ahora</a>
          </div>
          <div class="footer">
            © 2025 PickGenius. Todos los derechos reservados.
          </div>
        </div>
      </body>
    </html>
  `;

    return sendEmail({
        to: email,
        subject: '¡Bienvenido a PickGenius! 🎯 15 días premium gratis',
        html,
    });
}

/**
 * Send trial reminder email (day 10)
 */
export async function sendTrialReminderEmail(email: string, name?: string): Promise<boolean> {
    const displayName = name || email.split('@')[0];

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #050505; color: #ffffff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .content { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 40px; }
          .title { font-size: 28px; font-weight: 900; margin-bottom: 20px; }
          .text { color: #9ca3af; line-height: 1.6; margin-bottom: 20px; }
          .highlight { background: linear-gradient(to right, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900; }
          .cta { display: inline-block; background: linear-gradient(to right, #a855f7, #3b82f6); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <h1 class="title">¡Quedan 5 días de tu trial! ⏰</h1>
            <p class="text">
              Hola ${displayName},
            </p>
            <p class="text">
              Tu prueba premium de PickGenius termina en <span class="highlight">5 días</span>. 
              Esperamos que estés disfrutando de todas las funcionalidades.
            </p>
            <p class="text">
              <strong>¿Por qué continuar con Premium?</strong><br>
              • Predicciones ilimitadas con IA<br>
              • Acceso a Hot Picks exclusivos<br>
              • Sin anuncios<br>
              • Soporte prioritario
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" class="cta">Ver Planes Premium</a>
          </div>
        </div>
      </body>
    </html>
  `;

    return sendEmail({
        to: email,
        subject: '⏰ Quedan 5 días de tu trial premium',
        html,
    });
}

/**
 * Send trial expiring email (day 14)
 */
export async function sendTrialExpiringEmail(email: string, name?: string): Promise<boolean> {
    const displayName = name || email.split('@')[0];

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #050505; color: #ffffff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .content { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 40px; }
          .title { font-size: 28px; font-weight: 900; margin-bottom: 20px; color: #f59e0b; }
          .text { color: #9ca3af; line-height: 1.6; margin-bottom: 20px; }
          .cta { display: inline-block; background: linear-gradient(to right, #f59e0b, #ef4444); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <h1 class="title">🚨 ¡Último día de tu trial!</h1>
            <p class="text">
              Hola ${displayName},
            </p>
            <p class="text">
              Tu prueba premium termina <strong>mañana</strong>. No pierdas acceso a:
            </p>
            <p class="text">
              • Predicciones ilimitadas<br>
              • Hot Picks exclusivos<br>
              • Análisis avanzado de IA<br>
              • Ranking y logros
            </p>
            <p class="text">
              <strong>Solo $5/mes</strong> - Cancela cuando quieras.
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" class="cta">Continuar con Premium</a>
          </div>
        </div>
      </body>
    </html>
  `;

    return sendEmail({
        to: email,
        subject: '🚨 ¡Último día de tu trial premium!',
        html,
    });
}
