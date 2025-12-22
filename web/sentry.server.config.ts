import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://04b4d0bc5edcff849f9ebaf926bfac66@o4510579973881856.ingest.de.sentry.io/4510579979583568",

    // Ajustar trazas para rendimiento
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Habilitar modo debug solo en desarrollo si es necesario
    debug: false,
});
