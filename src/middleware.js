import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Allow access to root landing page (public)
    if (pathname === '/') {
        return NextResponse.next();
    }

    // Allow access to login page, signup, and public API routes
    if (
        pathname.startsWith('/login') || 
        pathname.startsWith('/api/auth/signup') ||
        pathname.startsWith('/api/auth/[...nextauth]')
    ) {
        return NextResponse.next();
    }

    // Allow all other API routes (they handle auth internally)
    if (pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // Allow access to static files
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/assets')
    ) {
        return NextResponse.next();
    }

    try {
        // Check authentication for all other routes
        const session = await auth();

        if (!session) {
            // Redirect to login if not authenticated
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    } catch (error) {
        // If auth check fails, redirect to login
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - assets (public assets)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
    ],
};
