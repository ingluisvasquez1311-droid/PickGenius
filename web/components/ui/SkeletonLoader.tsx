export default function SkeletonLoader({ className }: { className?: string }) {
    return (
        <div className={`glass-card p-4 relative overflow-hidden bg-white/[0.02] border border-white/5 ${className}`}>
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

            <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="h-3 bg-white/10 rounded-full w-24"></div>
                <div className="h-3 bg-white/10 rounded-full w-12"></div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10"></div>
                        <div className="h-4 bg-white/10 rounded w-32"></div>
                    </div>
                    <div className="h-6 bg-white/10 rounded w-8"></div>
                </div>

                <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10"></div>
                        <div className="h-4 bg-white/10 rounded w-32"></div>
                    </div>
                    <div className="h-6 bg-white/10 rounded w-8"></div>
                </div>
            </div>

            <div className="mt-4 flex justify-between items-center pt-3 border-t border-white/5 relative z-10">
                <div className="h-2 bg-white/10 rounded w-16"></div>
                <div className="h-2 bg-white/10 rounded w-16"></div>
            </div>
        </div>
    );
}
