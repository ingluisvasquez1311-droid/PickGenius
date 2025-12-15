'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

interface SportStats {
  liveEvents: number;
  loading: boolean;
}

export default function HomePage() {
  const [basketballStats, setBasketballStats] = useState<SportStats>({ liveEvents: 0, loading: true });
  const [footballStats, setFootballStats] = useState<SportStats>({ liveEvents: 0, loading: true });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch basketball events
        // const basketballRes = await fetch(`${API_URL}/api/sofascore/basketball/live`);
        const basketballRes = await fetch('/api/basketball/live');
        const basketballData = await basketballRes.json();

        if (basketballData.success) {
          const professionalEvents = basketballData.data.filter((event: any) => {
            const tournament = event.tournament?.name?.toLowerCase() || '';
            const uniqueTournament = event.tournament?.uniqueTournament?.name?.toLowerCase() || '';
            return tournament.includes('nba') ||
              uniqueTournament.includes('nba') ||
              tournament.includes('euroleague') ||
              tournament.includes('acb');
          });
          setBasketballStats({ liveEvents: professionalEvents.length, loading: false });
        }

        // Fetch football events
        // const footballRes = await fetch(`${API_URL}/api/sofascore/football/live`);
        const footballRes = await fetch('/api/football/live');
        const footballData = await footballRes.json();

        if (footballData.success) {
          setFootballStats({ liveEvents: footballData.data.length, loading: false });
        }
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

  const sportCards = [
    {
      title: 'Baloncesto',
      icon: '🏀',
      href: '/basketball-live',
      stats: basketballStats,
      color: 'from-blue-600 to-blue-800',
      hoverColor: 'hover:from-blue-500 hover:to-blue-700',
    },
    {
      title: 'Fútbol',
      icon: '⚽',
      href: '/football-live',
      stats: footballStats,
      color: 'from-green-600 to-green-800',
      hoverColor: 'hover:from-green-500 hover:to-green-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            📊 PickGenius Estadísticas en Vivo
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Estadísticas en tiempo real de tus deportes favoritos
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full text-sm text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Datos en tiempo real
          </div>
        </div>

        {/* Sport Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {sportCards.map((sport) => (
            <Link
              key={sport.href}
              href={sport.href}
              className={`
                  relative overflow-hidden rounded-2xl p-8 
                  bg-gradient-to-br ${sport.color} ${sport.hoverColor}
                  transform transition-all duration-300 hover:scale-105
                  shadow-2xl hover:shadow-3xl
                `}
            >
              <div className="relative z-10">
                <div className="text-6xl mb-4">{sport.icon}</div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {sport.title}
                </h2>
                <div className="flex items-baseline gap-2 mb-4">
                  {sport.stats.loading ? (
                    <div className="text-gray-300">Cargando...</div>
                  ) : (
                    <>
                      <span className="text-5xl font-bold text-white">
                        {sport.stats.liveEvents}
                      </span>
                      <span className="text-gray-200">eventos en vivo</span>
                    </>
                  )}
                </div>
                <div className="inline-flex items-center gap-2 text-white text-sm font-semibold">
                  Ver estadísticas
                  <span>→</span>
                </div>
              </div>

              {/* Decorative circles */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
              <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Características
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'Tiempo Real', desc: 'Actualización automática cada minuto' },
              { icon: '📊', title: 'Estadísticas Detalladas', desc: 'Puntos, rebotes, asistencias y más' },
              { icon: '🎯', title: 'Ligas Profesionales', desc: 'NBA, EuroLeague, LaLiga y más' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
