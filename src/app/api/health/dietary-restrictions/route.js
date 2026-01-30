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

    const { getDietaryRestrictions } = await getHealthFunctions();
    const restrictions = await getDietaryRestrictions(session.user.id);

    return NextResponse.json({ restrictions });
  } catch (error) {
    console.error('Get dietary restrictions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dietary restrictions' },
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

    const { createDietaryRestriction } = await getHealthFunctions();
    const body = await request.json();
    const restriction = await createDietaryRestriction(session.user.id, body);

    return NextResponse.json({ restriction }, { status: 201 });
  } catch (error) {
    console.error('Create dietary restriction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create dietary restriction' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deleteDietaryRestriction } = await getHealthFunctions();
    const { searchParams } = new URL(request.url);
    const restrictionId = searchParams.get('id');

    if (!restrictionId) {
      return NextResponse.json(
        { error: 'Restriction ID is required' },
        { status: 400 }
      );
    }

    const restriction = await deleteDietaryRestriction(restrictionId, session.user.id);

    return NextResponse.json({ restriction });
  } catch (error) {
    console.error('Delete dietary restriction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete dietary restriction' },
      { status: 500 }
    );
  }
}
