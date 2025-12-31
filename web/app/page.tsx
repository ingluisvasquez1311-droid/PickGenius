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

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news');
        const data = await res.json();
        setNews(data.news || []);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="relative min-h-screen text-white selection:bg-primary selection:text-black">
      <SubscribeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* --- DESIGN SYSTEM: AMBIENT LAYERS --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[200px] animate-pulse"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] bg-accent/5 blur-[180px]"></div>
        <div className="absolute inset-0 checkered-bg opacity-[0.03]"></div>
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
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

            <h1 className="text-8xl md:text-[14rem] font-black tracking-tighter leading-[0.8] italic uppercase drop-shadow-[0_0_50px_rgba(255,255,255,0.05)]">
              DOMINA EL <br />
              <span className="gradient-text">JUEGO IA</span>
            </h1>

            <p className="text-gray-500 max-w-4xl mx-auto text-lg md:text-3xl font-medium tracking-tight leading-relaxed">
              La terminal de inteligencia deportiva más avanzada. No apostamos, <span className="text-white underline decoration-primary underline-offset-[12px]">calculamos la victoria</span> con precisión determinista.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-12">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto px-16 py-7 bg-primary text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-4 shadow-[0_30px_60px_-15px_rgba(139,92,246,0.3)]"
              >
                <Trophy className="w-6 h-6" />
                EXPLORAR RADAR
              </button>
              <Link href="/picks" className="w-full md:w-auto px-16 py-7 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-4 group backdrop-blur-md">
                <Zap className="w-6 h-6 text-primary group-hover:animate-pulse" />
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
              news.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden hover:border-primary/30 transition-all hover:-translate-y-2 block"
                >
                  {/* Article Image with Overlay */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[50%] group-hover:grayscale-0"
                      alt={item.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                    <div className="absolute top-4 right-6 bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {item.source}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-6">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">{item.title}</h3>

                    {/* AI Insight Card */}
                    <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-primary" />
                          <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">AI INSIGHT</span>
                        </div>
                        <div className={clsx(
                          "text-[9px] font-black uppercase tracking-widest",
                          item.impact > 80 ? "text-red-500" : item.impact > 50 ? "text-primary" : "text-gray-500"
                        )}>
                          Impacto: {item.impact}%
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-gray-400 leading-relaxed italic">
                        "{item.aiInsight}"
                      </p>
                      {/* Progress Bar */}
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            "h-full transition-all duration-1000",
                            item.impact > 80 ? "bg-red-500" : "bg-primary"
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
              <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
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
              <div key={i} className="group p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] hover:bg-primary/5 hover:border-primary/20 transition-all space-y-8">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.tag}</span>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{item.title}</h3>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed group-hover:text-gray-300 transition-colors">{item.desc}</p>
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
        <section className="bg-white/[0.02] rounded-[4rem] border border-white/5 p-12 md:p-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary/20"></div>
          <div className="grid md:grid-cols-2 gap-24 items-center relative z-10">
            <div className="space-y-10">
              <div className="h-0.5 w-24 bg-primary"></div>
              <h2 className="text-6xl md:text-8xl font-black italic uppercase leading-[0.9] tracking-tighter">
                LA <br />
                TERMINAL <br />
                <span className="text-primary italic">DETERMINISTA.</span>
              </h2>
              <p className="text-gray-400 text-xl md:text-2xl font-medium leading-relaxed max-w-xl">
                No creemos en la suerte, creemos en la arquitectura del dato. PickGenius es el puente entre el azar y el éxito medible.
              </p>
              <div className="flex gap-10">
                <div className="space-y-2">
                  <h4 className="text-5xl font-black text-white italic">8.5K</h4>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">EVENTOS CIERRE/MES</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-5xl font-black text-white italic">94%</h4>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">SINCRO-SCORE</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { label: "RADAR INFO", val: "ACTIVE" },
                { label: "QUOTAS SCAN", val: "SYNCHRONIZED" },
                { label: "IA-PICK ENGINE", val: "V4.2 STABLE" }
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between p-8 bg-black/60 rounded-[2rem] border border-white/5 group hover:border-primary/30 transition-all">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">{row.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-xs font-black text-white font-mono tracking-widest italic">{row.val}</span>
                  </div>
                </div>
              ))}
              <div className="bg-primary p-1 bg-gradient-to-r from-primary to-accent rounded-[2rem] overflow-hidden">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-black/80 p-8 rounded-[1.9rem] flex items-center justify-between hover:bg-black/60 transition-all"
                >
                  <span className="text-sm font-black text-white italic uppercase tracking-widest">ACTIVAR TERMINAL PRO</span>
                  <ArrowRight className="w-6 h-6 text-primary" />
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* --- FOOTER: THE LOG --- */}
      <footer className="border-t border-white/5 bg-[#080808] pt-32 pb-16 px-8 relative overflow-hidden">
        <div className="max-w-[100rem] mx-auto grid md:grid-cols-3 gap-24 relative z-10">
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-3 rounded-2xl">
                <Trophy className="w-8 h-8 text-black" />
              </div>
              <span className="text-4xl font-black tracking-tighter italic uppercase">PICK<span className="text-primary">GENIUS</span></span>
            </div>
            <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-sm italic">
              La ingeniería del éxito deportivo. Procesando el caos, entregando la señal.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-8">
              <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-white">HUB TERMINAL</h5>
              <ul className="space-y-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <li><Link href="/live" className="hover:text-primary transition-colors">Radar en Vivo</Link></li>
                <li><Link href="/picks" className="hover:text-primary transition-colors">Terminal IA</Link></li>
                <li><Link href="/bankroll" className="hover:text-primary transition-colors">Bankroll Manager</Link></li>
              </ul>
            </div>
            <div className="space-y-8">
              <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-white">LEGAL OPS</h5>
              <ul className="space-y-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <li><a href="#" className="hover:text-primary transition-colors">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Soporte</a></li>
              </ul>
            </div>
          </div>

          <div className="space-y-8 bg-white/[0.03] p-10 rounded-[3rem] border border-white/5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-yellow-500" />
              <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-white">RESPONSIBLE OPS</h5>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed tracking-widest">
              EL JUEGO ES PARA MAYORES DE 18 AÑOS. JUEGA CON RESPONSABILIDAD. NUESTRA IA ES UNA HERRAMIENTA DE SOPORTE, NO UN MÉTODO GARANTIZADO.
            </p>
          </div>
        </div>

        <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 max-w-[100rem] mx-auto">
          <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.5em]">© 2025 PICKGENIUS PRO CORP. ALL DATA SIGNALS ENCRYPTED.</p>
          <div className="flex gap-8 items-center">
            <span className="text-[9px] font-black text-gray-500 italic">V4.2.8_STABLE_BUILD</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">NET-LATENCY: 12MS</span>
            </div>
          </div>
        </div>

        {/* MASSIVE WATERMARK */}
        <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 text-[25rem] font-black text-white/[0.01] italic tracking-tighter select-none pointer-events-none whitespace-nowrap uppercase">
          DETERMINISM ARCHITECTURE
        </div>
      </footer>
    </div>
  );
}
