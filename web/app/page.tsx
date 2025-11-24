import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-dark)]"></div>

        <div className="container relative z-10 text-center">
          <h1 className="text-6xl md:text-8xl mb-6">
            Domina tus <span className="text-gradient text-glow">Parleys</span>
          </h1>
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
            Análisis avanzado de NBA y Fútbol potenciado por Inteligencia Artificial y los consejos del Mago.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/nba" className="btn btn-primary">
              Ver NBA
            </Link>
            <Link href="/football" className="btn btn-outline">
              Ver Fútbol
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-4xl text-center mb-16">¿Por qué <span className="text-gradient">Tirens Parleys</span>?</h2>

          <div className="grid-auto">
            <div className="glass-card p-8">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl mb-2">IA Avanzada</h3>
              <p className="text-[var(--text-secondary)]">
                Algoritmos que analizan miles de datos históricos para encontrar patrones ocultos.
              </p>
            </div>

            <div className="glass-card p-8">
              <div className="text-4xl mb-4">🧙‍♂️</div>
              <h3 className="text-2xl mb-2">Consejos del Mago</h3>
              <p className="text-[var(--text-secondary)]">
                Análisis experto con un toque de magia para explicar cada predicción.
              </p>
            </div>

            <div className="glass-card p-8">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl mb-2">Datos en Vivo</h3>
              <p className="text-[var(--text-secondary)]">
                Sincronización automática con APIs oficiales para tener la última información.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
