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

        // Role-based access control
        const userRole = session?.user?.role;

        // If user is a client trying to access admin routes
        if (userRole === 'client' && pathname.startsWith('/admin')) {
            const dashboardUrl = new URL('/client/dashboard', request.url);
            return NextResponse.redirect(dashboardUrl);
        }

        // If user is an admin trying to access client routes
        if (userRole === 'admin' && pathname.startsWith('/client')) {
            const adminUrl = new URL('/admin', request.url);
            return NextResponse.redirect(adminUrl);
        }

        // If user is a client, ensure they can only access client routes
        if (userRole === 'client' && !pathname.startsWith('/client') && pathname !== '/') {
            const dashboardUrl = new URL('/client/dashboard', request.url);
            return NextResponse.redirect(dashboardUrl);
        }

        // If user is an admin, ensure they can only access admin routes
        if (userRole === 'admin' && !pathname.startsWith('/admin') && pathname !== '/') {
            const adminUrl = new URL('/admin', request.url);
            return NextResponse.redirect(adminUrl);
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
