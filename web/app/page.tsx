"use client";


import { useState, useEffect } from 'react';
import {
  Zap, Trophy, Target, Globe,
  Activity, ArrowRight, Shield, Star
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { StatsCounter } from '@/components/StatsCounter';
import { SportsTabs } from '@/components/SportsTabs';
import { TestimonialSlider } from '@/components/TestimonialSlider';
import { SubscribeModal } from '@/components/SubscribeModal';

import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: news = [], isLoading: loadingNews } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Error al cargar noticias');
      const data = await res.json();
      return data.news || [];
    },
    staleTime: 1000 * 60 * 5, // News are stale after 5 minutes
  });

  return (
    <div className="relative min-h-screen text-white selection:bg-primary selection:text-black">
      <SubscribeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* --- DESIGN SYSTEM: AMBIENT LAYERS --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Deep Blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-primary/20 blur-[180px] animate-pulse rounded-full opacity-60"></div>
        <div className="absolute top-[10%] left-[-20%] w-[70%] h-[70%] bg-secondary/15 blur-[200px] rounded-full opacity-40"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] bg-accent/10 blur-[180px] rounded-full opacity-30"></div>

        {/* Textured layers */}
        <div className="absolute inset-0 checkered-bg opacity-[0.05]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-[0.02] mix-blend-overlay"></div>

        {/* Horizon Line */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm"></div>
      </div>

      <main className="relative z-10 pt-32 pb-32 px-4 md:px-12 max-w-[100rem] mx-auto space-y-40">

        {/* --- HERO SECTION --- */}
        <section className="text-center space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl group cursor-default">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-primary transition-colors">Sistema de Predicción Ultra-Voz v4.2</span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-[14rem] font-black tracking-tighter leading-[0.9] md:leading-[0.8] italic uppercase drop-shadow-[0_0_80px_rgba(255,95,31,0.2)]">
              DOMINA EL <br />
              <span className="gradient-text drop-shadow-[0_0_80px_rgba(124,58,237,0.3)]">JUEGO IA</span>
            </h1>

            <p className="text-gray-400 max-w-5xl mx-auto text-lg md:text-3xl font-medium tracking-tight leading-relaxed px-4 md:px-0 opacity-80">
              La terminal de inteligencia deportiva más avanzada. No apostamos, <span className="text-white underline decoration-primary decoration-4 underline-offset-[12px] text-glow-primary">calculamos la victoria</span> con precisión determinista.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-12">
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative w-full md:w-auto px-16 py-8 cyber-button text-black font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[35deg]"></div>
                <Trophy className="w-6 h-6" />
                <span className="relative z-10">EXPLORAR RADAR</span>
              </button>

              <Link href="/picks" className="w-full md:w-auto px-16 py-8 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white/10 hover:border-primary/50 transition-all flex items-center justify-center gap-4 group backdrop-blur-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Zap className="w-6 h-6 text-primary group-hover:animate-bounce" />
                TERMINAL PRO
              </Link>
            </div>
          </div>

          {/* --- STATS GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-20">
            <StatsCounter target={8500} label="Eventos Cierre/Mes" prefix="+" />
            <StatsCounter target={94} label="Sincro-Score Precisión" suffix="%" />
            <StatsCounter target={50} label="Ligas Globales Web" prefix="+" />
            <StatsCounter target={42} label="ROI Promedio Mensual" suffix="%" />
          </div>
        </section>

        {/* --- RADAR INFO-BETTING (NEWS FEED) --- */}
        <section className="space-y-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-12 bg-primary rounded-full"></div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
                  RADAR <span className="text-primary italic">INFO-BETTING</span>
                </h2>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md border border-red-500/50 text-red-500 text-[8px] font-black uppercase tracking-widest animate-pulse">LIVE FEED</span>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Sincronizado vía Global Logs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingNews ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-80 rounded-[3rem] bg-white/5 animate-pulse border border-white/5"></div>
              ))
            ) : (
              news.map((item: any) => (
                <div
                  key={item.id}
                  className="group relative glass-card rounded-[3rem] overflow-hidden hover:cyber-border hover:-translate-y-2 block"
                >
                  {/* Article Image with Overlay */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                      alt={item.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                    <div className="absolute top-4 right-6 bg-black/80 backdrop-blur-2xl border border-white/10 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-primary">
                      {item.source}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-6">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">{item.title}</h3>

                    {/* AI Insight Card */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-4 relative overflow-hidden group/insight">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover/insight:bg-primary transition-colors"></div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary animate-pulse" />
                          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">AI DEEP ANALYSIS</span>
                        </div>
                        <div className={clsx(
                          "px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-widest bg-black/40",
                          item.impact > 80 ? "text-red-500" : item.impact > 50 ? "text-primary" : "text-gray-500"
                        )}>
                          CONF: {item.impact}%
                        </div>
                      </div>
                      <p className="text-[12px] font-medium text-gray-300 leading-relaxed italic">
                        "{item.aiInsight}"
                      </p>
                      {/* Progress Bar */}
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            "h-full transition-all duration-1000",
                            item.impact > 80 ? "bg-red-500" : "bg-gradient-to-r from-primary to-accent"
                          )}
                          style={{ width: `${item.impact}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* --- ELITE SYSTEM SECTION --- */}
        <section className="space-y-16 reveal-on-scroll reveal-visible">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-12 bg-primary rounded-full"></div>
            <div>
              <h2 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter">
                SISTEMA <span className="text-primary italic">ELITE v4.2</span>
              </h2>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Protocolo de Alta Fidelidad</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "ALTA FIDELIDAD",
                desc: "Procesamos datos de más de 50 ligas con latencia de milisegundos para darte la señal antes que el mercado.",
                icon: Globe,
                tag: "GLOBAL-SYSTEM"
              },
              {
                title: "ESTRATEGIAS IA",
                desc: "Nuestra red neuronal PickGenius calcula parleys y props con un ROI promedio mensual del 42.8%.",
                icon: Target,
                tag: "QUANT-ENGINE"
              },
              {
                title: "IN-PLAY RADAR",
                desc: "Detectamos cambios tácticos y fatiga en vivo. Análisis que ni los narradores profesionales ven.",
                icon: Activity,
                tag: "REAL-TIME"
              }
            ].map((item, i) => (
              <div key={i} className="group p-10 glass-card rounded-[3rem] hover:cyber-border transition-all space-y-8 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/20 transition-colors"></div>

                <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all">
                    <item.icon className="w-6 h-6 md:w-10 md:h-10" />
                  </div>
                  <span className="text-[8px] md:text-[10px] font-black text-primary/50 uppercase tracking-[0.3em]">{item.tag}</span>
                </div>

                <div className="space-y-4 relative z-10">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed group-hover:text-gray-200 transition-colors">{item.desc}</p>
                </div>

                <div className="pt-4 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                  Ver Análisis Deep <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- SPORTS RADAR SELECTION --- */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">
              EL <span className="text-primary italic">RADAR</span> SPORTS
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-[0.5em] text-[10px]">Análisis Multideporte en Tiempo Real</p>
          </div>

          <SportsTabs />
        </section>

        {/* --- TESTIMONIALS SECTION --- */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
              VOCES DE LA <span className="text-primary italic">COMUNIDAD</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-[0.5em] text-[10px]">Resultados Verificados por Usuarios Elite</p>
          </div>

          <TestimonialSlider />
        </section>

        {/* --- TERMINAL DETERMINISTA: THE CORE --- */}
        <section className="glass-card rounded-[4rem] p-12 md:p-24 relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all group/core">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary via-secondary to-accent"></div>
          <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>

          <div className="grid md:grid-cols-2 gap-24 items-center relative z-10">
            <div className="space-y-12">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em]">ADMIN-CORE-SYSTEM</div>
              <h2 className="text-7xl md:text-[10rem] font-black italic uppercase leading-[0.85] tracking-tighter">
                LA <br />
                TERMINAL <br />
                <span className="gradient-text italic">ULTRA.</span>
              </h2>
              <p className="text-gray-400 text-xl md:text-2xl font-medium leading-relaxed max-w-xl italic border-l-2 border-white/10 pl-8">
                No creemos en la suerte, creemos en la arquitectura del dato. PickGenius es el puente entre el azar y el éxito medible.
              </p>
              <div className="flex gap-12">
                <div className="space-y-3">
                  <h4 className="text-6xl font-black text-white italic tracking-tighter shadow-primary/20">8.5K</h4>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">SOLY-DATA FEED</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-6xl font-black text-primary italic tracking-tighter">94%</h4>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">STABILITY SCORE</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { label: "RADAR ENGINE", val: "ACTIVE_SCAN", color: "text-primary" },
                { label: "AI PREDICT V4", val: "FIRM_SIGNAL", color: "text-accent" },
                { label: "BANKROLL OPS", val: "ENCRYPTED", color: "text-secondary" }
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between p-8 bg-black/40 rounded-[2.5rem] border border-white/5 hover:border-primary/30 transition-all hover:translate-x-4 duration-500 backdrop-blur-3xl group/row">
                  <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-1.5 rounded-full ${row.color} bg-current animate-pulse shadow-[0_0_10px_currentColor]`} />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">{row.label}</span>
                  </div>
                  <span className={`text-xs font-black font-mono tracking-widest italic ${row.color}`}>{row.val}</span>
                </div>
              ))}
              <div className="pt-10">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full cyber-button p-10 rounded-[2.5rem] flex items-center justify-between group/btn overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 skew-x-[35deg]"></div>
                  <span className="text-xl font-black text-black italic uppercase tracking-widest">ACTIVAR SISTEMA ELITE</span>
                  <div className="bg-black text-white p-4 rounded-full group-hover/btn:rotate-45 transition-transform duration-500">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
