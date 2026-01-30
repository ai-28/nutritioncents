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

    const { getHealthGoals } = await getHealthFunctions();
    const goals = await getHealthGoals(session.user.id);

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Get health goals error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch health goals' },
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

    const { createHealthGoal } = await getHealthFunctions();
    const body = await request.json();
    const goal = await createHealthGoal(session.user.id, body);

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Create health goal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create health goal' },
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

    const { updateHealthGoal } = await getHealthFunctions();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    const goal = await updateHealthGoal(id, session.user.id, updates);

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Update health goal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update health goal' },
      { status: 500 }
    );
  }
}
