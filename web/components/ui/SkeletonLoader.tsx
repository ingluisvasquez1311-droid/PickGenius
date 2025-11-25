export default function SkeletonLoader() {
    return (
        <div className="glass-card p-4 animate-pulse">
            <div className="flex justify-between items-center mb-4">
                <div className="h-6 bg-[rgba(255,255,255,0.1)] rounded w-32"></div>
                <div className="h-6 bg-[rgba(255,255,255,0.1)] rounded w-16"></div>
            </div>
            <div className="space-y-3">
                <div className="h-12 bg-[rgba(255,255,255,0.1)] rounded"></div>
                <div className="h-12 bg-[rgba(255,255,255,0.1)] rounded"></div>
                <div className="h-12 bg-[rgba(255,255,255,0.1)] rounded"></div>
            </div>
        </div>
    );
}
