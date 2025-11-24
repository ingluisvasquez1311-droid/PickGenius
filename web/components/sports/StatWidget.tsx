import React from 'react';

interface StatWidgetProps {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
    icon?: string;
}

export default function StatWidget({ label, value, trend, color = 'var(--primary)', icon }: StatWidgetProps) {
    return (
        <div className="glass-card p-4 flex items-center justify-between">
            <div>
                <div className="text-[var(--text-muted)] text-xs uppercase font-bold mb-1">{label}</div>
                <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            </div>
            {icon && <div className="text-3xl opacity-20">{icon}</div>}
            {trend && (
                <div className={`text-xs font-bold ${trend === 'up' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                    {trend === 'up' ? '▲' : '▼'}
                </div>
            )}
        </div>
    );
}
