import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Dynamic import for CommonJS modules
async function getNutritionFunctions() {
  const meals = await import('@/lib/db/meals');
  const nutrition = await import('@/lib/db/nutrition');
  return { ...meals, ...nutrition };
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getDailyNutritionSummary, getActiveNutritionGoals } = await getNutritionFunctions();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const summary = await getDailyNutritionSummary(session.user.id, date);
    const goals = await getActiveNutritionGoals(session.user.id, date);

    return NextResponse.json({
      summary,
      goals: goals || null,
    });
  } catch (error) {
    console.error('Get daily nutrition error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch nutrition data' },
      { status: 500 }
    );
  }
}
