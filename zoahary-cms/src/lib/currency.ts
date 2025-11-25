/**
 * Currency Exchange Utilities
 * Manages EUR/USD exchange rates with caching and external API integration
 */

import { prisma } from './prisma';

// In-memory cache for exchange rates
interface CachedRate {
    rate: number;
    timestamp: number;
    source: string;
}

const rateCache = new Map<string, CachedRate>();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Get cached exchange rate if available and not expired
 */
function getCachedRate(from: string, to: string): CachedRate | null {
    const key = `${from}_${to}`;
    const cached = rateCache.get(key);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached;
    }

    return null;
}

/**
 * Set exchange rate in cache
 */
function setCachedRate(from: string, to: string, rate: number, source: string): void {
    const key = `${from}_${to}`;
    rateCache.set(key, {
        rate,
        timestamp: Date.now(),
        source
    });
}

/**
 * Fetch latest exchange rate from external API
 * Using ExchangeRate-API (free tier: 1,500 requests/month)
 */
async function fetchRateFromAPI(from: string, to: string): Promise<number> {
    try {
        const response = await fetch(
            `https://api.exchangerate-api.com/v4/latest/${from}`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        const rate = data.rates[to];

        if (!rate) {
            throw new Error(`Rate not found for ${from} to ${to}`);
        }

        return rate;
    } catch (error) {
        console.error('Error fetching exchange rate from API:', error);
        throw error;
    }
}

/**
 * Get latest exchange rate from database
 */
async function getLatestRateFromDB(from: string, to: string): Promise<number | null> {
    try {
        const latestRate = await prisma.exchangeRate.findFirst({
            where: {
                fromCurrency: from,
                toCurrency: to
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return latestRate?.rate || null;
    } catch (error) {
        console.error('Error fetching rate from database:', error);
        return null;
    }
}

/**
 * Save exchange rate to database
 */
async function saveRateToDB(
    from: string,
    to: string,
    rate: number,
    source: 'API' | 'MANUAL'
): Promise<void> {
    try {
        await prisma.exchangeRate.create({
            data: {
                fromCurrency: from,
                toCurrency: to,
                rate,
                source
            }
        });
    } catch (error) {
        console.error('Error saving rate to database:', error);
        throw error;
    }
}

/**
 * Get current exchange rate with caching
 * Priority: Cache > Database > API
 */
export async function getExchangeRate(
    from: string,
    to: string
): Promise<{ rate: number; source: string; cached: boolean }> {
    // Normalize currency codes
    from = from.toUpperCase();
    to = to.toUpperCase();

    // Same currency
    if (from === to) {
        return { rate: 1, source: 'DIRECT', cached: false };
    }

    // Check cache first
    const cached = getCachedRate(from, to);
    if (cached) {
        return { rate: cached.rate, source: cached.source, cached: true };
    }

    // Try to get from database
    const dbRate = await getLatestRateFromDB(from, to);
    if (dbRate) {
        setCachedRate(from, to, dbRate, 'DB');
        return { rate: dbRate, source: 'DB', cached: false };
    }

    // Fetch from API as last resort
    try {
        const apiRate = await fetchRateFromAPI(from, to);

        // Save to database
        await saveRateToDB(from, to, apiRate, 'API');

        // Cache the rate
        setCachedRate(from, to, apiRate, 'API');

        return { rate: apiRate, source: 'API', cached: false };
    } catch (error) {
        throw new Error(`Unable to fetch exchange rate for ${from} to ${to}`);
    }
}

/**
 * Convert amount from one currency to another
 */
export async function convertPrice(
    amount: number,
    from: string,
    to: string
): Promise<number> {
    const { rate } = await getExchangeRate(from, to);
    return amount * rate;
}

/**
 * Update exchange rates from external API
 * Fetches both EUR->USD and USD->EUR
 */
export async function updateExchangeRates(): Promise<{
    eurToUsd: number;
    usdToEur: number;
}> {
    try {
        // Fetch EUR to USD
        const eurToUsd = await fetchRateFromAPI('EUR', 'USD');
        await saveRateToDB('EUR', 'USD', eurToUsd, 'API');
        setCachedRate('EUR', 'USD', eurToUsd, 'API');

        // Fetch USD to EUR
        const usdToEur = await fetchRateFromAPI('USD', 'EUR');
        await saveRateToDB('USD', 'EUR', usdToEur, 'API');
        setCachedRate('USD', 'EUR', usdToEur, 'API');

        return { eurToUsd, usdToEur };
    } catch (error) {
        console.error('Error updating exchange rates:', error);
        throw error;
    }
}

/**
 * Validate exchange rate value
 * Ensures rate is within reasonable bounds
 */
export function validateRate(rate: number, from: string, to: string): boolean {
    // Rate must be positive
    if (rate <= 0) return false;

    // For EUR/USD pair, rate should be between 0.5 and 2.0
    if ((from === 'EUR' && to === 'USD') || (from === 'USD' && to === 'EUR')) {
        return rate >= 0.5 && rate <= 2.0;
    }

    return true;
}

/**
 * Get exchange rate history
 */
export async function getRateHistory(
    from: string,
    to: string,
    limit: number = 30
): Promise<Array<{ rate: number; source: string; createdAt: Date }>> {
    try {
        const history = await prisma.exchangeRate.findMany({
            where: {
                fromCurrency: from.toUpperCase(),
                toCurrency: to.toUpperCase()
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            select: {
                rate: true,
                source: true,
                createdAt: true
            }
        });

        return history;
    } catch (error) {
        console.error('Error fetching rate history:', error);
        return [];
    }
}

/**
 * Clear rate cache (useful for testing or manual refresh)
 */
export function clearRateCache(): void {
    rateCache.clear();
}
