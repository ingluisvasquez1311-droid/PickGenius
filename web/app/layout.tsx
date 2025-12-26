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
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import WelcomeToast from "@/components/auth/WelcomeToast";


import { constructMetadata } from "@/lib/seo";

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = constructMetadata({
  title: "PickGenius Pro | Predicciones Deportivas con IA",
  description: "Domina tus parleys de NBA y Fútbol con análisis de inteligencia artificial y estadísticas avanzadas.",
  image: "/og-image.jpg"
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <GoogleAnalytics />
        <AuthProvider>
          <WelcomeToast /> {/* 🔥 NUEVO: Toast de bienvenida */}
          <QueryProvider>
            <BettingSlipProvider>
              <Navbar />
              {/* <ChristmasWrapper /> */}
              <div className="hidden lg:block">
                <LiveTicker />
              </div>
              <main className="pt-24 pb-20 md:pb-0 min-h-screen">
                <GlobalErrorBoundary>
                  <PageTransition>
                    {children}
                  </PageTransition>
                </GlobalErrorBoundary>
              </main>
              <Footer />
              <ToastProvider />
              <BettingSlip />
              <MobileBottomNav />
            </BettingSlipProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
