'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Plus, Star, Trash2, Play } from 'lucide-react';
import { MealTypeTabs } from '@/components/ui/meal-type-tabs';

export default function TemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [templateName, setTemplateName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user, selectedMealType]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/templates?mealType=${selectedMealType}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealDate: today }),
      });

      if (!res.ok) {
        throw new Error('Failed to use template');
      }

      toast.success('Meal created from template!');
      router.push('/client/dashboard');
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to create meal from template');
    }
  };

  const handleCreateFromMeal = async () => {
    // This would typically open a meal selector
    // For now, redirect to create meal page
    router.push(`/meals/add?type=${selectedMealType}&createTemplate=true`);
  };

  const handleDelete = async (templateId) => {
    if (!confirm('Delete this template?')) return;

    try {
      const res = await fetch(`/api/templates/${templateId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Template deleted');
        loadTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleToggleFavorite = async (templateId, isFavorite) => {
    try {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });

      if (res.ok) {
        loadTemplates();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <UserLayout>
      <div className="px-4 py-6 space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Meal Templates</h1>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        <div>
          <Label className="mb-2 block">Filter by Meal Type</Label>
          <MealTypeTabs
            selected={selectedMealType}
            onSelect={setSelectedMealType}
          />
        </div>

        {showAddForm && (
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Create Template from Meal</h2>
            <p className="text-sm text-muted-foreground">
              Create a meal first, then save it as a template for quick logging.
            </p>
            <Button onClick={handleCreateFromMeal} className="w-full">
              Go to Create Meal
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)} className="w-full">
              Cancel
            </Button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : templates.length > 0 ? (
          <div className="space-y-3">
            {templates.map((template) => {
              const items = typeof template.items === 'string' 
                ? JSON.parse(template.items) 
                : template.items || [];
              
              return (
                <div
                  key={template.id}
                  className="bg-card rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{template.template_name}</h3>
                        {template.is_favorite && (
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {items.length} items • {Math.round(template.total_calories || 0)} cal
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Used {template.usage_count || 0} times
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFavorite(template.id, template.is_favorite)}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            template.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    {items.slice(0, 3).map((item, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        • {item.food_name} ({item.quantity} {item.unit})
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        + {items.length - 3} more items
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleUseTemplate(template.id)}
                    className="w-full"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No templates yet. Create a meal and save it as a template!
          </div>
        )}
      </div>
    </UserLayout>
  );
}
