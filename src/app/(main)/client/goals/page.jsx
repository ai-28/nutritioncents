'use client';

import { useState, useEffect } from 'react';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [caloriesTarget, setCaloriesTarget] = useState(2000);
  const [proteinTarget, setProteinTarget] = useState(150);
  const [carbsTarget, setCarbsTarget] = useState(250);
  const [fatsTarget, setFatsTarget] = useState(65);

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/nutrition/goals?date=${today}`);
      if (res.ok) {
        const data = await res.json();
        if (data.goal) {
          setGoals(data.goal);
          setCaloriesTarget(parseFloat(data.goal.calories_target) || 2000);
          setProteinTarget(parseFloat(data.goal.protein_target) || 150);
          setCarbsTarget(parseFloat(data.goal.carbs_target) || 250);
          setFatsTarget(parseFloat(data.goal.fats_target) || 65);
        }
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/nutrition/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caloriesTarget: parseFloat(caloriesTarget),
          proteinTarget: parseFloat(proteinTarget),
          carbsTarget: parseFloat(carbsTarget),
          fatsTarget: parseFloat(fatsTarget),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save goals');
      }

      toast.success('Nutrition goals updated!');
      loadGoals();
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Failed to save goals');
    } finally {
      setSaving(false);
    }
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

  return (
    <UserLayout>
      <div className="px-4 py-6 space-y-6 pb-24">
        <h1 className="text-3xl font-bold">Nutrition Goals</h1>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
          <div>
            <Label htmlFor="calories">Daily Calories Target</Label>
            <Input
              id="calories"
              type="number"
              value={caloriesTarget}
              onChange={(e) => setCaloriesTarget(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="protein">Daily Protein Target (grams)</Label>
            <Input
              id="protein"
              type="number"
              value={proteinTarget}
              onChange={(e) => setProteinTarget(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="carbs">Daily Carbs Target (grams)</Label>
            <Input
              id="carbs"
              type="number"
              value={carbsTarget}
              onChange={(e) => setCarbsTarget(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="fats">Daily Fats Target (grams)</Label>
            <Input
              id="fats"
              type="number"
              value={fatsTarget}
              onChange={(e) => setFatsTarget(e.target.value)}
              className="mt-2"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Goals'}
          </Button>
        </div>

        {goals && (
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Goals are active from {new Date(goals.start_date).toLocaleDateString()}
              {goals.end_date && ` to ${new Date(goals.end_date).toLocaleDateString()}`}
            </p>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
