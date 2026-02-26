import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

async function getDbFunctions() {
    return await import('@/lib/db/users');
}

export async function GET(request) {
    try {
        const session = await auth();

        // Check if user is authenticated
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const { getAllClients } = await getDbFunctions();
        const clients = await getAllClients();

        return NextResponse.json({ clients });
    } catch (error) {
        console.error('Get clients error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch clients' },
            { status: 500 }
        );
    }
}
