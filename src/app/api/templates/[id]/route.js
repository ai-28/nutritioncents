import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

async function getTemplateFunctions() {
  return await import('@/lib/db/templates');
}

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { getMealTemplateById } = await getTemplateFunctions();
    const template = await getMealTemplateById(id, session.user.id);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Get template error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { updateMealTemplate } = await getTemplateFunctions();
    const body = await request.json();
    const template = await updateMealTemplate(id, session.user.id, body);

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { deleteMealTemplate } = await getTemplateFunctions();
    await deleteMealTemplate(id, session.user.id);

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { getMealTemplateById, incrementTemplateUsage } = await getTemplateFunctions();
    const template = await getMealTemplateById(id, session.user.id);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const body = await request.json();
    const { mealDate } = body;

    if (!mealDate) {
      return NextResponse.json(
        { error: 'Meal date is required' },
        { status: 400 }
      );
    }

    // Increment usage
    await incrementTemplateUsage(id);

    // Create meal from template
    const { createMeal } = await import('@/lib/db/meals');
    const meal = await createMeal(session.user.id, {
      mealType: template.meal_type,
      mealDate,
      inputMethod: 'manual',
      items: template.items,
    });

    return NextResponse.json({ meal }, { status: 201 });
  } catch (error) {
    console.error('Use template error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to use template' },
      { status: 500 }
    );
  }
}
