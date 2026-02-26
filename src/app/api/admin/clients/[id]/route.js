import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

async function getDbFunctions() {
  return await import('@/lib/db/users');
}

// DELETE - Hard delete client and all related data
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    const { hardDeleteClient } = await getDbFunctions();
    const deletedClient = await hardDeleteClient(id);

    if (!deletedClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Client and all related data deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete client' },
      { status: 500 }
    );
  }
}
