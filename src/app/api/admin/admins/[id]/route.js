import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

async function getDbFunctions() {
  return await import('@/lib/db/users');
}

// PUT - Update admin user
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, email, password, is_active } = body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (password !== undefined) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      updates.password = password;
    }
    if (is_active !== undefined) updates.is_active = is_active;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Check if email is being changed and if it already exists
    if (email) {
      const { findUserByEmail, findUserById } = await getDbFunctions();
      const existingUser = await findUserByEmail(email);
      const currentUser = await findUserById(id);
      
      if (existingUser && existingUser.id !== currentUser?.id) {
        return NextResponse.json(
          { error: 'Email already in use by another user' },
          { status: 400 }
        );
      }
    }

    const { updateUser } = await getDbFunctions();
    const updatedAdmin = await updateUser(id, updates);

    if (!updatedAdmin) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ admin: updatedAdmin, message: 'Admin user updated successfully' });
  } catch (error) {
    console.error('Update admin error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update admin user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete admin user (soft delete)
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = params;

    // Prevent deleting yourself
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const { deleteUser } = await getDbFunctions();
    const deletedAdmin = await deleteUser(id);

    if (!deletedAdmin) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Admin user deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete admin user' },
      { status: 500 }
    );
  }
}
