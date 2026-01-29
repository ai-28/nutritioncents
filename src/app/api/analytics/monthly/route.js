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

    const { getMonthlyNutrition } = await getAnalyticsFunctions();
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear();
    const month = parseInt(searchParams.get('month')) || new Date().getMonth() + 1;

    const data = await getMonthlyNutrition(session.user.id, year, month);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get monthly analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch monthly analytics' },
      { status: 500 }
    );
  }
}
