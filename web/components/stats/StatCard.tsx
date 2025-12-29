import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: 'emerald' | 'blue' | 'purple' | 'red' | 'yellow';
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    color = 'emerald'
}: StatCardProps) {
    const colorClasses = {
        emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        red: 'bg-red-500/10 text-red-500 border-red-500/20',
        yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    };

    return (
        <div className="glass-card p-6 border border-white/5 bg-white/[0.02] rounded-3xl relative overflow-hidden group hover:bg-white/[0.04] transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${colorClasses[color]} border transition-transform group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trendUp ? '↑' : '↓'} {trend}
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                    {title}
                </h3>
                <div className="text-3xl font-black italic tracking-tighter text-white">
                    {value}
                </div>
            </div>

            {/* Background Glow */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-[50px] opacity-20 transition-opacity group-hover:opacity-40 pointer-events-none bg-${color}-500`} />
        </div>
    );
}
