'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { UserLayout } from '@/components/layout/UserLayout';
import { MealTypeTabs } from '@/components/ui/meal-type-tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, X, Edit2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DatePickerStrip } from '@/components/ui/date-picker-strip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

function EditMealPageInner() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const mealId = params.id;
  
  const [meal, setMeal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMealType, setCurrentMealType] = useState('breakfast');
  const [extractedItems, setExtractedItems] = useState([]);
  const [allergenAlerts, setAllergenAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingMeal, setLoadingMeal] = useState(true);
  
  // Edit modal state
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({
    food_name: '',
    quantity: '',
    unit: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    fiber: '',
    sugar: '',
    sodium: '',
  });

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
      const mealData = data.meal;
      
      setMeal(mealData);
      // Ensure meal_date is in YYYY-MM-DD format
      if (mealData.meal_date) {
        const dateStr = typeof mealData.meal_date === 'string' 
          ? mealData.meal_date.split('T')[0] 
          : new Date(mealData.meal_date).toISOString().split('T')[0];
        setSelectedDate(dateStr);
      }
      setCurrentMealType(mealData.meal_type);
      
      // Convert meal items to extracted items format
      if (mealData.items && mealData.items.length > 0) {
        const items = mealData.items.map(item => ({
          food_name: item.food_name,
          quantity: parseFloat(item.quantity || 1),
          unit: item.unit || 'serving',
          calories: parseFloat(item.calories || 0),
          protein: parseFloat(item.protein || 0),
          carbs: parseFloat(item.carbs || 0),
          fats: parseFloat(item.fats || 0),
        }));
        setExtractedItems(items);
      }
    } catch (error) {
      console.error('Error loading meal:', error);
      toast.error('Failed to load meal');
      router.push('/client/dashboard');
    } finally {
      setLoadingMeal(false);
    }
  };

  const handleEditItem = (index) => {
    const item = extractedItems[index];
    setEditFormData({
      food_name: item.food_name || '',
      quantity: item.quantity || '',
      unit: item.unit || '',
      calories: item.calories || 0,
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fats: item.fats || 0,
      fiber: item.fiber || 0,
      sugar: item.sugar || 0,
      sodium: item.sodium || 0,
    });
    setEditingItemIndex(index);
  };

  const handleSaveEditItem = () => {
    if (!editFormData.food_name || !editFormData.quantity) {
      toast.error('Food name and quantity are required');
      return;
    }

    const updated = [...extractedItems];
    updated[editingItemIndex] = {
      ...extractedItems[editingItemIndex],
      food_name: editFormData.food_name,
      quantity: parseFloat(editFormData.quantity) || 0,
      unit: editFormData.unit || 'serving',
      calories: parseFloat(editFormData.calories) || 0,
      protein: parseFloat(editFormData.protein) || 0,
      carbs: parseFloat(editFormData.carbs) || 0,
      fats: parseFloat(editFormData.fats) || 0,
      fiber: parseFloat(editFormData.fiber) || 0,
      sugar: parseFloat(editFormData.sugar) || 0,
      sodium: parseFloat(editFormData.sodium) || 0,
      is_edited: true,
    };
    setExtractedItems(updated);
    setEditingItemIndex(null);
    toast.success('Food item updated');
  };

  const handleRemoveItem = (index) => {
    setExtractedItems(extractedItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (extractedItems.length === 0) {
      toast.error('Please add at least one food item');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: currentMealType,
          mealDate: selectedDate,
          items: extractedItems,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update meal');
      }

      toast.success('Meal updated successfully!');
      router.push(`/client/meals/${mealId}`);
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update meal');
    } finally {
      setSaving(false);
    }
  };

  if (loadingMeal) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Loading meal...</div>
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
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Edit Meal</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Date Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Date</label>
          <DatePickerStrip
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            className="bg-white rounded-lg p-2 border border-border"
          />
        </div>

        {/* Meal Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Meal Type</label>
          <MealTypeTabs
            selected={currentMealType}
            onSelect={setCurrentMealType}
          />
        </div>

        {/* Allergy Alerts */}
        {allergenAlerts.length > 0 && (
          <div className="space-y-2">
            {allergenAlerts.map((alert, index) => (
              <Alert
                key={index}
                variant={alert.alert_level === 'critical' ? 'destructive' : 'default'}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{alert.allergen_name}</strong> detected in <strong>{alert.detected_in}</strong>
                  {alert.alert_level === 'critical' && ' - CRITICAL WARNING!'}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Food Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Food Items</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/client/meals/add?type=${currentMealType}&date=${selectedDate}`)}
            >
              Add More
            </Button>
          </div>

          {extractedItems.length > 0 ? (
            <>
              <div className="space-y-3">
                {extractedItems.map((item, index) => (
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
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(index)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
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

              {/* Total */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold">
                    {Math.round(
                      extractedItems.reduce((sum, item) => sum + (item.calories || 0), 0)
                    )}{' '}
                    cal
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    Protein: {Math.round(
                      extractedItems.reduce((sum, item) => sum + (item.protein || 0), 0)
                    )}g
                  </div>
                  <div>
                    Carbs: {Math.round(
                      extractedItems.reduce((sum, item) => sum + (item.carbs || 0), 0)
                    )}g
                  </div>
                  <div>
                    Fats: {Math.round(
                      extractedItems.reduce((sum, item) => sum + (item.fats || 0), 0)
                    )}g
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
                size="lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No food items. Click "Add More" to add items.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Item Modal */}
      <Dialog open={editingItemIndex !== null} onOpenChange={(open) => {
        if (!open) setEditingItemIndex(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Food Item</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Food Name and Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="food_name">Food Name *</Label>
                <Input
                  id="food_name"
                  value={editFormData.food_name}
                  onChange={(e) => setEditFormData({ ...editFormData, food_name: e.target.value })}
                  placeholder="e.g., Grilled Chicken"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={editFormData.quantity}
                  onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                  placeholder="1"
                />
              </div>
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={editFormData.unit}
                onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                placeholder="e.g., serving, cup, gram"
              />
            </div>

            {/* Macronutrients */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Macronutrients</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories (kcal)</Label>
                  <Input
                    id="calories"
                    type="number"
                    step="0.01"
                    value={editFormData.calories}
                    onChange={(e) => setEditFormData({ ...editFormData, calories: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    step="0.01"
                    value={editFormData.protein}
                    onChange={(e) => setEditFormData({ ...editFormData, protein: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    step="0.01"
                    value={editFormData.carbs}
                    onChange={(e) => setEditFormData({ ...editFormData, carbs: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fats">Fats (g)</Label>
                  <Input
                    id="fats"
                    type="number"
                    step="0.01"
                    value={editFormData.fats}
                    onChange={(e) => setEditFormData({ ...editFormData, fats: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Micronutrients */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Micronutrients</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiber">Fiber (g)</Label>
                  <Input
                    id="fiber"
                    type="number"
                    step="0.01"
                    value={editFormData.fiber}
                    onChange={(e) => setEditFormData({ ...editFormData, fiber: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sugar">Sugar (g)</Label>
                  <Input
                    id="sugar"
                    type="number"
                    step="0.01"
                    value={editFormData.sugar}
                    onChange={(e) => setEditFormData({ ...editFormData, sugar: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sodium">Sodium (mg)</Label>
                  <Input
                    id="sodium"
                    type="number"
                    step="0.01"
                    value={editFormData.sodium}
                    onChange={(e) => setEditFormData({ ...editFormData, sodium: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingItemIndex(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEditItem}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}

export default function EditMealPage() {
  return (
    <Suspense
      fallback={
        <UserLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </UserLayout>
      }
    >
      <EditMealPageInner />
    </Suspense>
  );
}
