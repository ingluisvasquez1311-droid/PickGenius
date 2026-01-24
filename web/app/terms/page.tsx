"use client";

import { LegalDoc } from '@/components/LegalDoc';

export default function TermsPage() {
    return (
        <LegalDoc
            title="Términos de Servicio"
            subtitle="Reglas de operación y uso de la plataforma de inteligencia deportiva PickGenius."
            lastUpdated="ENERO 2026"
            content={[
                {
                    heading: "Naturaleza del Servicio",
                    body: "PickGenius es una herramienta de análisis estadístico y predictivo basada en Inteligencia Artificial. NO somos una casa de apuestas (sportsbook) ni facilitamos transacciones de apuestas con dinero real. Todos los análisis, picks y probabilidades generadas son para fines informativos y de entretenimiento."
                },
                {
                    heading: "Responsabilidad del Usuario",
                    body: "El usuario reconoce que el uso de la información proporcionada por PickGenius es bajo su propio riesgo. Las apuestas deportivas implican un alto riesgo financiero y pueden resultar en la pérdida de capital. PickGenius no garantiza ganancias futuras ni se hace responsable de pérdidas financieras derivadas del uso de nuestra plataforma."
                },
                {
                    heading: "Cuentas y Seguridad",
                    body: "Para acceder a funciones Elite, usted debe mantener la confidencialidad de su cuenta. Cualquier actividad realizada bajo su perfil es su responsabilidad. Nos reservamos el derecho de suspender cuentas que muestren comportamiento sospechoso o violen nuestras normas comunitarias."
                },
                {
                    heading: "Propiedad Intelectual",
                    body: "Todo el código, algoritmos (incluyendo el Motor de Predicción V4), diseños y contenido son propiedad exclusiva de PickGenius. La reproducción no autorizada, ingeniería inversa o distribución de nuestros datos premium está estrictamente prohibida."
                }
            ]}
        />
    );
}
