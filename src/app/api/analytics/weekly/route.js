import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

async function getAnalyticsFunctions() {
  return await import('@/lib/db/analytics');
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getWeeklyNutrition } = await getAnalyticsFunctions();
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart') || new Date().toISOString().split('T')[0];

    const data = await getWeeklyNutrition(session.user.id, weekStart);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get weekly analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch weekly analytics' },
      { status: 500 }
    );
  }
}
