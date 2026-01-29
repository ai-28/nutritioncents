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

    const { getAllergies } = await getHealthFunctions();
    const allergies = await getAllergies(session.user.id);

    return NextResponse.json({ allergies });
  } catch (error) {
    console.error('Get allergies error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch allergies' },
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

    const { createAllergy } = await getHealthFunctions();
    const body = await request.json();
    const allergy = await createAllergy(session.user.id, body);

    return NextResponse.json({ allergy }, { status: 201 });
  } catch (error) {
    console.error('Create allergy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create allergy' },
      { status: 500 }
    );
  }
}
