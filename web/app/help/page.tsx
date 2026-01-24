"use client";

import { LegalDoc } from '@/components/LegalDoc';

export default function HelpPage() {
    return (
        <LegalDoc
            title="Centro de Ayuda"
            subtitle="Base de conocimiento y soporte para analistas de la plataforma."
            lastUpdated="VIVO"
            content={[
                {
                    heading: "¿Cómo funciona el 'Smart Parley'?",
                    body: "Nuestro optimizador utiliza algoritmos de IA para escanear miles de combinaciones posibles en tiempo real, buscando aquellas con mayor Valor Esperado (+EV) y correlación positiva. El nivel de riesgo (Seguro, Valiente, Bomba) ajusta la varianza tolerada por el modelo."
                },
                {
                    heading: "Sistema de Créditos (PGc)",
                    body: "PickGenius utiliza una moneda virtual interna (PGc) para simular la gestión de bankroll sin riesgos financieros. Los usuarios reciben recargas gratuitas diarias y bonificaciones por rachas de aciertos."
                },
                {
                    heading: "Membresía PRO vs GOLD",
                    body: "La versión PRO incluye acceso básico a herramientas. La membresía GOLD desbloquea:\n- Explicaciones profundas de lectura artificial ('La Lectura').\n- Monitor de Sentimiento de Mercado.\n- Alertas Push ilimitadas.\n- Acceso anticipado a 'Line Moves'."
                },
                {
                    heading: "¿Problemas Técnicos?",
                    body: "Si experimenta errores de sincronización o visualización, intente limpiar la caché de su navegador. Para problemas persistentes, contacte a soporte directo en support@pickgenius.ai o use el botón de reporte en el menú 'Más'."
                }
            ]}
        />
    );
}
