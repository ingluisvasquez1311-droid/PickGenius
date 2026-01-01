import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
    "/",
    "/api/(.*)",
    "/football(.*)",
    "/basketball(.*)",
    "/props(.*)",
    "/match/(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
]);

export default function middleware(request: NextRequest, event: any) {
    // Safety check: Bypass Clerk logic if the secret key is missing in production
    // This prevents MIDDLEWARE_INVOCATION_FAILED on Vercel
    const secretKey = process.env.CLERK_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (process.env.NODE_ENV === 'production' && (!secretKey || !publishableKey || publishableKey.includes('include'))) {
        return NextResponse.next();
    }

    try {
        return clerkMiddleware(async (auth: any, req: NextRequest) => {
            if (!isPublicRoute(req)) {
                await auth.protect();
            }
        })(request, event);
    } catch (e) {
        console.error("Clerk Middleware Error:", e);
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
