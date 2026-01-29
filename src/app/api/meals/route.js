import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Dynamic import for CommonJS modules
async function getMealFunctions() {
  return await import('@/lib/db/meals');
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { createMeal } = await getMealFunctions();
    const body = await request.json();
    const { mealType, mealDate, inputMethod, items, notes } = body;

    if (!mealType || !mealDate) {
      return NextResponse.json(
        { error: 'Meal type and date are required' },
        { status: 400 }
      );
    }

    const meal = await createMeal(session.user.id, {
      mealType,
      mealDate,
      inputMethod: inputMethod || 'manual',
      items: items || [],
      notes,
    });

    return NextResponse.json({ meal }, { status: 201 });
  } catch (error) {
    console.error('Create meal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create meal' },
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

    const { getMealsByDate } = await getMealFunctions();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const meals = await getMealsByDate(session.user.id, date);

    return NextResponse.json({ meals });
  } catch (error) {
    console.error('Get meals error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch meals' },
      { status: 500 }
    );
  }
}
