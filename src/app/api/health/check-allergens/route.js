import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

async function getHealthFunctions() {
  return await import('@/lib/db/health');
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { checkMealForAllergens } = await getHealthFunctions();
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    const alerts = await checkMealForAllergens(session.user.id, items);

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Check allergens error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check allergens' },
      { status: 500 }
    );
  }
}
