'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NewsSection from '@/components/home/NewsSection';
import { useAuth } from '@/contexts/AuthContext';

interface SportStats {
  liveEvents: number;
  featuredMatch?: any;
  loading: boolean;
}

export default function HomePage() {
  const [basketballStats, setBasketballStats] = useState<SportStats>({ liveEvents: 0, loading: true });
  const [footballStats, setFootballStats] = useState<SportStats>({ liveEvents: 0, loading: true });
  const [isRedirectingStripe, setIsRedirectingStripe] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchStats() {
      try {
        // --- BASKETBALL FETCH ---
        const basketballRes = await fetch('/api/basketball/live');
        const basketballData = await basketballRes.json();
        let basketballFeatured = null;
        let basketballCount = 0;

        if (basketballData.success && basketballData.data) {
          basketballCount = basketballData.data.length;
          if (basketballData.data.length > 0) basketballFeatured = basketballData.data[0];
        }

        if (!basketballFeatured) {
          try {
            const scheduledRes = await fetch(`/api/basketball/scheduled?date=${new Date().toISOString().split('T')[0]}`);
            const scheduledData = await scheduledRes.json();
            if (scheduledData.success && scheduledData.data?.events) {
              if (scheduledData.data.events.length > 0) {
                const nextGame = scheduledData.data.events[0];
                basketballFeatured = {
                  id: nextGame.id,
                  homeTeam: nextGame.homeTeam,
                  awayTeam: nextGame.awayTeam,
                  homeScore: { current: 0 },
                  awayScore: { current: 0 },
                  status: { description: new Date(nextGame.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'scheduled' },
                  isScheduled: true
                };
              }
            }
          } catch (e) {
            console.error("Error fetching scheduled basketball", e);
          }
        }

        setBasketballStats({ liveEvents: basketballCount, featuredMatch: basketballFeatured, loading: false });

        // --- FOOTBALL FETCH ---
        const footballRes = await fetch('/api/football/live');
        const footballData = await footballRes.json();
        let footballFeatured = null;
        let footballCount = 0;

        if (footballData.success && footballData.data) {
          footballCount = footballData.data.length;
          if (footballData.data.length > 0) {
            footballFeatured = footballData.data[0];
          }
        }

        setFootballStats({ liveEvents: footballCount, featuredMatch: footballFeatured, loading: false });

      } catch (error) {
        console.error('Error fetching stats:', error);
        setBasketballStats({ liveEvents: 0, loading: false });
        setFootballStats({ liveEvents: 0, loading: false });
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setIsRedirectingStripe(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No se pudo obtener la URL de pago');
        setIsRedirectingStripe(false);
      }
    } catch (error) {
      console.error('Error al iniciar checkout:', error);
      setIsRedirectingStripe(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-center"></div>
      </div>

      <div className="relative z-10">
        {/* HERO SECTION */}
        <section className="container mx-auto px-4 pt-40 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-[0.2em] text-purple-400 mb-8 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-1000">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            IA DEPORTIVA DE ÚLTIMA GENERACIÓN
          </div>

          <h1 className="text-6xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.85] uppercase">
            Gana con el poder <br />
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent bg-[200%_auto] animate-aurora">
              de los datos.
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            PickGenius utiliza modelos de IA avanzados y estadísticas reales de <span className="text-white">expertos deportivos</span> para entregarte las predicciones más precisas del mercado.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/props" className="group relative px-10 py-5 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all duration-500 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] uppercase tracking-widest text-sm">
              <span className="relative z-10 flex items-center gap-3">
                Explorar Props IA 🚀
              </span>
            </Link>
            {!user && (
              <Link href="/login" className="px-10 py-5 bg-white/5 text-white border border-white/10 font-black rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-500 backdrop-blur-md uppercase tracking-widest text-sm text-center">
                Crear Cuenta Gratis ✨
              </Link>
            )}
          </div>

          {/* Social Proof Mini */}
          <div className="mt-16 flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center gap-2 font-black text-xs tracking-widest uppercase">
              <span className="text-xl">🏀</span> NBA Data
            </div>
            <div className="flex items-center gap-2 font-black text-xs tracking-widest uppercase">
              <span className="text-xl">⚽</span> Top Leagues
            </div>
            <div className="flex items-center gap-2 font-black text-xs tracking-widest uppercase">
              <span className="text-xl">🛡️</span> Verified Stats
            </div>
          </div>
        </section>

        {/* FEATURED LIVE TICKER */}
        <div className="w-full bg-white/[0.02] border-y border-white/5 py-6 mb-32 overflow-hidden relative">
          <div className="flex gap-12 animate-scroll whitespace-nowrap px-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-6 min-w-max">
                <div className="flex items-center gap-3 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                  <span className="text-[10px] font-black text-green-500">HOT PICK</span>
                  <span className="text-xs font-bold text-white/80">LeBron James OVER 24.5 Pts</span>
                  <span className="text-xs font-black text-green-400">89% Prob.</span>
                </div>
                <div className="flex items-center gap-3 bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-500/20">
                  <span className="text-[10px] font-black text-purple-400">VALUE</span>
                  <span className="text-xs font-bold text-white/80">Vinícius Jr OVER 1.5 Shots</span>
                  <span className="text-xs font-black text-purple-400">76% Prob.</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES GRID */}
        <section className="container mx-auto px-4 pb-40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-10 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-white/[0.06] transition-all duration-500 group">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-purple-500/10">🧠</div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Análisis IA Profundo</h3>
              <p className="text-gray-400 leading-relaxed">No es solo azar. Nuestro motor analiza el rendimiento histórico, rachas actuales y enfrentamientos directos para darte la ventaja.</p>
            </div>
            <div className="glass-card p-10 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-white/[0.06] transition-all duration-500 group">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-blue-500/10">📊</div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Datos 100% Reales</h3>
              <p className="text-gray-400 leading-relaxed">Conexión directa con nuestros sistemas de datos. Recibe actualizaciones al segundo de promedios, lesiones y estados de forma.</p>
            </div>
            <div className="glass-card p-10 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-white/[0.06] transition-all duration-500 group">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-orange-500/10">🎟️</div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Combinadas Pro</h3>
              <p className="text-gray-400 leading-relaxed">¿Demasiados picks? Nuestra IA filtra los mejores y te sugiere combinadas de alta probabilidad para maximizar tus retornos.</p>
            </div>
          </div>
        </section>

        {/* LIVE STATS SHOWCASE */}
        <section className="container mx-auto px-4 pb-40">
          <div className="bg-gradient-to-br from-purple-900/40 to-black rounded-[40px] p-12 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-purple-500/20 transition-all duration-700"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-center lg:text-left">
                <div className="text-purple-400 font-black text-xs tracking-widest uppercase mb-4">Estatus del Sistema</div>
                <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter">Monitoreo en Tiempo Real</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <div className="text-4xl font-black mb-1">{footballStats.liveEvents}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Partidos de Fútbol</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <div className="text-4xl font-black mb-1">{basketballStats.liveEvents}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Juegos de NBA/Euro</div>
                  </div>
                </div>
                <Link href="/football-live" className="inline-flex items-center gap-3 mt-10 text-white font-black uppercase text-xs tracking-widest hover:gap-5 transition-all">
                  Ver todos los eventos en vivo <span className="text-xl"> arrow_forward </span>
                </Link>
              </div>

              {/* Match Card Preview */}
              <div className="w-full lg:w-[400px]">
                {footballStats.featuredMatch ? (
                  <div className="glass-brutal p-8 rounded-[30px] border border-white/10 shadow-2xl relative">
                    <div className="absolute top-4 right-4 animate-pulse flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-[10px] font-black text-red-500 uppercase">LIVE</span>
                    </div>
                    <div className="text-center mb-10">
                      <div className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-4">{footballStats.featuredMatch.tournament.name}</div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <img src={`https://images.weserv.nl/?url=${encodeURIComponent(`https://www.sofascore.com/api/v1/team/${footballStats.featuredMatch.homeTeam.id}/image`)}`} className="w-16 h-16 mx-auto mb-3 object-contain" alt="" />
                          <div className="text-xs font-black uppercase truncate">{footballStats.featuredMatch.homeTeam.shortName}</div>
                        </div>
                        <div className="text-5xl font-black tracking-tighter italic">
                          {footballStats.featuredMatch.homeScore.current} - {footballStats.featuredMatch.awayScore.current}
                        </div>
                        <div className="flex-1">
                          <img src={`https://images.weserv.nl/?url=${encodeURIComponent(`https://www.sofascore.com/api/v1/team/${footballStats.featuredMatch.awayTeam.id}/image`)}`} className="w-16 h-16 mx-auto mb-3 object-contain" alt="" />
                          <div className="text-xs font-black uppercase truncate">{footballStats.featuredMatch.awayTeam.shortName}</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                      <div className="text-purple-400 font-black text-[10px] uppercase mb-1">Impacto IA</div>
                      <div className="text-xl font-black italic">ALTA PROBABILIDAD DE GOL</div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 glass-card rounded-[30px] flex items-center justify-center opacity-20">
                    Cargando eventos...
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* PRICING / TIERS */}
        <section className="container mx-auto px-4 pb-40">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">Elige tu Estrategia</h2>
            <p className="text-gray-400">Desde análisis gratuitos hasta acceso total ilimitado.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-10 bg-white/5 rounded-[30px] border border-white/10 hover:border-white/20 transition-all flex flex-col">
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">FREE</h3>
              <div className="text-4xl font-black mb-8 italic">$0 <span className="text-sm font-normal text-gray-500">/siempre</span></div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-300">✅ 5 Predicciones de IA al día</li>
                <li className="flex items-center gap-3 text-sm text-gray-300">✅ Estadísticas en tiempo real</li>
                <li className="flex items-center gap-3 text-sm text-gray-300">✅ Centro de Notificaciones</li>
                <li className="flex items-center gap-4 text-sm text-gray-600">❌ Combinadas Premium</li>
              </ul>
              <Link href="/login" className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-center hover:bg-white/10">Empezar ahora</Link>
            </div>

            <div className="p-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[30px] border border-white/20 hover:scale-[1.02] transition-all flex flex-col text-white shadow-2xl shadow-purple-500/20">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-black uppercase tracking-tight">PREMIUM</h3>
                <span className="bg-white text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">BEST VALUE</span>
              </div>
              <div className="text-4xl font-black mb-8 italic">$5 <span className="text-sm font-normal opacity-60">/mes</span></div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm font-bold">✅ Predicciones de IA ILIMITADAS</li>
                <li className="flex items-center gap-3 text-sm font-bold">✅ Acceso Pro a Combinadas</li>
                <li className="flex items-center gap-3 text-sm font-bold">✅ Alertas Hot Picks Prioritarias</li>
                <li className="flex items-center gap-3 text-sm font-bold">✅ Soporte 24/7 de Expertos</li>
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={isRedirectingStripe}
                className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest text-center hover:scale-105 transition-transform disabled:opacity-50"
              >
                {isRedirectingStripe ? 'CARGANDO...' : 'Obtener Premium ✨'}
              </button>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="container mx-auto px-4 pb-40 text-center">
          <div className="max-w-4xl mx-auto py-20 px-8 rounded-[50px] bg-white text-black relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-8 italic">¿Listo para transformar <br /> tus apuestas?</h2>
              <Link href="/props" className="inline-flex items-center gap-4 px-12 py-6 bg-black text-white font-black rounded-3xl hover:scale-105 transition-all duration-500 uppercase tracking-widest text-sm shadow-2xl shadow-black/20">
                Lanzar Analizador IA ☄️
              </Link>
            </div>
          </div>
        </section>

        {/* NEWS SECTION (EXISTING) */}
        <div className="border-t border-white/5 py-20">
          <NewsSection />
        </div>

        {/* FOOTER MINI */}
        <footer className="container mx-auto px-4 py-20 text-center border-t border-white/5 opacity-40">
          <div className="font-black text-2xl mb-4 tracking-tighter">PICKGENIUS</div>
          <p className="text-xs font-bold uppercase tracking-[0.2em]">© 2025 Luis Vasquez - Inteligencia Artificial Deportiva</p>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          display: flex;
          width: 200%;
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        @keyframes aurora {
          from { background-position: 0% 50%; }
          to { background-position: 200% 50%; }
        }
        .animate-aurora {
          background-size: 200% auto;
          animation: aurora 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
