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

    const { getNutritionTrends } = await getAnalyticsFunctions();
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 30;

    const trends = await getNutritionTrends(session.user.id, days);

    return NextResponse.json({ trends });
  } catch (error) {
    console.error('Get trends error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}
