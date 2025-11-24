"""
Sistema de notificaciones para errores de sincronización
Soporta Email, Slack y Discord
"""
import os
import requests
from datetime import datetime
from typing import Optional

class NotificationService:
    """Servicio centralizado de notificaciones"""
    
    def __init__(self):
        self.email_enabled = bool(os.getenv('SENDGRID_API_KEY'))
        self.slack_enabled = bool(os.getenv('SLACK_WEBHOOK_URL'))
        self.discord_enabled = bool(os.getenv('DISCORD_WEBHOOK_URL'))
    
    def send_error_notification(self, error_msg: str, context: Optional[dict] = None):
        """Envía notificación de error a todos los canales configurados"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        message = f"🚨 **Error en Sincronización NBA**\n\n"
        message += f"**Timestamp**: {timestamp}\n"
        message += f"**Error**: {error_msg}\n"
        
        if context:
            message += f"\n**Contexto**:\n"
            for key, value in context.items():
                message += f"- {key}: {value}\n"
        
        # Enviar a todos los canales configurados
        if self.email_enabled:
            self._send_email(message)
        
        if self.slack_enabled:
            self._send_slack(message)
        
        if self.discord_enabled:
            self._send_discord(message)
    
    def send_success_notification(self, summary: dict):
        """Envía notificación de sincronización exitosa"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        message = f"✅ **Sincronización NBA Completada**\n\n"
        message += f"**Timestamp**: {timestamp}\n"
        message += f"**Juegos procesados**: {summary.get('games_processed', 0)}\n"
        message += f"**Registros guardados**: {summary.get('records_saved', 0)}\n"
        message += f"**Errores**: {summary.get('errors', 0)}\n"
        
        if self.slack_enabled:
            self._send_slack(message)
        
        if self.discord_enabled:
            self._send_discord(message)
    
    def _send_email(self, message: str):
        """Envía notificación por email usando SendGrid"""
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail
            
            email_message = Mail(
                from_email=os.getenv('NOTIFICATION_FROM_EMAIL', 'sync@tirenparleys.com'),
                to_emails=os.getenv('NOTIFICATION_TO_EMAIL', 'admin@tirenparleys.com'),
                subject='Notificación Sincronización NBA',
                html_content=f'<pre>{message}</pre>'
            )
            
            sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
            response = sg.send(email_message)
            
            print(f"✅ Email enviado (status: {response.status_code})")
            
        except Exception as e:
            print(f"❌ Error enviando email: {e}")
    
    def _send_slack(self, message: str):
        """Envía notificación a Slack"""
        try:
            webhook_url = os.getenv('SLACK_WEBHOOK_URL')
            
            payload = {
                'text': message,
                'username': 'NBA Sync Bot',
                'icon_emoji': ':basketball:'
            }
            
            response = requests.post(webhook_url, json=payload)
            response.raise_for_status()
            
            print("✅ Notificación Slack enviada")
            
        except Exception as e:
            print(f"❌ Error enviando a Slack: {e}")
    
    def _send_discord(self, message: str):
        """Envía notificación a Discord"""
        try:
            webhook_url = os.getenv('DISCORD_WEBHOOK_URL')
            
            payload = {
                'content': message,
                'username': 'NBA Sync Bot',
                'avatar_url': 'https://cdn-icons-png.flaticon.com/512/889/889192.png'
            }
            
            response = requests.post(webhook_url, json=payload)
            response.raise_for_status()
            
            print("✅ Notificación Discord enviada")
            
        except Exception as e:
            print(f"❌ Error enviando a Discord: {e}")

# Ejemplo de uso
if __name__ == "__main__":
    notifier = NotificationService()
    
    # Probar notificación de error
    notifier.send_error_notification(
        "Error de conexión a NBA API",
        context={
            'equipo': 'LAL',
            'temporada': '2024-25',
            'intento': 3
        }
    )
    
    # Probar notificación de éxito
    notifier.send_success_notification({
        'games_processed': 150,
        'records_saved': 3000,
        'errors': 2
    })
