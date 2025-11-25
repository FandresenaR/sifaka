import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission, Permission } from '@/lib/rbac';
import { updateExchangeRates, validateRate } from '@/lib/currency';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/exchange-rate/update
 * Update exchange rates (manual or from API)
 * Protected: Admin only
 */
export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Check permissions
        if (!hasPermission(session.user.role, Permission.VIEW_USERS)) {
            return NextResponse.json(
                { error: 'Permission refusée' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { source, from, to, rate } = body;

        // Manual rate update
        if (source === 'MANUAL') {
            if (!from || !to || !rate) {
                return NextResponse.json(
                    { error: 'Missing required fields: from, to, rate' },
                    { status: 400 }
                );
            }

            // Validate rate
            if (!validateRate(rate, from, to)) {
                return NextResponse.json(
                    { error: 'Invalid exchange rate value' },
                    { status: 400 }
                );
            }

            // Save manual rate
            const exchangeRate = await prisma.exchangeRate.create({
                data: {
                    fromCurrency: from.toUpperCase(),
                    toCurrency: to.toUpperCase(),
                    rate: parseFloat(rate),
                    source: 'MANUAL'
                }
            });

            return NextResponse.json({
                success: true,
                rate: exchangeRate
            });
        }

        // API update (fetch latest rates)
        if (source === 'API' || !source) {
            const rates = await updateExchangeRates();

            return NextResponse.json({
                success: true,
                rates: {
                    eurToUsd: rates.eurToUsd,
                    usdToEur: rates.usdToEur
                },
                timestamp: Date.now()
            });
        }

        return NextResponse.json(
            { error: 'Invalid source. Use API or MANUAL' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Error updating exchange rates:', error);
        return NextResponse.json(
            { error: 'Failed to update exchange rates' },
            { status: 500 }
        );
    }
}
