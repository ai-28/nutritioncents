import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

async function getDbFunctions() {
  return await import('@/lib/db/users');
}

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { getDashboardStats } = await getDbFunctions();
    const stats = await getDashboardStats();

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
