import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Dynamic import for CommonJS modules
async function getNutritionFunctions() {
  return await import('@/lib/db/nutrition');
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { createNutritionGoal } = await getNutritionFunctions();
    const body = await request.json();
    const goal = await createNutritionGoal(session.user.id, body);

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Create nutrition goal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create nutrition goal' },
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

    const { getActiveNutritionGoals } = await getNutritionFunctions();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const goal = await getActiveNutritionGoals(session.user.id, date);

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Get nutrition goal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch nutrition goal' },
      { status: 500 }
    );
  }
}
