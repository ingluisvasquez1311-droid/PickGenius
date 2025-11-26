# Estrategia de Notificaciones - PickGenius

## Objetivo
Implementar un sistema de notificaciones para mantener a los usuarios comprometidos con la plataforma.

## Tipos de Notificaciones

### 1. Push Notifications (Web Push API)
- **Partido Favorito Empieza**: Notificar 15 minutos antes del inicio.
- **Nuevo Pick del Mago**: Cuando se publique una predicción de alta confianza (>80%).
- **Resultado de Apuesta**: Cuando finalice un partido que el usuario tenga en su ticket.

### 2. In-App Notifications
- **Racha Activa**: Celebrar cuando el usuario tenga 3+ aciertos consecutivos.
- **Límite de Predicciones**: Recordar al usuario free que puede actualizar a Premium.

## Implementación Técnica

### Fase 1: Notificaciones In-App (Inmediato)
```typescript
// Crear un NotificationContext similar a BettingSlipContext
// Mostrar un toast/banner en la esquina superior derecha
```

### Fase 2: Web Push (Futuro)
- Requiere Service Worker (ya incluido en PWA).
- Requiere backend para enviar notificaciones (Firebase Cloud Messaging o similar).
- Solicitar permiso al usuario en el momento adecuado (no inmediatamente).

## Mejores Prácticas
- **No Spam**: Máximo 3 notificaciones por día para usuarios free.
- **Personalización**: Solo notificar sobre equipos/ligas favoritas.
- **Timing**: Enviar notificaciones en horarios de alta actividad (17:00-22:00).

## Estado Actual
- ✅ PWA configurado (base para push notifications).
- ⏳ Pendiente: Implementar NotificationContext.
- ⏳ Pendiente: Integrar Firebase Cloud Messaging.
