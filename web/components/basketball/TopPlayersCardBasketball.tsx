'use client';

import Image from 'next/image';

interface TopPlayer {
    name: string;
    position: string;
    rating: number;
    points?: number;
    rebounds?: number;
    assists?: number;
    id?: number;
    statistics?: any; // Full stats object
}

interface TopPlayersCardProps {
    title: string;
    players: TopPlayer[];
    teamColor?: string;
    onPlayerClick?: (player: TopPlayer) => void;
}

export default function TopPlayersCardBasketball({ title, players, teamColor = 'purple', onPlayerClick }: TopPlayersCardProps) {
    // Sort by rating/points and take top 5
    const topPlayers = [...players]
        .sort((a, b) => (b.rating || b.points || 0) - (a.rating || a.points || 0))
        .slice(0, 5);

    const getColorClasses = () => {
        switch (teamColor) {
            case 'purple':
                return 'border-purple-500 bg-purple-500/10';
            case 'orange':
                return 'border-orange-500 bg-orange-500/10';
            default:
                return 'border-purple-500 bg-purple-500/10';
        }
    };

    const getBorderColor = () => {
        switch (teamColor) {
            case 'purple':
                return 'border-t-purple-500';
            case 'orange':
                return 'border-t-orange-500';
            default:
                return 'border-t-purple-500';
        }
    };

    return (
        <div className={`bg-gray-900 rounded-lg border ${getColorClasses()} overflow-hidden`}>
            {/* Header */}
            <div className={`border-t-2 ${getBorderColor()} px-4 py-3`}>
                <h3 className="text-white font-bold text-sm uppercase tracking-wide">
                    {title}
                </h3>
            </div>

            {/* Players List */}
            <div className="divide-y divide-gray-800">
                {topPlayers.map((player, index) => {
                    const imageUrl = player.id
                        ? `https://images.weserv.nl/?url=${encodeURIComponent(`https://api.sofascore.app/api/v1/player/${player.id}/image`)}`
                        : null;

                    return (
                        <div
                            key={index}
                            className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/80 transition-colors cursor-pointer group"
                            onClick={() => onPlayerClick && onPlayerClick(player)}
                        >
                            {/* Rank + Image + Name */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-gray-500 font-bold text-xs w-3">
                                    {index + 1}
                                </span>

                                {/* Player Image */}
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-gray-700 group-hover:border-white/20 transition-colors shrink-0">
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt={player.name}
                                            fill
                                            className="object-cover"
                                            unoptimized // Sofascore images might need this if domains config is tricky
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400 text-xs font-bold">
                                            {player.name.substring(0, 1)}
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-white font-semibold text-sm truncate group-hover:text-purple-400 transition-colors">
                                        {player.name}
                                    </p>
                                    <p className="text-gray-500 text-[10px] uppercase">
                                        {player.position}
                                    </p>
                                </div>
                            </div>

                            {/* Stats (PTS/REB/AST) */}
                            <div className="flex items-center gap-2 text-xs text-gray-400 mr-3 hidden sm:flex">
                                {player.points !== undefined && (
                                    <span>{player.points} PTS</span>
                                )}
                                {player.rebounds !== undefined && (
                                    <span>{player.rebounds} REB</span>
                                )}
                                {player.assists !== undefined && (
                                    <span>{player.assists} AST</span>
                                )}
                            </div>

                            {/* Mobile Stats (Compact) */}
                            <div className="flex flex-col items-end text-[10px] text-gray-400 mr-2 sm:hidden leading-tight">
                                {player.points !== undefined && (
                                    <span>{player.points} PTS</span>
                                )}
                            </div>

                            {/* Rating Badge */}
                            <div
                                className={`
                                ${index === 0 ? 'bg-purple-600' : 'bg-gray-700'}
                                text-white font-bold text-xs px-2 py-1 rounded
                                min-w-[2.5rem] text-center
                            `}
                            >
                                {(player.rating || player.points || 0).toFixed(1)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-950/50 text-center flex justify-between items-center">
                <p className="text-gray-600 text-[10px]">
                    Toca para ver detalles
                </p>
                <p className="text-gray-600 text-[10px]">
                    Actualización en vivo
                </p>
            </div>
        </div>
    );
}
