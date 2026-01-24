"use client";

import { LegalDoc } from '@/components/LegalDoc';

export default function PrivacyPage() {
    return (
        <LegalDoc
            title="Política de Privacidad"
            subtitle="Protocolos de encriptación y manejo de datos personales en el ecosistema PickGenius."
            lastUpdated="ENERO 2026"
            content={[
                {
                    heading: "Recolección de Datos",
                    body: "Recopilamos información necesaria para personalizar su experiencia Elite, incluyendo credenciales de autenticación (vía Clerk), preferencias de equipos y ligas, y patrones de uso dentro de la plataforma. No almacenamos información bancaria directamente; todos los pagos son procesados por proveedores seguros certificados (Stripe/PayPal)."
                },
                {
                    heading: "Uso de la Información",
                    body: "Utilizamos sus datos para: \n1. Entrenar nuestros modelos de IA para ofrecer predicciones más relevantes.\n2. Notificarle sobre oportunidades de mercado en tiempo real.\n3. Asegurar la integridad de la comunidad y prevenir el fraude."
                },
                {
                    heading: "Cookies y Rastreo",
                    body: "Empleamos cookies de sesión y analíticas para mantener su configuración de 'Cockpit' activa y optimizar el rendimiento de la aplicación. Puede desactivar las cookies en su navegador, pero algunas funciones esenciales del dashboard podrían verse afectadas."
                },
                {
                    heading: "Seguridad de Grado Militar",
                    body: "Sus datos están protegidos con encriptación TLS 1.3 en tránsito y AES-256 en reposo. No vendemos sus datos personales a terceros anunciantes."
                }
            ]}
        />
    );
}
