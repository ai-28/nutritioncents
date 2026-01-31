'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Droplet, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function WaterInput({ date, currentWater = 0, waterTarget = 2000, onUpdate }) {
  const [waterAmount, setWaterAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [totalWater, setTotalWater] = useState(parseFloat(currentWater || 0));

  useEffect(() => {
    setTotalWater(parseFloat(currentWater || 0));
  }, [currentWater]);

  const handleAddWater = async (amount) => {
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          date: date || new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add water');
      }

      const data = await response.json();
      setTotalWater(data.totalWater);
      setWaterAmount('');
      toast.success(`Added ${amount}ml of water`);
      
      if (onUpdate) {
        onUpdate(data.totalWater);
      }
    } catch (error) {
      console.error('Error adding water:', error);
      toast.error('Failed to add water intake');
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuickAdd = (amount) => {
    handleAddWater(amount);
  };

  const handleCustomAdd = () => {
    if (!waterAmount || parseFloat(waterAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    handleAddWater(waterAmount);
  };

  const waterPercentage = waterTarget > 0 ? Math.min((totalWater / waterTarget) * 100, 100) : 0;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <Droplet className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold">Water</h3>
            <p className="text-sm text-muted-foreground">
              {Math.round(totalWater)} / {waterTarget}ml
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{Math.round(totalWater)}</div>
          <div className="text-xs text-muted-foreground">ml</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${waterPercentage}%` }}
          />
        </div>
        <div className="text-xs text-center text-muted-foreground">
          {Math.round(waterPercentage)}%
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdd(250)}
          disabled={isAdding}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">250ml</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdd(500)}
          disabled={isAdding}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">500ml</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdd(750)}
          disabled={isAdding}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">750ml</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdd(1000)}
          disabled={isAdding}
          className="flex flex-col items-center gap-1 h-auto py-2"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">1L</span>
        </Button>
      </div>

      {/* Custom Input */}
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Custom amount (ml)"
          value={waterAmount}
          onChange={(e) => setWaterAmount(e.target.value)}
          disabled={isAdding}
          className="flex-1"
          min="0"
          step="50"
        />
        <Button
          onClick={handleCustomAdd}
          disabled={isAdding || !waterAmount}
          size="default"
        >
          {isAdding ? 'Adding...' : 'Add'}
        </Button>
      </div>
    </div>
  );
}
