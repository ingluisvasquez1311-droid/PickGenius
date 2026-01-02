"use client";

import { useState } from 'react';
import {
    X, Wallet, CreditCard, ChevronRight,
    ShieldCheck, Zap, Diamond, Globe,
    ArrowUpRight, ArrowDownLeft, Clock
} from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import clsx from 'clsx';

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
    const { balance, transactions, addCredits } = useCredits();
    const [step, setStep] = useState<'hub' | 'deposit'>('hub');
    const [selectedAmount, setSelectedAmount] = useState(1000);

    const depositOptions = [
        { amount: 500, price: "$4.99", bonus: "Starter" },
        { amount: 2000, price: "$14.99", bonus: "+15% Extra", popular: true },
        { amount: 5000, price: "$29.99", bonus: "+25% Extra" },
        { amount: 15000, price: "$79.99", bonus: "VIP Status" },
    ];

    const handleDeposit = () => {
        addCredits(selectedAmount, `Compra de Créditos (Mock Payment)`);
        setStep('hub');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(var(--primary-rgb),0.2)] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-glow-sm">
                            <Wallet className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Mi <span className="text-primary">Billetera</span></h2>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gestión de Créditos PickGenius</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {step === 'hub' ? (
                        <>
                            {/* Balance Card */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary to-purple-600 space-y-4 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest relative z-10">SALDO DISPONIBLE</p>
                                    <div className="flex items-end gap-3 relative z-10">
                                        <span className="text-6xl font-black italic tracking-tighter text-white">{balance.toLocaleString()}</span>
                                        <span className="text-xs font-black text-white/60 uppercase mb-2 tracking-widest">PGc</span>
                                    </div>
                                    <button
                                        onClick={() => setStep('deposit')}
                                        className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all relative z-10"
                                    >
                                        RECARGAR CRÉDITOS
                                    </button>
                                </div>

                                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Membresía</span>
                                            <span className="px-3 py-1 bg-primary/20 text-primary text-[8px] font-black rounded-full uppercase tracking-widest">Analista Pro</span>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-bold text-white italic">"Tu capital rinde mejor con análisis IA."</p>
                                            <p className="text-[9px] text-gray-600 leading-relaxed font-medium uppercase">Los créditos se utilizan para desbloquear predicciones del Oráculo y picks del Smart Parley.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 text-primary">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Transacción Segura</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    Actividad Reciente
                                </h3>
                                <div className="space-y-2">
                                    {transactions.length > 0 ? transactions.slice(0, 5).map((tx) => (
                                        <div key={tx.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/[0.04] transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                                    tx.amount > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                                )}>
                                                    {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white uppercase italic">{tx.description}</p>
                                                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{new Date(tx.timestamp).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={clsx(
                                                    "text-sm font-black italic",
                                                    tx.amount > 0 ? "text-green-500" : "text-red-500"
                                                )}>
                                                    {tx.amount > 0 ? '+' : ''}{tx.amount} PGc
                                                </p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-12 text-center bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">No hay transacciones registradas</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setStep('hub')} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                    <ChevronRight className="w-4 h-4 text-white rotate-180" />
                                </button>
                                <div>
                                    <h3 className="text-xl font-black italic uppercase text-white">Recargar Créditos</h3>
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic leading-tight">Selecciona un pack de créditos para continuar</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {depositOptions.map((opt) => (
                                    <div
                                        key={opt.amount}
                                        onClick={() => setSelectedAmount(opt.amount)}
                                        className={clsx(
                                            "p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden group",
                                            selectedAmount === opt.amount ? "bg-primary/10 border-primary" : "bg-white/5 border-white/5 hover:border-white/20"
                                        )}
                                    >
                                        {opt.popular && <div className="absolute top-0 right-0 p-8 bg-primary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>}
                                        <div className="flex justify-between items-start relative z-10">
                                            <span className="text-2xl font-black italic text-white">{opt.amount}</span>
                                            <span className="text-[8px] font-black text-primary uppercase bg-primary/20 px-2 py-1 rounded-md">{opt.bonus}</span>
                                        </div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">CRÉDITOS PG</p>
                                        <p className="text-lg font-black italic text-white">{opt.price}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-3xl space-y-4">
                                <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <CreditCard className="w-4 h-4 text-primary" />
                                    Método de Pago (Simulado)
                                </div>
                                <div className="flex gap-2">
                                    {['MASTERCARD', 'VISA', 'SOLANA', 'USDT'].map(m => (
                                        <div key={m} className="px-3 py-2 bg-black border border-white/10 rounded-lg text-[8px] font-black text-gray-600 hover:text-white transition-colors cursor-pointer">{m}</div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleDeposit}
                                className="w-full py-6 bg-white text-black text-xs font-black uppercase tracking-[0.4em] rounded-[1.5rem] hover:bg-primary transition-all shadow-glow"
                            >
                                CONFIRMAR RECARGA
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-black/40 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                            <Zap className="w-3 h-3 text-primary" /> Instantáneo
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                            <Diamond className="w-3 h-3 text-blue-500" /> Sin Comisión
                        </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-50">
                        <Globe className="w-4 h-4 text-gray-600" />
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic leading-tight">PickGenius Global Gateway v2.1</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
