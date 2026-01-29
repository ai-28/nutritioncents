import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

async function getWeightFunctions() {
  return await import('@/lib/db/weight');
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { deleteWeightEntry } = await getWeightFunctions();
    await deleteWeightEntry(id, session.user.id);

    return NextResponse.json({ message: 'Weight entry deleted successfully' });
  } catch (error) {
    console.error('Delete weight error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete weight entry' },
      { status: 500 }
    );
  }
}
