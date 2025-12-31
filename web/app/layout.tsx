import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import LiveScoreWidget from "@/components/LiveScoreWidget";
import { Particles } from "@/components/Particles";
import GlobalSearch from "@/components/GlobalSearch";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PickGenius | IA Sports Predictions",
  description: "Predicciones deportivas de élite impulsadas por Inteligencia Artificial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className={`${inter.className} antialiased min-h-screen bg-black text-foreground relative overflow-x-hidden`}>
        <Particles />
        <Navbar />
        <GlobalSearch />
        <main className="relative flex flex-col min-h-screen z-10">
          {children}
        </main>
        <Footer />
        <LiveScoreWidget />
      </body>
    </html>
  );
}
