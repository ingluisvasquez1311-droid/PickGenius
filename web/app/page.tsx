import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-900 bg-hero-glow flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">Pick<span className="text-brand-500">Genius</span></span>
          <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full font-mono">AI</span>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link href="/sign-in" className="text-sm text-gray-400 hover:text-white transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/sign-up" className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors font-medium">
              Comenzar gratis
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors font-medium">
              Ir al Dashboard →
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-8">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm px-4 py-2 rounded-full">
          <span className="live-dot"></span>
          Datos en tiempo real · IA avanzada
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white max-w-4xl leading-tight">
          Predicciones deportivas<br />
          <span className="text-brand-500">potenciadas por IA</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl">
          PickGenius combina scraping en tiempo real, cuotas de BetPlay y modelos de IA avanzados
          para darte predicciones precisas sobre fútbol, NBA, NFL, tenis y más.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/sign-up" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-4 rounded-xl transition-all glow-green text-lg">
            Probar gratis →
          </Link>
          <Link href="/dashboard" className="border border-white/10 hover:border-brand-500/50 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all text-lg">
            Ver predicciones
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-12 mt-12 pt-12 border-t border-white/5">
          {[
            { value: "6+", label: "Deportes" },
            { value: "24/7", label: "Datos en vivo" },
            { value: "IA", label: "Groq LLaMA" },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-brand-400">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
