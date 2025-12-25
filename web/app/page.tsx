'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Shield, Zap, TrendingUp, Trophy, BarChart3, Star, ArrowRight, Play, Target } from 'lucide-react';
import NewsSection from '@/components/home/NewsSection';
import SportsGrid from '@/components/home/SportsGrid';
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
            const now = Date.now();
            const twelveHoursFromNow = now + (12 * 60 * 60 * 1000); // 12 horas
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

            let res = await fetch(`/api/basketball/scheduled?date=${today}`);
            let data = await res.json();

            if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
              res = await fetch(`/api/basketball/scheduled?date=${tomorrow}`);
              data = await res.json();
            }

            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
              // 🔥 Filtrar solo eventos en las próximas 12 horas
              const upcomingGames = data.data.filter((game: any) => {
                const eventStartTime = game.startTimestamp * 1000;
                return eventStartTime <= twelveHoursFromNow;
              });

              const nextGame = upcomingGames[0];
              if (nextGame) {
                const isTomorrow = new Date(nextGame.startTimestamp * 1000).getDate() !== new Date().getDate();
                basketballFeatured = {
                  id: nextGame.id,
                  homeTeam: nextGame.homeTeam,
                  awayTeam: nextGame.awayTeam,
                  homeScore: { current: 0 },
                  awayScore: { current: 0 },
                  tournament: nextGame.tournament,
                  status: {
                    description: `${isTomorrow ? 'Mañana ' : ''}${new Date(nextGame.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                    type: 'scheduled'
                  },
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

        if (!footballFeatured) {
          try {
            const now = Date.now();
            const twelveHoursFromNow = now + (12 * 60 * 60 * 1000); // 12 horas
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

            let res = await fetch(`/api/football/scheduled?date=${today}`);
            let data = await res.json();

            if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
              res = await fetch(`/api/football/scheduled?date=${tomorrow}`);
              data = await res.json();
            }

            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
              // 🔥 Filtrar solo eventos en las próximas 12 horas
              const upcomingGames = data.data.filter((game: any) => {
                const eventStartTime = game.startTimestamp * 1000;
                return eventStartTime <= twelveHoursFromNow;
              });

              const nextGame = upcomingGames[0];
              if (nextGame) {
                const isTomorrow = new Date(nextGame.startTimestamp * 1000).getDate() !== new Date().getDate();
                footballFeatured = {
                  id: nextGame.id,
                  tournament: nextGame.tournament,
                  homeTeam: nextGame.homeTeam,
                  awayTeam: nextGame.awayTeam,
                  homeScore: { current: 0 },
                  awayScore: { current: 0 },
                  status: {
                    description: `${isTomorrow ? 'Mañana ' : ''}${new Date(nextGame.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                    type: 'scheduled'
                  },
                  isScheduled: true
                };
              }
            }
          } catch (e) {
            console.error("Error fetching scheduled football", e);
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
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden font-sans">

      {/* Background Ambience - Enhanced */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[150px] animate-slow-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] animate-slow-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none"></div>
      </div>

      <div className="relative z-10">
        {/* HERO SECTION - REDESIGNED */}
        <section className="container mx-auto px-4 pt-48 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-[2rem] text-[10px] font-black tracking-[0.3em] text-purple-400 mb-10 backdrop-blur-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500 shadow-[0_0_10px_purple]"></span>
            </span>
            INTELIGENCIA DEPORTIVA DE ÚLTIMA GENERACIÓN • <span className="text-emerald-400 ml-1">PRUEBA 15 DÍAS GRATIS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-7xl md:text-[11rem] font-black mb-10 tracking-tighter leading-[0.8] uppercase italic"
          >
            DOMINA EL<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-[200%_auto] animate-aurora">
              JUEGO IA.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto mb-16 leading-tight font-medium tracking-tight"
          >
            PickGenius no adivina. Nuestros algoritmos analizan millones de datos por segundo para entregarte <span className="text-white font-bold">ventaja competitiva real</span> en cada apuesta.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/props" className="group relative px-12 py-6 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all duration-500 shadow-[0_0_50px_rgba(255,255,255,0.2)] uppercase tracking-widest text-sm flex items-center gap-3">
              Lanzar Analizador IA <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
            {!user && (
              <Link href="/login" className="px-12 py-6 bg-white/5 text-white border border-white/10 font-black rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-500 backdrop-blur-md uppercase tracking-widest text-sm relative group overflow-hidden">
                <span className="relative z-10">Reclamar 15 Días Premium Gratis ✨</span>
                <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </Link>
            )}
          </motion.div>
        </section>

        {/* BRUTAL LIVE TICKER */}
        <div className="w-full bg-white/[0.01] border-y border-white/5 py-8 mb-40 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] z-10 pointer-events-none"></div>
          <div className="flex gap-16 animate-scroll whitespace-nowrap px-4">
            {/* Ticker Item 1: Football Parley */}
            <div className="flex items-center gap-10 min-w-max">
              <div className="flex items-center gap-4 bg-orange-500/5 px-6 py-3 rounded-2xl border border-orange-500/10 backdrop-blur-md">
                <span className="text-[10px] font-black text-orange-500 tracking-widest uppercase italic">🔥 PARLEY PRO</span>
                <span className="text-sm font-bold text-white/90">Lakers ML + Lebron James Over 25.5 Pts</span>
                <span className="flex items-center gap-1 text-xs font-black text-orange-400">92% CONF <TrendingUp className="w-3 h-3" /></span>
              </div>
            </div>

            {/* Ticker Item 2: Football Value */}
            <div className="flex items-center gap-10 min-w-max">
              <div className="flex items-center gap-4 bg-emerald-500/5 px-6 py-3 rounded-2xl border border-emerald-500/10 backdrop-blur-md">
                <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase italic">💎 VALUE BET</span>
                <span className="text-sm font-bold text-white/90">Real Madrid vs Barcelona: Ambos Marcan (BTTS)</span>
                <span className="flex items-center gap-1 text-xs font-black text-emerald-400">88% PROB <Star className="w-3 h-3 fill-emerald-500" /></span>
              </div>
            </div>

            {/* Ticker Item 3: Tennis Live */}
            <div className="flex items-center gap-10 min-w-max">
              <div className="flex items-center gap-4 bg-blue-500/5 px-6 py-3 rounded-2xl border border-blue-500/10 backdrop-blur-md">
                <span className="text-[10px] font-black text-blue-500 tracking-widest uppercase italic">🎾 ACE ALERT</span>
                <span className="text-sm font-bold text-white/90">Alcaraz 2nd Set Winner @ 1.85</span>
                <span className="flex items-center gap-1 text-xs font-black text-blue-400">LIVE ALPHA <Zap className="w-3 h-3 fill-blue-500" /></span>
              </div>
            </div>

            {/* Ticker Item 4: High Odds */}
            <div className="flex items-center gap-10 min-w-max">
              <div className="flex items-center gap-4 bg-purple-500/5 px-6 py-3 rounded-2xl border border-purple-500/10 backdrop-blur-md">
                <span className="text-[10px] font-black text-purple-500 tracking-widest uppercase italic">🚀 MOONSHOT</span>
                <span className="text-sm font-bold text-white/90">Man City Correct Score 3-1</span>
                <span className="flex items-center gap-1 text-xs font-black text-purple-400">CUOTA 12.0 <Trophy className="w-3 h-3 fill-purple-500" /></span>
              </div>
            </div>

            {/* Duplicate for seamless loop effect (optional, or just rely on CSS) */}
            <div className="flex items-center gap-10 min-w-max">
              <div className="flex items-center gap-4 bg-orange-500/5 px-6 py-3 rounded-2xl border border-orange-500/10 backdrop-blur-md">
                <span className="text-[10px] font-black text-orange-500 tracking-widest uppercase italic">🔥 PARLEY PRO</span>
                <span className="text-sm font-bold text-white/90">Lakers ML + Lebron James Over 25.5 Pts</span>
                <span className="flex items-center gap-1 text-xs font-black text-orange-400">92% CONF <TrendingUp className="w-3 h-3" /></span>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES GRID - ELITE STYLE */}
        <section className="container mx-auto px-4 pb-48">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Link href="/parley" className="block outline-none">
              <motion.div
                whileHover={{ y: -10 }}
                className="glass-card h-full p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] hover:bg-white/[0.04] transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Target className="w-32 h-32" />
                </div>
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-10 shadow-2xl shadow-purple-500/5">
                  <Zap className="w-8 h-8 fill-purple-400/20" />
                </div>
                <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter italic">Criterio de Kelly (Parley)</h3>
                <p className="text-gray-400 leading-tight text-lg">Optimización matemática de tus apuestas combinadas. No solo multiplicamos cuotas, calculamos tu stake ideal para maximizar el crecimiento del capital.</p>
              </motion.div>
            </Link>

            <Link href="/bankroll" className="block outline-none">
              <motion.div
                whileHover={{ y: -10 }}
                className="glass-card h-full p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] hover:bg-white/[0.04] transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Shield className="w-32 h-32" />
                </div>
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-10 shadow-2xl shadow-blue-500/5">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter italic">Bankroll Terminal</h3>
                <p className="text-gray-400 leading-tight text-lg">Visualiza tu ROI, beneficio proyectado y distribución de riesgo por deporte. Una suite financiera profesional para el apostador disciplinado.</p>
              </motion.div>
            </Link>

            <Link href="/football-live" className="block outline-none">
              <motion.div
                whileHover={{ y: -10 }}
                className="glass-card h-full p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] hover:bg-white/[0.04] transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Zap className="w-32 h-32" />
                </div>
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-10 shadow-2xl shadow-emerald-500/5">
                  <ArrowRight className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter italic">Alpha de Tiempo Real</h3>
                <p className="text-gray-400 leading-tight text-lg">Alertas de "Peligro Crítico" (Grito de Gol) basadas en momentum de ataque en vivo. Recibe notificaciones antes de que el mercado reaccione.</p>
              </motion.div>
            </Link>
          </div>
        </section>

        {/* LIVE SYSTEM SHOWCASE - REDESIGNED */}
        <section className="container mx-auto px-4 pb-48">
          <div className="bg-gradient-to-br from-[#0c0c0c] to-black rounded-[4rem] p-16 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                <div className="inline-block px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black tracking-widest text-emerald-400 uppercase mb-8">Ecosistema Profesional</div>
                <h2 className="text-6xl md:text-8xl font-black mb-12 uppercase italic tracking-tighter leading-none">LA TERMINAL<br />DETERMINISTA.</h2>

                <p className="text-xl text-gray-500 mb-12 max-w-lg leading-tight font-medium">
                  Hemos diseñado un centro de control unificado. De la detección del valor en vivo a la gestión del capital, todo en un solo flujo de trabajo.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                  <Link href="/bankroll" className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 hover:bg-white/5 transition-all flex items-center justify-between group">
                    <div>
                      <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Finanzas Pro</div>
                      <div className="text-xl font-bold italic uppercase tracking-tighter">Bankroll Hub</div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-gray-600 group-hover:text-emerald-400" />
                  </Link>
                  <Link href="/parley" className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 hover:bg-white/5 transition-all flex items-center justify-between group">
                    <div>
                      <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Multiplicadores</div>
                      <div className="text-xl font-bold italic uppercase tracking-tighter">Smart Parley</div>
                    </div>
                    <Zap className="w-5 h-5 text-gray-600 group-hover:text-purple-400" />
                  </Link>
                </div>

                <Link href="/football-live" className="group flex items-center gap-4 text-white font-black uppercase text-sm tracking-[0.2em] hover:text-emerald-400 transition-colors">
                  ENTRAR AL WAR ROOM <Play className="w-5 h-5 fill-white group-hover:fill-emerald-400 transition-all" />
                </Link>
              </div>

              {/* Match Card Preview - Modern Brutal */}
              <Link href={`/football-live/${footballStats.featuredMatch?.id}`} className="relative group/card block outline-none">
                <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000"></div>
                <AnimatePresence mode="wait">
                  {footballStats.featuredMatch && (
                    <motion.div
                      key={footballStats.featuredMatch.id}
                      initial={{ opacity: 0, scale: 0.9, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -20 }}
                      className="glass-brutal p-12 rounded-[4rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,1)] bg-gradient-to-b from-white/5 to-transparent backdrop-blur-3xl"
                    >
                      <div className="absolute top-10 right-10 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Momentum Control</span>
                      </div>

                      <div className="text-center">
                        <div className="text-gray-500 font-black text-[10px] uppercase tracking-[0.3em] mb-12">{footballStats.featuredMatch.tournament.name}</div>

                        <div className="flex items-center justify-between gap-12">
                          <div className="flex-1">
                            <motion.img
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              src={`/api/proxy/team-logo/${footballStats.featuredMatch.homeTeam.id}`}
                              className="w-24 h-24 mx-auto mb-6 object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                              alt=""
                            />
                            <h3 className="font-black text-xl uppercase tracking-tighter">{footballStats.featuredMatch.homeTeam.name}</h3>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-700">VS</div>
                            <div className="mt-4 px-4 py-2 bg-white/5 rounded-full text-xs font-black uppercase tracking-widest border border-white/10">
                              {new Date(footballStats.featuredMatch.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          <div className="flex-1 text-center">
                            <motion.img
                              whileHover={{ scale: 1.1, rotate: -5 }}
                              src={`/api/proxy/team-logo/${footballStats.featuredMatch.awayTeam.id}`}
                              className="w-24 h-24 mx-auto mb-6 object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                              alt=""
                            />
                            <h3 className="font-black text-xl uppercase tracking-tighter">{footballStats.featuredMatch.awayTeam.name}</h3>
                          </div>
                        </div>
                      </div>

                      <div className="mt-16 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 text-center group-hover/card:bg-emerald-500/20 transition-all">
                        <div className="text-emerald-400 font-black text-[10px] uppercase tracking-widest mb-2">PROYECCIÓN IA</div>
                        <div className="text-2xl font-black italic uppercase tracking-tighter text-white">PELIGRO CRÍTICO DETECTADO</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </div>
          </div>
        </section>

        {/* PRICING - ELITE TIERS */}
        <section className="container mx-auto px-4 pb-48">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 italic">PLANES DE ÉXITO</h2>
            <p className="text-gray-400 text-lg uppercase tracking-widest font-bold">Escala tu rentabilidad con herramientas profesionales.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-12 bg-white/[0.01] rounded-[4rem] border border-white/5 hover:border-white/10 transition-all flex flex-col group"
            >
              <h3 className="text-3xl font-black mb-2 uppercase tracking-tight italic">ACCESO GRATUITO</h3>
              <div className="text-5xl font-black mb-12 italic tracking-tighter">$0 <span className="text-sm font-normal text-gray-600 uppercase tracking-widest">/SIEMPRE</span></div>
              <ul className="space-y-6 mb-16 flex-1">
                <li className="flex items-center gap-4 text-sm font-bold text-gray-400">
                  <span className="w-5 h-5 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center text-[10px]">✓</span>
                  <span className="text-white">15 Días de Acceso PREMIUM Total</span>
                </li>
                <li className="flex items-center gap-4 text-sm font-bold text-gray-400">
                  <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px]">✓</span>
                  5 Predicciones de IA al día (Post-Trial)
                </li>
                <li className="flex items-center gap-4 text-sm font-bold text-gray-400">
                  <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px]">✓</span>
                  Estadísticas en tiempo real
                </li>
                <li className="flex items-center gap-4 text-sm font-bold text-gray-400">
                  <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px]">✓</span>
                  Centro de Notificaciones Básicas
                </li>
              </ul>
              <Link href="/login" className="w-full py-5 bg-white/5 border border-white/10 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] text-center hover:bg-white/10 transition-all text-emerald-400">
                INICIAR PRUEBA GRATIS
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-12 bg-gradient-to-br from-purple-800 to-blue-900 rounded-[4rem] border border-white/20 relative flex flex-col text-white shadow-[0_0_100px_rgba(168,85,247,0.15)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <Shield className="w-24 h-24 opacity-10" />
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-3xl font-black uppercase tracking-tight italic">ELITE PREMIUM</h3>
                <span className="bg-white text-black text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">RECOMENDADO</span>
              </div>
              <div className="text-5xl font-black mb-12 italic tracking-tighter">$5 <span className="text-sm font-normal opacity-60 uppercase tracking-widest">/mes</span></div>
              <ul className="space-y-6 mb-16 flex-1">
                <li className="flex items-center gap-4 text-sm font-black">
                  <span className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[10px]">✓</span>
                  IA ILIMITADA SIN RESTRICCIONES
                </li>
                <li className="flex items-center gap-4 text-sm font-black text-purple-200">
                  <span className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[10px]">✓</span>
                  ACCESO PRO A COMBINADAS (PARLEYS)
                </li>
                <li className="flex items-center gap-4 text-sm font-black text-blue-200">
                  <span className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[10px]">✓</span>
                  ALERTAS HOT PICKS PRIORITARIAS
                </li>
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={isRedirectingStripe}
                className="w-full py-5 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] text-center hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all disabled:opacity-50"
              >
                {isRedirectingStripe ? 'PROCESANDO...' : 'DESBLOQUEAR ACCESO ELITE ✨'}
              </button>
            </motion.div>
          </div>
        </section>

        {/* NEWS SECTION - KEEP EXISTING BUT WRAP */}
        <div className="border-t border-white/5 py-32 bg-white/[0.01]">
          <div className="container mx-auto px-4">
            <NewsSection />
          </div>
        </div>

        {/* FOOTER - MINIMAL ELITE */}
        <footer className="container mx-auto px-4 py-32 text-center opacity-40">
          <div className="font-black text-4xl mb-6 tracking-tighter italic italic">PICKGENIUS</div>
          <div className="flex justify-center gap-8 mb-8 text-xs font-black uppercase tracking-widest">
            <Link href="/" className="hover:text-white">Inicio</Link>
            <Link href="/football-live" className="hover:text-white">Eventos en Vivo</Link>
            <Link href="/props" className="hover:text-white">Props IA</Link>
            <Link href="/privacy" className="hover:text-white">Legal</Link>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-500">© 2025 LUIS VASQUEZ • SISTEMA DE INTELIGENCIA DEPORTIVA AVANZADA</p>
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
          animation: scroll 30s linear infinite;
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
        @keyframes slow-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-slow-pulse {
          animation: slow-pulse 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
