import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Dynamic import for CommonJS modules
async function getMealFunctions() {
  return await import('@/lib/db/meals');
}

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { getMealById } = await getMealFunctions();
    const meal = await getMealById(id);

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    if (meal.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ meal });
  } catch (error) {
    console.error('Get meal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch meal' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { updateMeal } = await getMealFunctions();
    const body = await request.json();
    const meal = await updateMeal(id, session.user.id, body);

    return NextResponse.json({ meal });
  } catch (error) {
    console.error('Update meal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update meal' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { deleteMeal } = await getMealFunctions();
    await deleteMeal(id, session.user.id);

    return NextResponse.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Delete meal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete meal' },
      { status: 500 }
    );
  }
}
