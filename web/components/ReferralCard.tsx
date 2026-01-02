"use client";

import { useRef } from 'react';
import { Share2, Copy, Check, Download, QrCode } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import clsx from 'clsx';

export default function ReferralCard() {
    const { user } = useUser();
    const { referralData, getReferralStats, getShareUrl } = useReferrals();
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);

    const stats = getReferralStats();
    const shareUrl = getShareUrl();

    const copyToClipboard = async () => {
        if (!referralData) return;

        const text = `🎯 Únete a PickGenius Pro con mi código: ${referralData.code}\n\n🔥 Predicciones IA + Bankroll Tracker + SureBets\n\n${shareUrl}`;

        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareToSocial = (platform: 'twitter' | 'whatsapp' | 'telegram') => {
        const text = `🎯 Únete a PickGenius Pro y mejora tus apuestas con IA. Usa mi código: ${referralData?.code}`;

        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text + '\n' + shareUrl)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`
        };

        window.open(urls[platform], '_blank');
    };

    const downloadQR = () => {
        // Generate QR code using a public API
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareUrl)}`;
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = `pickgenius-referral-${referralData?.code}.png`;
        link.click();
    };

    if (!referralData) return null;

    return (
        <div className="glass-card p-1 rounded-[3rem] border-white/5">
            <div className="bg-[#050505]/90 backdrop-blur-3xl rounded-[2.8rem] p-8 md:p-10 space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Share2 className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                                Invita <span className="text-primary">Amigos</span>
                            </h2>
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            Gana recompensas por cada referido
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Amigos Invitados</p>
                        <p className="text-4xl font-black italic text-primary">{stats.count}</p>
                    </div>
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Créditos Ganados</p>
                        <p className="text-4xl font-black italic text-green-500">+{stats.count * 500}</p>
                    </div>
                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Siguiente Premio</p>
                        <p className="text-sm font-black text-primary uppercase">{stats.nextReward}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Progreso a VIP</p>
                        <p className="text-sm font-black text-white">{stats.progress.toFixed(0)}%</p>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${stats.progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-gray-600 uppercase">
                        <span>0 Refs</span>
                        <span>5 Refs (VIP 30d)</span>
                        <span>10 Refs (VIP ∞)</span>
                    </div>
                </div>

                {/* Referral Code Display */}
                <div className="p-8 bg-gradient-to-br from-primary/10 to-purple-600/10 border border-primary/20 rounded-[2rem] space-y-6">
                    <div className="text-center space-y-4">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tu Código de Referido</p>
                        <div className="inline-flex items-center gap-4 px-8 py-5 bg-black/40 border border-white/10 rounded-2xl">
                            <span className="text-4xl font-black italic tracking-wider text-white font-mono">
                                {referralData.code}
                            </span>
                            <button
                                onClick={copyToClipboard}
                                className="p-3 bg-primary/20 hover:bg-primary/30 rounded-xl transition-all"
                            >
                                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-primary" />}
                            </button>
                        </div>
                    </div>

                    {/* Share URL */}
                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest text-center">Link de Invitación</p>
                        <div className="flex items-center gap-3 p-4 bg-black/40 border border-white/5 rounded-xl">
                            <input
                                readOnly
                                value={shareUrl}
                                className="flex-1 bg-transparent text-xs font-mono text-gray-400 outline-none"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase text-white transition-all"
                            >
                                Copiar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Share Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => shareToSocial('twitter')}
                        className="p-5 bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/20 rounded-2xl transition-all space-y-2"
                    >
                        <div className="w-8 h-8 rounded-xl bg-[#1DA1F2]/20 flex items-center justify-center mx-auto">
                            <Share2 className="w-4 h-4 text-[#1DA1F2]" />
                        </div>
                        <p className="text-[10px] font-black text-white uppercase text-center">Twitter</p>
                    </button>
                    <button
                        onClick={() => shareToSocial('whatsapp')}
                        className="p-5 bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 rounded-2xl transition-all space-y-2"
                    >
                        <div className="w-8 h-8 rounded-xl bg-[#25D366]/20 flex items-center justify-center mx-auto">
                            <Share2 className="w-4 h-4 text-[#25D366]" />
                        </div>
                        <p className="text-[10px] font-black text-white uppercase text-center">WhatsApp</p>
                    </button>
                    <button
                        onClick={() => shareToSocial('telegram')}
                        className="p-5 bg-[#0088cc]/10 border border-[#0088cc]/30 hover:bg-[#0088cc]/20 rounded-2xl transition-all space-y-2"
                    >
                        <div className="w-8 h-8 rounded-xl bg-[#0088cc]/20 flex items-center justify-center mx-auto">
                            <Share2 className="w-4 h-4 text-[#0088cc]" />
                        </div>
                        <p className="text-[10px] font-black text-white uppercase text-center">Telegram</p>
                    </button>
                    <button
                        onClick={() => setShowQR(!showQR)}
                        className="p-5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl transition-all space-y-2"
                    >
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center mx-auto">
                            <QrCode className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-[10px] font-black text-white uppercase text-center">QR Code</p>
                    </button>
                </div>

                {/* QR Code Panel */}
                {showQR && (
                    <div className="p-8 bg-white rounded-[2rem] animate-in slide-in-from-bottom-4 duration-300">
                        <div className="text-center space-y-6">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`}
                                alt="QR Code"
                                className="mx-auto rounded-2xl"
                            />
                            <button
                                onClick={downloadQR}
                                className="px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 mx-auto hover:scale-105 transition-all"
                            >
                                <Download className="w-4 h-4" />
                                Descargar QR
                            </button>
                        </div>
                    </div>
                )}

                {/* Rewards Info */}
                <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl space-y-4">
                    <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest text-center">🎁 Sistema de Recompensas</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                            <p className="text-2xl font-black italic text-white">1+ Refs</p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase">+500 PGc c/u</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-black italic text-primary">5 Refs</p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase">VIP 30 Días</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-black italic text-green-500">10 Refs</p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase">VIP Para Siempre</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
