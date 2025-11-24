import Navbar from "@/components/layout/Navbar";
import LiveTicker from "@/components/sports/LiveTicker";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tirens Parleys | Predicciones Deportivas con IA",
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
        <Navbar />
        <div className="pt-20">
          <LiveTicker />
          {children}
        </div>
      </body>
    </html>
  );
}
