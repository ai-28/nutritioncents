import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { amount, date } = body;

        if (!amount || amount < 0) {
            return NextResponse.json({ error: 'Valid water amount is required' }, { status: 400 });
        }

        const userIdStr = String(session.user.id);
        const targetDate = date || new Date().toISOString().split('T')[0];

        // Get current water intake for the date
        const [existing] = await sql`
      SELECT total_water FROM daily_nutrition_summary
      WHERE user_id = ${userIdStr} AND summary_date = ${targetDate}
    `;

        const currentWater = parseFloat(existing?.total_water || 0);
        const newWater = currentWater + parseFloat(amount);

        // Update or insert daily nutrition summary with new water amount
        await sql`
      INSERT INTO daily_nutrition_summary (
        user_id, summary_date, total_water
      ) VALUES (
        ${userIdStr}, ${targetDate}, ${newWater}
      )
      ON CONFLICT (user_id, summary_date)
      DO UPDATE SET
        total_water = ${newWater},
        last_calculated_at = CURRENT_TIMESTAMP
    `;

        return NextResponse.json({
            success: true,
            totalWater: newWater,
            added: parseFloat(amount),
        });
    } catch (error) {
        console.error('Add water error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to add water intake' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { amount, date } = body;

        if (amount === undefined || amount < 0) {
            return NextResponse.json({ error: 'Valid water amount is required' }, { status: 400 });
        }

        const userIdStr = String(session.user.id);
        const targetDate = date || new Date().toISOString().split('T')[0];

        // Update or insert daily nutrition summary with absolute water amount
        await sql`
      INSERT INTO daily_nutrition_summary (
        user_id, summary_date, total_water
      ) VALUES (
        ${userIdStr}, ${targetDate}, ${parseFloat(amount)}
      )
      ON CONFLICT (user_id, summary_date)
      DO UPDATE SET
        total_water = ${parseFloat(amount)},
        last_calculated_at = CURRENT_TIMESTAMP
    `;

        return NextResponse.json({
            success: true,
            totalWater: parseFloat(amount),
        });
    } catch (error) {
        console.error('Update water error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update water intake' },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

        const userIdStr = String(session.user.id);

        const [summary] = await sql`
      SELECT total_water FROM daily_nutrition_summary
      WHERE user_id = ${userIdStr} AND summary_date = ${date}
    `;

        return NextResponse.json({
            totalWater: parseFloat(summary?.total_water || 0),
        });
    } catch (error) {
        console.error('Get water error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch water intake' },
            { status: 500 }
        );
    }
}
