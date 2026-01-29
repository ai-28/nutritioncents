'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EarlyAMIcon, BreakfastIcon, LunchIcon, DinnerIcon } from '@/components/icons/svg';

const mealIcons = {
  early_am: EarlyAMIcon,
  breakfast: BreakfastIcon,
  lunch: LunchIcon,
  dinner: DinnerIcon,
};

const mealLabels = {
  early_am: 'Early AM',
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

const recommendedCalories = {
  early_am: '200-300',
  breakfast: '450-650',
  lunch: '500-700',
  dinner: '500-700',
};

export function MealCard({ mealType, calories = 0, protein = 0, carbs = 0, fats = 0, onClick, onAdd }) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (calories > 0) {
      // Navigate to meal detail
      router.push(`/client/meals/${mealType}`);
    }
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAdd) {
      onAdd();
    } else {
      router.push(`/meals/add?type=${mealType}`);
    }
  };

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const hasMeal = calories > 0;
  const IconComponent = mealIcons[mealType];

  return (
    <div
      className={cn(
        "bg-card rounded-2xl border p-4 transition-all",
        hasMeal 
          ? "border-border hover:shadow-md hover:border-primary" 
          : "border-2 border-[#3F7203] hover:shadow-md hover:border-blue-500"
      )}
    >
      {/* Header - Always visible */}
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center gap-4 flex-1 cursor-pointer"
          onClick={hasMeal ? handleToggleExpand : undefined}
        >
          <div className={cn(
            "shrink-0 rounded-full flex items-center justify-center",
            hasMeal ? "w-12 h-12" : "w-14 h-14 bg-amber-100"
          )}>
            {IconComponent ? <IconComponent /> : null}
          </div>
          <div className="flex-1">
            <h3 className={cn(
              "text-lg",
              hasMeal ? "font-semibold" : "text-foreground"
            )}>
              {hasMeal ? mealLabels[mealType] : `Add ${mealLabels[mealType]}`}
            </h3>
            {hasMeal ? (
              <p className="text-sm text-muted-foreground">
                {protein}g protein • {carbs}g carbs • {fats}g fats
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-0.5">
                Recommended {recommendedCalories[mealType]} cal
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Expand/Collapse button - only show when meal is logged */}
          {hasMeal && (
            <button
              onClick={handleToggleExpand}
              className="shrink-0 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
          
          {/* Add button - always visible */}
          <button
            onClick={handleAdd}
            className="shrink-0 w-10 h-10 rounded-full bg-[#CDE26D] hover:bg-green-600 flex items-center justify-center transition-colors"
            aria-label={`Add ${mealLabels[mealType]}`}
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Expanded content - only show when meal is logged and expanded */}
      {hasMeal && isExpanded && (
        <div className="mt-4 pt-4 border-t border-border">
          <div 
            className="flex items-baseline gap-2 cursor-pointer"
            onClick={handleClick}
          >
            <span className="text-2xl font-bold">{Math.round(calories)}</span>
            <span className="text-sm text-muted-foreground">cal</span>
          </div>
        </div>
      )}
    </div>
  );
}
