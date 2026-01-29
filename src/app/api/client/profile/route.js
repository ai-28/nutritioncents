import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

async function getProfileFunctions() {
  return await import('@/lib/db/client-profiles');
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getClientProfile } = await getProfileFunctions();
    const profile = await getClientProfile(session.user.id);

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
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

    const { createOrUpdateClientProfile } = await getProfileFunctions();
    const body = await request.json();

    // Map frontend fields to database fields
    const profileData = {
      dateOfBirth: body.dateOfBirth || body.age ? new Date(new Date().getFullYear() - (body.age || 0), 0, 1).toISOString().split('T')[0] : null,
      gender: body.gender,
      heightCm: body.heightCm,
      weightKg: body.weightKg || body.weight,
      activityLevel: body.activityLevel,
      avatarUrl: body.avatarUrl,
      onboardingCompleted: body.onboardingCompleted !== undefined ? body.onboardingCompleted : true,
    };

    const profile = await createOrUpdateClientProfile(session.user.id, profileData);

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
