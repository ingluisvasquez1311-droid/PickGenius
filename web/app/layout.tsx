import Navbar from "@/components/layout/Navbar";
// import LiveTicker from "@/components/sports/LiveTicker"; // Temporarily disabled
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { BettingSlipProvider } from "@/contexts/BettingSlipContext";
import BettingSlip from "@/components/betting/BettingSlip";

export const metadata: Metadata = {
  title: "PickGenius | Predicciones Deportivas con IA",
  description: "Domina tus parleys de NBA y Fútbol con análisis de inteligencia artificial y estadísticas avanzadas.",
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
          <BettingSlipProvider>
            {/* <LiveTicker /> */}
            <Navbar />
            {children}
            <BettingSlip />
          </BettingSlipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
