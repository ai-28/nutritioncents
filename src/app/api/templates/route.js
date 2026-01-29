import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

async function getTemplateFunctions() {
  return await import('@/lib/db/templates');
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { createMealTemplate } = await getTemplateFunctions();
    const body = await request.json();
    const { templateName, mealType, items, totalCalories } = body;

    if (!templateName || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Template name and items are required' },
        { status: 400 }
      );
    }

    const template = await createMealTemplate(session.user.id, {
      templateName,
      mealType,
      items,
      totalCalories,
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getMealTemplates } = await getTemplateFunctions();
    const { searchParams } = new URL(request.url);
    const mealType = searchParams.get('mealType');

    const templates = await getMealTemplates(session.user.id, mealType);

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
