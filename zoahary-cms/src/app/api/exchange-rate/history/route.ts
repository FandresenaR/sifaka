import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission, Permission } from '@/lib/rbac';
import { getRateHistory } from '@/lib/currency';

/**
 * GET /api/exchange-rate/history
 * Get exchange rate history
 * Protected: Admin only
 * Query params: from, to, limit (default: 30)
 */
export async function GET(req: NextRequest) {
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

        const { searchParams } = new URL(req.url);
        const from = searchParams.get('from') || 'EUR';
        const to = searchParams.get('to') || 'USD';
        const limit = parseInt(searchParams.get('limit') || '30');

        const history = await getRateHistory(from, to, limit);

        return NextResponse.json({
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            history
        });

    } catch (error) {
        console.error('Error fetching exchange rate history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch history' },
            { status: 500 }
        );
    }
}
