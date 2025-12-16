'use client';

interface TopPlayer {
    name: string;
    position: string;
    rating: number;
    points?: number;
    rebounds?: number;
    assists?: number;
}

interface TopPlayersCardProps {
    title: string;
    players: TopPlayer[];
    teamColor?: string;
}

export default function TopPlayersCardBasketball({ title, players, teamColor = 'purple' }: TopPlayersCardProps) {
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
                {topPlayers.map((player, index) => (
                    <div
                        key={index}
                        className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                    >
                        {/* Rank + Name */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-gray-500 font-bold text-sm w-4">
                                {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-white font-semibold text-sm truncate">
                                    {player.name}
                                </p>
                                <p className="text-gray-500 text-xs uppercase">
                                    {player.position}
                                </p>
                            </div>
                        </div>

                        {/* Stats (PTS/REB/AST) */}
                        <div className="flex items-center gap-2 text-xs text-gray-400 mr-3">
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

                        {/* Rating Badge */}
                        <div
                            className={`
                                ${index === 0 ? 'bg-purple-600' : 'bg-gray-700'}
                                text-white font-bold text-sm px-3 py-1.5 rounded-full
                                min-w-[3rem] text-center
                            `}
                        >
                            {(player.rating || player.points || 0).toFixed(1)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-950/50 text-center">
                <p className="text-gray-600 text-xs">
                    Actualización en vivo
                </p>
            </div>
        </div>
    );
}
