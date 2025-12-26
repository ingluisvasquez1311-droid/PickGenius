'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';

export default function LiveTicker() {
  const [tickerItems, setTickerItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickerData() {
      try {
        // Fetch simplified data for the ticker for all major sports
        const [footballData, basketballData, tennisData, baseballData, hockeyData, amFootballData] = await Promise.all([
          fetchAPI('/api/football/live'),
          fetchAPI('/api/basketball/live'),
          fetchAPI('/api/tennis/live'),
          fetchAPI('/api/baseball/live'),
          fetchAPI('/api/ice-hockey/live'),
          fetchAPI('/api/american-football/live')
        ]);

        let items: any[] = [];

        if (footballData.success && Array.isArray(footballData.data)) {
          items = [...items, ...footballData.data.slice(0, 5).map((e: any) => ({
            id: e.id,
            sport: '⚽',
            sportSlug: 'football',
            home: e.homeTeam.name,
            away: e.awayTeam.name,
            score: `${e.homeScore.current}-${e.awayScore.current}`,
            time: e.status?.description || 'LIVE',
            isLive: true
          }))];
        }

        if (basketballData.success && Array.isArray(basketballData.data)) {
          items = [...items, ...basketballData.data.slice(0, 3).map((e: any) => ({
            id: e.id,
            sport: '🏀',
            sportSlug: 'basketball',
            home: e.homeTeam.name,
            away: e.awayTeam.name,
            score: `${e.homeScore.current}-${e.awayScore.current}`,
            time: e.status?.description || 'LIVE',
            isLive: true
          }))];
        }

        if (tennisData.success && Array.isArray(tennisData.data)) {
          items = [...items, ...tennisData.data.slice(0, 3).map((e: any) => ({
            id: e.id,
            sport: '🎾',
            sportSlug: 'tennis',
            home: e.homeTeam.name,
            away: e.awayTeam.name,
            score: `${e.homeScore.current}-${e.awayScore.current}`,
            time: e.status?.description || 'LIVE',
            isLive: true
          }))];
        }

        if (baseballData.success && Array.isArray(baseballData.data)) {
          items = [...items, ...baseballData.data.slice(0, 3).map((e: any) => ({
            id: e.id,
            sport: '⚾',
            sportSlug: 'baseball',
            home: e.homeTeam.name,
            away: e.awayTeam.name,
            score: `${e.homeScore.current}-${e.awayScore.current}`,
            time: e.status?.description || 'LIVE',
            isLive: true
          }))];
        }

        if (hockeyData.success && Array.isArray(hockeyData.data)) {
          items = [...items, ...hockeyData.data.slice(0, 3).map((e: any) => ({
            id: e.id,
            sport: '🏒',
            sportSlug: 'nhl',
            home: e.homeTeam.name,
            away: e.awayTeam.name,
            score: `${e.homeScore.current}-${e.awayScore.current}`,
            time: e.status?.description || 'LIVE',
            isLive: true
          }))];
        }

        if (amFootballData.success && Array.isArray(amFootballData.data)) {
          items = [...items, ...amFootballData.data.slice(0, 3).map((e: any) => ({
            id: e.id,
            sport: '🏈',
            sportSlug: 'nfl',
            home: e.homeTeam.name,
            away: e.awayTeam.name,
            score: `${e.homeScore.current}-${e.awayScore.current}`,
            time: e.status?.description || 'LIVE',
            isLive: true
          }))];
        }

        // Duplicar items para scroll infinito suave
        setTickerItems([...items, ...items]);
      } catch (error) {
        console.error('Error fetching ticker:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTickerData();
  }, []);

  if (loading || tickerItems.length === 0) return null;

  return (
    <div className="w-full bg-[#050505]/80 backdrop-blur-md border-b border-white/10 overflow-hidden py-2 fixed top-16 z-40">
      <div className="flex whitespace-nowrap animate-scroll hover:pause">
        {tickerItems.map((item, i) => (
          <Link
            key={i}
            href={`/match/${item.sportSlug}/${item.id}`}
            className="flex items-center gap-4 mx-6 text-xs md:text-sm hover:bg-white/5 px-3 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <span className="font-bold text-red-500 animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {item.time}
            </span>
            <span className="text-gray-300 font-medium">
              {item.sport} {item.home} <span className="text-white font-bold">{item.score}</span> {item.away}
            </span>
            <div className="w-px h-3 bg-white/20 ml-2"></div>
          </Link>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
          display: flex;
        }
        .hover\:pause:hover {
            animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
