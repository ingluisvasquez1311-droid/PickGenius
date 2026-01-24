import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import LiveScoreWidget from "@/components/LiveScoreWidget";
import { Particles } from "@/components/Particles";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationScanner from "@/components/NotificationScanner";
import { ClerkSafeProvider } from "@/components/ClerkSafeProvider";

import QueryProvider from "@/components/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PickGenius Pro | AI Sports Betting Terminal",
  description: "Predicciones deportivas de élite e inteligencia de mercado impulsada por IA. Analiza datos de fútbol, baloncesto, NFL y más con tecnología de vanguardia.",
  keywords: ["predicciones deportivas", "inteligencia artificial", "apuestas deportivas", "NBA picks", "fútbol picks", "value bets"],
  authors: [{ name: "PickGenius Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-new.png",
    apple: "/logo-new.png",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://pickgenius.com",
    title: "PickGenius Pro | La Terminal de Inteligencia Deportiva",
    description: "Multiplica tus aciertos con análisis de IA profunda, H2H y lesiones en tiempo real.",
    siteName: "PickGenius Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "PickGenius Pro | AI Sports Terminal",
    description: "Predicciones de élite impulsadas por IA.",
    creator: "@PickGenius",
  },
  category: "sports",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ClerkSafeProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
          <QueryProvider>

            <div className="flex flex-col min-h-screen relative overflow-x-hidden">
              <Particles className="absolute inset-0 z-0 pointer-events-none" quantity={200} />
              <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

              <Navbar />
              <main className="flex-grow z-10 pt-20">
                {children}
              </main>
              <Footer />

              <GlobalSearch />
              <NotificationScanner />
              <LiveScoreWidget />
            </div>

          </QueryProvider>
        </ClerkSafeProvider>
      </body>
    </html>
  );
}
