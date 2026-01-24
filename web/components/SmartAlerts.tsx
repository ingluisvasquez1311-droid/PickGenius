"use client";

import { useState } from 'react';
import { Bell, BellOff, Check, Plus, Trash2, Zap } from 'lucide-react';
import { useUser } from '@/components/ClerkSafeProvider';
import clsx from 'clsx';

interface Alert {
    id: string;
    sport: string;
    team: string;
    market: string;
    condition: 'gt' | 'lt';
    threshold: number;
    active: boolean;
}

export default function SmartAlerts() {
    const { user } = useUser();
    const [alerts, setAlerts] = useState<Alert[]>([
        { id: '1', sport: 'NBA', team: 'Lakers', market: 'Moneyline', condition: 'gt', threshold: 2.10, active: true },
        { id: '2', sport: 'Fútbol', team: 'Real Madrid', market: 'Over 2.5 Goles', condition: 'gt', threshold: 1.85, active: true },
    ]);
    const [newAlert, setNewAlert] = useState<Partial<Alert>>({ sport: 'NBA', condition: 'gt' });
    const [showForm, setShowForm] = useState(false);

    const toggleAlert = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
    };

    const deleteAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const addAlert = () => {
        if (!newAlert.team || !newAlert.market || !newAlert.threshold) return;
        setAlerts(prev => [...prev, {
            id: Date.now().toString(),
            sport: newAlert.sport || 'NBA',
            team: newAlert.team!,
            market: newAlert.market!,
            condition: newAlert.condition as 'gt' | 'lt',
            threshold: Number(newAlert.threshold),
            active: true
        }]);
        setNewAlert({ sport: 'NBA', condition: 'gt' });
        setShowForm(false);
    };

    return (
        <div className="glass-card p-1 rounded-[3rem] border-white/5">
            <div className="bg-[#050505]/90 backdrop-blur-3xl rounded-[2.8rem] p-8 md:p-10 space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                                <Bell className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                Smart <span className="text-primary">Alerts</span>
                            </h2>
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            Monitoreo de cuotas 24/7 • Notificaciones Instantáneas
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Nueva Alerta
                    </button>
                </div>

                {/* Add Alert Form */}
                {showForm && (
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 animate-in slide-in-from-top-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <select
                                className="bg-black border border-white/10 rounded-lg p-3 text-xs font-bold text-gray-300 outline-none focus:border-primary"
                                value={newAlert.sport}
                                onChange={e => setNewAlert({ ...newAlert, sport: e.target.value })}
                            >
                                <option value="NBA">NBA</option>
                                <option value="Fútbol">Fútbol</option>
                                <option value="NFL">NFL</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Equipo (ej. Lakers)"
                                className="bg-black border border-white/10 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-primary placeholder:text-gray-600"
                                value={newAlert.team || ''}
                                onChange={e => setNewAlert({ ...newAlert, team: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Mercado (ej. Ganador)"
                                className="bg-black border border-white/10 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-primary placeholder:text-gray-600"
                                value={newAlert.market || ''}
                                onChange={e => setNewAlert({ ...newAlert, market: e.target.value })}
                            />
                            <div className="flex items-center gap-2">
                                <select
                                    className="bg-black border border-white/10 rounded-lg p-3 text-xs font-bold text-gray-300 outline-none focus:border-primary"
                                    value={newAlert.condition}
                                    onChange={e => setNewAlert({ ...newAlert, condition: e.target.value as any })}
                                >
                                    <option value="gt">Mayor que ( &gt; )</option>
                                    <option value="lt">Menor que ( &lt; )</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Cuota"
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-primary placeholder:text-gray-600"
                                    value={newAlert.threshold || ''}
                                    onChange={e => setNewAlert({ ...newAlert, threshold: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <button
                            onClick={addAlert}
                            className="w-full py-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Crear Monitor
                        </button>
                    </div>
                )}

                {/* Alerts List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {alerts.map((alert) => (
                        <div key={alert.id} className={clsx("p-5 rounded-2xl border transition-all flex items-center justify-between group", alert.active ? "bg-white/[0.03] border-white/10 hover:border-primary/30" : "bg-black/40 border-white/5 opacity-60")}>
                            <div className="flex items-center gap-4">
                                <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center transition-colors", alert.active ? "bg-primary/10 text-primary" : "bg-white/5 text-gray-600")}>
                                    {alert.active ? <Zap className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">{alert.sport}</span>
                                        <h4 className="text-sm font-black italic text-white uppercase truncate max-w-[100px] md:max-w-none">{alert.team}</h4>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                                        {alert.market} {alert.condition === 'gt' ? '>' : '<'} <span className="text-white bg-white/10 px-1 rounded">{alert.threshold.toFixed(2)}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => toggleAlert(alert.id)}
                                    className={clsx("w-8 h-8 rounded-lg flex items-center justify-center border transition-all", alert.active ? "bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20" : "bg-white/5 border-white/10 text-gray-500 hover:text-white")}
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => deleteAlert(alert.id)}
                                    className="w-8 h-8 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500/50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 flex items-center justify-center transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {alerts.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                            <BellOff className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">No tienes alertas activas</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
