import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import LiveScoreWidget from "@/components/LiveScoreWidget";
import { Particles } from "@/components/Particles";
import GlobalSearch from "@/components/GlobalSearch";
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use a structurally valid fallback key to satisfy Clerk's validation during build
  // if NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not present in the environment.
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkSafeProvider publishableKey={clerkPubKey || ""}>
      <html lang="es">
        <body className={`${inter.className} bg-[#050505] overflow-x-hidden`}>
          <QueryProvider>
            <Particles className="absolute inset-0 z-0 pointer-events-none" />
            <div className="relative z-10 min-h-screen flex flex-col">
              <Navbar />
              <LiveScoreWidget />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
              <GlobalSearch />
            </div>
          </QueryProvider>
        </body>
      </html>
    </ClerkSafeProvider>
  );
}
