/**
 * Rate Limiting Utilities
 * Protects public APIs from abuse using in-memory rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (works for single instance, good for development)
// For production with multiple instances, consider using Upstash Redis or Vercel KV

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
    /**
     * Maximum number of requests allowed in the time window
     */
    maxRequests: number;

    /**
     * Time window in seconds
     */
    windowSeconds: number;

    /**
     * Custom identifier function (default: IP address)
     */
    identifier?: (req: NextRequest) => string;
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
    // Public APIs - 100 requests per 15 minutes per IP
    PUBLIC: {
        maxRequests: 100,
        windowSeconds: 15 * 60,
    },

    // Blog API - 200 requests per 15 minutes per IP (more generous for content)
    BLOG: {
        maxRequests: 200,
        windowSeconds: 15 * 60,
    },

    // Exchange rate API - 30 requests per minute per IP
    EXCHANGE_RATE: {
        maxRequests: 30,
        windowSeconds: 60,
    },

    // Strict limit for sensitive endpoints - 10 requests per minute
    STRICT: {
        maxRequests: 10,
        windowSeconds: 60,
    },
} as const;

/**
 * Get client identifier (IP address)
 */
function getClientIdentifier(req: NextRequest): string {
    // Try to get real IP from headers (for proxies/load balancers)
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    // Fallback to a generic identifier
    return 'unknown';
}

// Cache for blocked IPs
let blockedIpsCache: Set<string> = new Set();
let lastBlockedIpsUpdate = 0;

async function updateBlockedIpsCache() {
    const now = Date.now();
    // Refresh cache every 60 seconds
    if (now - lastBlockedIpsUpdate > 60 * 1000) {
        try {
            const { prisma } = await import('@/lib/prisma');
            const blocked = await prisma.blockedIp.findMany({
                select: { ip: true }
            });
            blockedIpsCache = new Set(blocked.map((b: { ip: string }) => b.ip));
            lastBlockedIpsUpdate = now;
        } catch (e) {
            console.error("Failed to update blocked IPs cache", e);
        }
    }
}

/**
 * Check if request should be rate limited
 * Returns null if allowed, or NextResponse with 429 status if rate limited
 */
export async function checkRateLimit(
    req: NextRequest,
    config: RateLimitConfig
): Promise<NextResponse | null> {
    const identifier = config.identifier
        ? config.identifier(req)
        : getClientIdentifier(req);

    // Check blocked IPs (cached)
    await updateBlockedIpsCache();
    if (blockedIpsCache.has(identifier)) {
        return NextResponse.json(
            {
                error: 'Access denied',
                message: 'Your IP address has been blocked due to suspicious activity.',
            },
            { status: 403 }
        );
    }

    const key = `${req.nextUrl.pathname}:${identifier}`;
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;

    let entry = rateLimitStore.get(key);

    // Create new entry if doesn't exist or expired
    if (!entry || now > entry.resetTime) {
        entry = {
            count: 0,
            resetTime: now + windowMs,
        };
        rateLimitStore.set(key, entry);
    }

    // Increment request count
    entry.count++;

    // Check if rate limit exceeded
    if (entry.count > config.maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

        // Log security event
        try {
            // Dynamic import to avoid circular dependencies if any
            const { prisma } = await import('@/lib/prisma');
            await prisma.securityLog.create({
                data: {
                    type: 'RATE_LIMIT',
                    message: `Rate limit exceeded for ${req.nextUrl.pathname}`,
                    ip: identifier,
                    endpoint: req.nextUrl.pathname,
                    metadata: {
                        limit: config.maxRequests,
                        window: config.windowSeconds,
                        retryAfter
                    }
                }
            });
        } catch (error) {
            console.error('Failed to log security event:', error);
        }

        return NextResponse.json(
            {
                error: 'Rate limit exceeded',
                message: `Too many requests. Please try again in ${retryAfter} seconds.`,
                retryAfter,
            },
            {
                status: 429,
                headers: {
                    'Retry-After': retryAfter.toString(),
                    'X-RateLimit-Limit': config.maxRequests.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': entry.resetTime.toString(),
                },
            }
        );
    }

    // Request allowed - return null
    return null;
}

/**
 * Middleware wrapper for rate limiting
 */
export function withRateLimit(
    handler: (req: NextRequest) => Promise<NextResponse>,
    config: RateLimitConfig
) {
    return async (req: NextRequest): Promise<NextResponse> => {
        // Check rate limit
        const rateLimitResponse = await checkRateLimit(req, config);

        if (rateLimitResponse) {
            return rateLimitResponse;
        }

        // Rate limit passed, call handler
        const response = await handler(req);

        // Add rate limit headers to successful responses
        const identifier = config.identifier
            ? config.identifier(req)
            : getClientIdentifier(req);
        const key = `${req.nextUrl.pathname}:${identifier}`;
        const entry = rateLimitStore.get(key);

        if (entry) {
            const remaining = Math.max(0, config.maxRequests - entry.count);
            response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
            response.headers.set('X-RateLimit-Remaining', remaining.toString());
            response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());
        }

        return response;
    };
}
