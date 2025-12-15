export default function SkeletonLoader() {
    return (
        <div className="glass-card p-4 animate-pulse h-full w-full bg-gray-800/50 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <div className="h-4 bg-gray-700 rounded w-24"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
            </div>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-700 rounded w-32"></div>
                    <div className="h-6 bg-gray-700 rounded w-8"></div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-700 rounded w-32"></div>
                    <div className="h-6 bg-gray-700 rounded w-8"></div>
                </div>
            </div>
            <div className="mt-4 flex justify-center">
                <div className="h-3 bg-gray-700 rounded w-20"></div>
            </div>
        </div>
    );
}
