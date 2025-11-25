import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRate } from '@/lib/currency';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { withCors } from '@/lib/cors';

/**
 * GET /api/exchange-rate
 * Get current exchange rate between two currencies
 * Query params: from (default: EUR), to (default: USD)
 * 
 * Rate limit: 30 requests per minute per IP
 * CORS: Enabled for allowed origins
 */
async function handler(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const from = searchParams.get('from') || 'EUR';
        const to = searchParams.get('to') || 'USD';

        // Validate currency codes
        const validCurrencies = ['EUR', 'USD'];
        if (!validCurrencies.includes(from.toUpperCase()) || !validCurrencies.includes(to.toUpperCase())) {
            return NextResponse.json(
                { error: 'Invalid currency code. Supported: EUR, USD' },
                { status: 400 }
            );
        }

        // Get exchange rate
        const result = await getExchangeRate(from, to);

        return NextResponse.json({
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            rate: result.rate,
            source: result.source,
            cached: result.cached,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Error in exchange-rate API:', error);
        return NextResponse.json(
            { error: 'Failed to fetch exchange rate' },
            { status: 500 }
        );
    }
}

// Apply rate limiting and CORS
export const GET = withCors(withRateLimit(handler, RATE_LIMITS.EXCHANGE_RATE));
