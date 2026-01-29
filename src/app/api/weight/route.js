import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

async function getWeightFunctions() {
  return await import('@/lib/db/weight');
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { addWeightEntry } = await getWeightFunctions();
    const body = await request.json();
    const { weightKg, date, notes } = body;

    if (!weightKg || !date) {
      return NextResponse.json(
        { error: 'Weight and date are required' },
        { status: 400 }
      );
    }

    const entry = await addWeightEntry(session.user.id, weightKg, date, notes);

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Add weight error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add weight entry' },
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

    const { getWeightEntries, getLatestWeight } = await getWeightFunctions();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const latest = searchParams.get('latest') === 'true';

    if (latest) {
      const entry = await getLatestWeight(session.user.id);
      return NextResponse.json({ entry });
    }

    if (!startDate || !endDate) {
      const entry = await getLatestWeight(session.user.id);
      return NextResponse.json({ entries: entry ? [entry] : [] });
    }

    const entries = await getWeightEntries(session.user.id, startDate, endDate);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Get weight error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch weight entries' },
      { status: 500 }
    );
  }
}
