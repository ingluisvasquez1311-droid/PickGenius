import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToastProvider from "@/components/ui/ToastProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import GlobalErrorBoundary from "@/components/ui/GlobalErrorBoundary";
import LiveTicker from "@/components/sports/LiveTicker";
import ChristmasWrapper from "@/components/layout/ChristmasWrapper";
import PageTransition from "@/components/providers/PageTransition";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { BettingSlipProvider } from "@/contexts/BettingSlipContext";
import BettingSlip from "@/components/betting/BettingSlip";

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "PickGenius | Predicciones Deportivas con IA",
  description: "Domina tus parleys de NBA y Fútbol con análisis de inteligencia artificial y estadísticas avanzadas.",
  manifest: "/manifest.json",
  openGraph: {
    title: "PickGenius | Predicciones Deportivas con IA",
    description: "Análisis y estadísticas deportivas impulsadas por Inteligencia Artificial.",
    url: "https://pickgenius.ai",
    siteName: "PickGenius",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PickGenius AI Dashboard",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PickGenius AI",
    description: "Predicciones deportivas inteligentes en tiempo real.",
    images: ["/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PickGenius",
    startupImage: [
      "/icon-512.png",
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <QueryProvider>
            <BettingSlipProvider>
              <Navbar />
              <ChristmasWrapper />
              <LiveTicker />
              <main className="pt-24 min-h-screen">
                <GlobalErrorBoundary>
                  <PageTransition>
                    {children}
                  </PageTransition>
                </GlobalErrorBoundary>
              </main>
              <Footer />
              <ToastProvider />
              <BettingSlip />
            </BettingSlipProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
