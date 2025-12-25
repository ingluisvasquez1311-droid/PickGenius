import { groqService } from '@/lib/services/groqService';
// import { scraperService } from '@/lib/services/scraperService'; // No longer used in local architecture
import { globalBudget, globalAnalytics } from '@/lib/utils/api-manager';

export const dynamic = 'force-dynamic'; // Asegurar que no se cachee estáticamente

export default async function SystemStatusPage() {
    // Obtener stats actuales
    const groqStats = groqService.getStats();
    // const scraperStats = scraperService.getStats(); // Disabled for local architecture
    const budgetReport = globalBudget.getReport();
    const analytics = globalAnalytics.getDashboard();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            System Health Monitor
                        </h1>
                        <p className="text-slate-400 mt-1">Real-time infrastructure status</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg border border-slate-800">
                        <div className={`w-3 h-3 rounded-full ${analytics.errorRate === '0%' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium">System Online</span>
                    </div>
                </div>

                {/* Budget Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card
                        title="Monthly Budget"
                        icon="💰"
                        className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-900/50"
                    >
                        <div className="mt-4 space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-4xl font-bold text-white">${budgetReport.spent}</span>
                                <span className="text-slate-400 mb-1">of ${budgetReport.budget} limit</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${parseFloat(budgetReport.percentage) > 80 ? 'bg-red-500' : 'bg-emerald-500'
                                        }`}
                                    style={{ width: budgetReport.percentage }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 text-right">{budgetReport.percentage} used</p>
                        </div>
                    </Card>

                    <Card title="Global Analytics" icon="📊">
                        <div className="space-y-4 mt-2">
                            <Metric label="Total Requests" value={analytics.totalRequests} />
                            <Metric label="Error Rate" value={analytics.errorRate} color={analytics.errorRate === '0%' ? 'text-emerald-400' : 'text-red-400'} />
                            <Metric label="Avg Latency" value={analytics.avgLatency} />
                        </div>
                    </Card>
                </div>

                {/* Services Grid */}
                <h2 className="text-xl font-semibold text-slate-300 mt-8">Active Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ScraperAPI Stats - Disabled for local architecture */}
                    {/* <ServiceCard
                        name="ScraperAPI (Sofascore)"
                        status={scraperStats.circuit}
                        stats={scraperStats.rotator}
                        apiName="ScraperAPI"
                    /> */}

                    {/* Groq Stats */}
                    <ServiceCard
                        name="Groq AI Engine"
                        status={groqStats.circuit}
                        stats={groqStats.rotator}
                        apiName="Groq"
                    />
                </div>

            </div>
        </div>
    );
}

// Sub-components for clean code
interface CardProps {
    title: string;
    icon: string;
    children: React.ReactNode;
    className?: string;
}

function Card({ title, icon, children, className = '' }: CardProps) {
    return (
        <div className={`p-6 rounded-xl border border-slate-800 bg-slate-900 ${className}`}>
            <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{icon}</span>
                <h3 className="font-semibold text-slate-300">{title}</h3>
            </div>
            {children}
        </div>
    );
}

interface MetricProps {
    label: string;
    value: string | number;
    color?: string;
}

function Metric({ label, value, color = 'text-white' }: MetricProps) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
            <span className="text-slate-500 text-sm">{label}</span>
            <span className={`font-mono font-medium ${color}`}>{value}</span>
        </div>
    );
}

interface ServiceCardProps {
    name: string;
    status: string;
    stats: {
        activeKeys?: number;
        blockedKeys?: number;
        active?: number;
        blocked?: number;
        filter?: (fn: (k: { isBlocked: boolean }) => boolean) => any[];
    };
    apiName: string;
}

function ServiceCard({ name, status, stats, apiName }: ServiceCardProps) {
    const isHealthy = status === 'CLOSED';
    const activeKeys = stats.activeKeys || stats.active || (typeof stats.filter === 'function' ? stats.filter((k: { isBlocked: boolean }) => !k.isBlocked).length : 0);
    const blockedKeys = stats.blockedKeys || stats.blocked || (typeof stats.filter === 'function' ? stats.filter((k: { isBlocked: boolean }) => k.isBlocked).length : 0);

    return (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-bold text-lg text-white">{name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{apiName} Provider</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isHealthy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {isHealthy ? 'OPERATIONAL' : 'DEGRADED'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-emerald-400">{activeKeys}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Active Keys</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg text-center">
                    <div className={`text-2xl font-bold ${blockedKeys > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                        {blockedKeys}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Blocked Keys</div>
                </div>
            </div>
        </div>
    );
}
