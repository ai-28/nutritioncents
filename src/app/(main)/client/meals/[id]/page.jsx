'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function MealDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const mealId = params.id;

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (mealId) {
      loadMeal();
    }
  }, [mealId]);

  const loadMeal = async () => {
    try {
      const response = await fetch(`/api/meals/${mealId}`);
      if (!response.ok) {
        throw new Error('Failed to load meal');
      }
      const data = await response.json();
      setMeal(data.meal);
    } catch (error) {
      console.error('Error loading meal:', error);
      toast.error('Failed to load meal');
      router.push('/client/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete meal');
      }

      toast.success('Meal deleted successfully');
      router.push('/client/dashboard');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete meal');
    } finally {
      setDeleting(false);
    }
  };

  const mealLabels = {
    early_am: 'Early AM',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
  };

  const mealIcons = {
    early_am: '🌅',
    breakfast: '🍳',
    lunch: '🍽️',
    dinner: '🍛',
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </UserLayout>
    );
  }

  if (!meal) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Meal not found</div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="px-4 py-6 space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {mealIcons[meal.meal_type]} {mealLabels[meal.meal_type]}
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(meal.meal_date), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </Button>
        </div>

        {/* Summary */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Calories</span>
              <span className="text-2xl font-bold">
                {Math.round(parseFloat(meal.total_calories || 0))} cal
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
              <div>
                <div className="text-sm text-muted-foreground">Protein</div>
                <div className="text-lg font-semibold">
                  {Math.round(parseFloat(meal.total_protein || 0))}g
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Carbs</div>
                <div className="text-lg font-semibold">
                  {Math.round(parseFloat(meal.total_carbs || 0))}g
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Fats</div>
                <div className="text-lg font-semibold">
                  {Math.round(parseFloat(meal.total_fats || 0))}g
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Food Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Food Items</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/client/meals/${mealId}/edit`)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          {meal.items && meal.items.length > 0 ? (
            <div className="space-y-3">
              {meal.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.food_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm pt-2 border-t border-border">
                    <div>
                      <span className="text-muted-foreground">Cal:</span>{' '}
                      {Math.round(item.calories || 0)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">P:</span>{' '}
                      {Math.round(item.protein || 0)}g
                    </div>
                    <div>
                      <span className="text-muted-foreground">C:</span>{' '}
                      {Math.round(item.carbs || 0)}g
                    </div>
                    <div>
                      <span className="text-muted-foreground">F:</span>{' '}
                      {Math.round(item.fats || 0)}g
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No food items found
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
