import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

async function getHealthFunctions() {
  return await import('@/lib/db/health');
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getHealthConditions, getHealthRecommendations } = await getHealthFunctions();
    const { searchParams } = new URL(request.url);
    const recommendations = searchParams.get('recommendations') === 'true';

    if (recommendations) {
      const recs = await getHealthRecommendations(session.user.id);
      return NextResponse.json({ recommendations: recs });
    }

    const conditions = await getHealthConditions(session.user.id);

    return NextResponse.json({ conditions });
  } catch (error) {
    console.error('Get health conditions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch health conditions' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { createHealthCondition } = await getHealthFunctions();
    const body = await request.json();
    const condition = await createHealthCondition(session.user.id, body);

    return NextResponse.json({ condition }, { status: 201 });
  } catch (error) {
    console.error('Create health condition error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create health condition' },
      { status: 500 }
    );
  }
}
