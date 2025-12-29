import React from 'react';

interface AttributeGraphProps {
    homeAttributes: {
        attack: number;
        defense: number;
        form: number;
        h2h: number;
        motivation: number;
    };
    awayAttributes: {
        attack: number;
        defense: number;
        form: number;
        h2h: number;
        motivation: number;
    };
    homeColor?: string;
    awayColor?: string;
}

export default function AttributeGraph({
    homeAttributes,
    awayAttributes,
    homeColor = 'var(--primary)',
    awayColor = 'var(--secondary)'
}: AttributeGraphProps) {
    const size = 200;
    const center = size / 2;
    const radius = 80;
    const axes = ['Ataque', 'Defensa', 'Forma', 'H2H', 'Motivación'];

    // Helper to calculate coordinates
    const getCoordinates = (value: number, index: number, total: number) => {
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        const r = (value / 100) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return { x, y };
    };

    // Generate polygon points
    const getPoints = (attributes: typeof homeAttributes) => {
        const values = [
            attributes.attack,
            attributes.defense,
            attributes.form,
            attributes.h2h,
            attributes.motivation
        ];
        return values.map((val, i) => {
            const { x, y } = getCoordinates(val, i, axes.length);
            return `${x},${y}`;
        }).join(' ');
    };

    const homePoints = getPoints(homeAttributes);
    const awayPoints = getPoints(awayAttributes);

    return (
        <div className="flex flex-col items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                {/* Background Grid (Concentric Pentagons) */}
                {[20, 40, 60, 80, 100].map((level, i) => {
                    const points = axes.map((_, idx) => {
                        const { x, y } = getCoordinates(level, idx, axes.length);
                        return `${x},${y}`;
                    }).join(' ');
                    return (
                        <polygon
                            key={i}
                            points={points}
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Axes Lines */}
                {axes.map((axis, i) => {
                    const { x, y } = getCoordinates(100, i, axes.length);
                    return (
                        <g key={i}>
                            <line
                                x1={center}
                                y1={center}
                                x2={x}
                                y2={y}
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="1"
                            />
                            {/* Labels */}
                            <text
                                x={x}
                                y={y}
                                dx={x > center ? 10 : x < center ? -10 : 0}
                                dy={y > center ? 15 : y < center ? -10 : 5}
                                textAnchor="middle"
                                fill="var(--text-muted)"
                                fontSize="10"
                                fontWeight="bold"
                            >
                                {axis}
                            </text>
                        </g>
                    );
                })}

                {/* Home Polygon */}
                <polygon
                    points={homePoints}
                    fill={homeColor}
                    fillOpacity="0.3"
                    stroke={homeColor}
                    strokeWidth="2"
                />

                {/* Away Polygon */}
                <polygon
                    points={awayPoints}
                    fill={awayColor}
                    fillOpacity="0.3"
                    stroke={awayColor}
                    strokeWidth="2"
                />
            </svg>
        </div>
    );
}
