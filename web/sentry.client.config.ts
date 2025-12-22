import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://04b4d0bc5edcff849f9ebaf926bfac66@o4510579973881856.ingest.de.sentry.io/4510579979583568",

    // Ajustar Sample Rate en producción para no saturar la cuota gratuita
    // 1.0 = Capturar 100% de errores en desarrollo
    // 0.1 = Capturar 10% en producción (recomendado para empezar)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Capturar errores de Replay (video de qué hizo el usuario antes del error)
    // Solo capturar si ocurre un error
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,

    integrations: [
        Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],
});
