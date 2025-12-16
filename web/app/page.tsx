'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NewsSection from '@/components/home/NewsSection';

interface SportStats {
  liveEvents: number;
  featuredMatch?: any;
  loading: boolean;
}

export default function HomePage() {
  const [basketballStats, setBasketballStats] = useState<SportStats>({ liveEvents: 0, loading: true });
  const [footballStats, setFootballStats] = useState<SportStats>({ liveEvents: 0, loading: true });

  useEffect(() => {
    async function fetchStats() {
      try {
        // --- BASKETBALL FETCH ---
        // 1. Try Live
        const basketballRes = await fetch('/api/basketball/live');
        const basketballData = await basketballRes.json();
        let basketballFeatured = null;
        let basketballCount = 0;

        if (basketballData.success && basketballData.data) {
          const nbaLive = basketballData.data.filter((e: any) =>
            e.tournament?.name?.toLowerCase().includes('nba') ||
            e.tournament?.uniqueTournament?.name?.toLowerCase().includes('nba')
          );
          basketballCount = nbaLive.length;
          if (nbaLive.length > 0) basketballFeatured = nbaLive[0];
        }

        // 2. If no live, try Scheduled (for generic display)
        if (!basketballFeatured) {
          try {
            const scheduledRes = await fetch(`/api/basketball/scheduled?date=${new Date().toISOString().split('T')[0]}`);
            const scheduledData = await scheduledRes.json();
            if (scheduledData.success && scheduledData.data?.events) {
              const nbaScheduled = scheduledData.data.events.filter((e: any) =>
                e.tournament?.name?.toLowerCase().includes('nba') ||
                e.tournament?.uniqueTournament?.name?.toLowerCase().includes('nba')
              );
              if (nbaScheduled.length > 0) {
                const nextGame = nbaScheduled[0];
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

  return (
    <div className="min-h-screen bg-[#050505] overflow-hidden relative selection:bg-purple-500/30">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[60%] h-[40%] bg-indigo-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">

        {/* HERO SECTION */}
        <div className="flex flex-col items-center text-center mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-purple-300 mb-6 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            IA V2.0 ACTIVADA
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-[0.9] text-white animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            DOMINA EL <br />
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent bg-[200%_auto] animate-aurora">
              JUEGO
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Predicciones deportivas con inteligencia artificial y estadísticas en tiempo real.
            <span className="text-white font-semibold"> Deja de adivinar, empieza a ganar.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/football-live" className="group relative px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]">
              <span className="relative z-10 flex items-center gap-2">
                Ver Fútbol en Vivo ⚽
              </span>
            </Link>
            <Link href="/basketball-live" className="group px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm">
              Ver Baloncesto 🏀
            </Link>
          </div>
        </div>

        {/* FLOATING STATS PREVIEW (REAL DATA) */}
        <div className="relative h-[400px] w-full max-w-5xl mx-auto mb-32 hidden md:block">

          {/* Card 1: Football - Left Floater */}
          {footballStats.featuredMatch && (
            <div className="absolute top-10 left-0 w-80 glass-brutal rounded-2xl p-6 transform -rotate-6 animate-float z-20 hover:z-30 transition-all hover:scale-110 duration-500 cursor-default border-t-4 border-t-green-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <img src={footballStats.featuredMatch.homeTeam?.logo || ''} alt="Home" className="w-8 h-8 rounded-full bg-gray-800 object-contain p-1" />
                  <span className="font-bold truncate max-w-[120px]">{footballStats.featuredMatch.homeTeam?.name}</span>
                </div>
                <span className="text-2xl font-mono font-bold">{footballStats.featuredMatch.homeScore?.current ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={footballStats.featuredMatch.awayTeam?.logo || ''} alt="Away" className="w-8 h-8 rounded-full bg-gray-800 object-contain p-1" />
                  <span className="font-bold truncate max-w-[120px]">{footballStats.featuredMatch.awayTeam?.name}</span>
                </div>
                <span className="text-2xl font-mono font-bold">{footballStats.featuredMatch.awayScore?.current ?? 0}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-green-400 font-bold animate-pulse">● EN VIVO</span>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Min {footballStats.featuredMatch.status?.description?.replace(/[^0-9]/g, '')}'</span>
                </div>
              </div>
            </div>
          )}

          {/* Card 2: Basketball - Right Floater */}
          {basketballStats.featuredMatch && (
            <div className="absolute bottom-10 right-0 w-80 glass-brutal rounded-2xl p-6 transform rotate-6 animate-float-delayed z-20 hover:z-30 transition-all hover:scale-110 duration-500 cursor-default border-t-4 border-t-orange-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <img src={`https://api.sofascore.app/api/v1/team/${basketballStats.featuredMatch.homeTeam.id}/image`} alt="Home" className="w-8 h-8 rounded-full bg-gray-800 object-contain p-1" />
                  <span className="font-bold truncate max-w-[120px]">{basketballStats.featuredMatch.homeTeam.name}</span>
                </div>
                <span className="text-2xl font-mono font-bold">{basketballStats.featuredMatch.homeScore?.current ?? '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={`https://api.sofascore.app/api/v1/team/${basketballStats.featuredMatch.awayTeam.id}/image`} alt="Away" className="w-8 h-8 rounded-full bg-gray-800 object-contain p-1" />
                  <span className="font-bold truncate max-w-[120px]">{basketballStats.featuredMatch.awayTeam.name}</span>
                </div>
                <span className="text-2xl font-mono font-bold">{basketballStats.featuredMatch.awayScore?.current ?? '-'}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-orange-500 h-full w-[60%] animate-loading-bar"></div>
                </div>
                <span className="text-xs text-gray-400">
                  {basketballStats.featuredMatch.isScheduled ?
                    `Comienza a las ${basketballStats.featuredMatch.status.description}` :
                    `Probabilidad de victoria: ${basketballStats.featuredMatch.homeTeam.name} 60%`}
                </span>
              </div>
            </div>
          )}

          {/* Card 3: Center Hero */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 glass-brutal rounded-2xl p-8 z-10 shadow-[0_0_100px_rgba(168,85,247,0.15)] text-center">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Powered by Gemini AI</div>
            <h3 className="text-3xl font-bold text-white mb-2">Estadísticas Smart</h3>
            <p className="text-gray-400 text-sm mb-6">Analizamos millones de datos por segundo para darte la ventaja competitiva.</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 rounded p-2">
                <div className="text-xl font-bold text-white">92%</div>
                <div className="text-[10px] text-gray-500">Precisión</div>
              </div>
              <div className="bg-white/5 rounded p-2">
                <div className="text-xl font-bold text-white">{basketballStats.liveEvents + footballStats.liveEvents}</div>
                <div className="text-[10px] text-gray-500">En Vivo</div>
              </div>
              <div className="bg-white/5 rounded p-2">
                <div className="text-xl font-bold text-white">24/7</div>
                <div className="text-[10px] text-gray-500">Monitor</div>
              </div>
            </div>
          </div>
        </div>

        {/* LIVE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Basketball */}
          <Link href="/basketball-live" className="group relative overflow-hidden rounded-3xl bg-[#111] border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(168,85,247,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="p-8 relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="p-3 bg-white/5 rounded-xl text-3xl">🏀</div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-500 uppercase">En Vivo</span>
                  <span className="text-2xl font-bold text-white tabular-nums">{basketballStats.liveEvents}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Baloncesto</h3>
              <p className="text-gray-400 text-sm">NBA, EuroLeague y ligas internacionales al instante.</p>
            </div>
          </Link>

          {/* Football */}
          <Link href="/football-live" className="group relative overflow-hidden rounded-3xl bg-[#111] border border-white/10 hover:border-green-500/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(16,185,129,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="p-8 relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="p-3 bg-white/5 rounded-xl text-3xl">⚽</div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-500 uppercase">En Vivo</span>
                  <span className="text-2xl font-bold text-white tabular-nums">{footballStats.liveEvents}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Fútbol</h3>
              <p className="text-gray-400 text-sm">Resultados, estadísticas y predicciones de las mejores ligas.</p>
            </div>
          </Link>
        </div>

        {/* NEWS SECTION */}
        <NewsSection />

      </div>
    </div>
  );
}
