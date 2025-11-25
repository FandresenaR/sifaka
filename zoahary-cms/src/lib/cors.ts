/**
 * CORS Configuration
 * Controls which domains can access the public APIs
 */

import { NextResponse, NextRequest } from 'next/server';

/**
 * Allowed origins for CORS
 * Add your production domain here
 */
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://zoahary-cms.vercel.app',
    'https://zoahary-baobab.mg',
    'https://www.zoahary-baobab.mg',
    // Add your production domains here
];

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
    if (!origin) return false;

    // Allow all localhost origins in development
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
        return true;
    }

    return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
    response: NextResponse,
    origin: string | null
): NextResponse {
    if (origin && isOriginAllowed(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, DELETE, OPTIONS'
        );
        response.headers.set(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, X-Requested-With'
        );
        response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    }

    return response;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(origin: string | null): NextResponse | null {
    if (!origin || !isOriginAllowed(origin)) {
        return NextResponse.json(
            { error: 'Origin not allowed' },
            { status: 403 }
        );
    }

    const response = new NextResponse(null, { status: 204 });
    return addCorsHeaders(response, origin);
}

/**
 * Middleware wrapper for CORS
 */
export function withCors(
    handler: (req: NextRequest) => Promise<NextResponse>
) {
    return async (req: NextRequest): Promise<NextResponse> => {
        const origin = req.headers.get('origin');

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            const preflightResponse = handleCorsPreflightRequest(origin);
            if (preflightResponse) {
                return preflightResponse;
            }
        }

        // Call the handler
        const response = await handler(req);

        // Add CORS headers to response
        return addCorsHeaders(response, origin);
    };
}
