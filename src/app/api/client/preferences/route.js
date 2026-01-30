import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

async function getPreferencesFunctions() {
  return await import('@/lib/db/user-preferences');
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getUserPreferences } = await getPreferencesFunctions();
    const preferences = await getUserPreferences(session.user.id);

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Get user preferences error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user preferences' },
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

    const { createOrUpdateUserPreferences } = await getPreferencesFunctions();
    const body = await request.json();
    const preferences = await createOrUpdateUserPreferences(session.user.id, body);

    return NextResponse.json({ preferences }, { status: 201 });
  } catch (error) {
    console.error('Update user preferences error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user preferences' },
      { status: 500 }
    );
  }
}
