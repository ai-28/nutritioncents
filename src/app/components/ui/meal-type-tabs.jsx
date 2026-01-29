import { cn } from '@/lib/utils';

const mealTypes = [
  { id: 'early_am', label: 'Early AM' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
];

export function MealTypeTabs({ selected, onSelect }) {
  return (
    <div className="flex gap-2 p-1 bg-muted rounded-full border border-border">
      {mealTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => onSelect(type.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors flex-1",
            selected === type.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}
