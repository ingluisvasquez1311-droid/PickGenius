import React from "react";
import { cn } from "@/lib/utils"; // Assuming cn is tailwind-merge + clsx

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-white/5", className)}
            {...props}
        />
    );
}

export { Skeleton };

export function MatchCardSkeleton() {
    return (
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-12 rounded-xl" />
                <div className="flex items-center gap-3 flex-1 justify-end">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2">
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
            </div>
        </div>
    );
}

export function PropCardSkeleton() {
    return (
        <div className="bg-white/5 border border-white/5 rounded-[3rem] p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-3xl" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 rounded-2xl" />
                <Skeleton className="h-12 rounded-2xl" />
            </div>
            <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
    );
}

export function AnalysisSkeleton() {
    return (
        <div className="bg-[#050505] border border-white/5 rounded-[3xl] p-8 space-y-6">
            <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[85%]" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
            </div>
        </div>
    );
}

export function SocialFeedSkeleton() {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-2 w-10" />
                        </div>
                        <Skeleton className="h-16 w-full rounded-2xl rounded-tl-none" />
                    </div>
                </div>
            ))}
        </div>
    );
}
