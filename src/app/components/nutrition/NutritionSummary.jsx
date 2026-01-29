import { cn } from '@/lib/utils';

function NutrientBar({ label, current, target, colorClass }) {
  const percentage = Math.min((current / target) * 100, 100);
  
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{current}/{target}g</span>
    </div>
  );
}

export function NutritionSummary({ data }) {
  const caloriePercentage = (data.calories.current / data.calories.target) * 100;
  const angle = Math.min(caloriePercentage * 1.8, 180);

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <h3 className="text-lg font-semibold text-center mb-4">Summary of last week</h3>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <NutrientBar 
          label="Protein" 
          current={data.protein.current} 
          target={data.protein.target}
          colorClass="nutrition-protein"
        />
        <NutrientBar 
          label="Fats" 
          current={data.fats.current} 
          target={data.fats.target}
          colorClass="nutrition-fats"
        />
        <NutrientBar 
          label="Carbs" 
          current={data.carbs.current} 
          target={data.carbs.target}
          colorClass="nutrition-carbs"
        />
        <NutrientBar 
          label="Minerals" 
          current={data.minerals.current} 
          target={data.minerals.target}
          colorClass="nutrition-minerals"
        />
      </div>

      <div className="flex items-center justify-between">
        <NutrientBar 
          label="Vitamin" 
          current={data.vitamins.current} 
          target={data.vitamins.target}
          colorClass="nutrition-vitamins"
        />
        
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-16 overflow-hidden">
            <svg viewBox="0 0 100 50" className="w-full h-full">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${angle * 1.26} 226.2`}
              />
            </svg>
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
          <span className="text-2xl font-bold">{data.calories.current.toLocaleString()} Kcal</span>
          <span className="text-sm text-muted-foreground">of {data.calories.target.toLocaleString()} kcal</span>
        </div>

        <NutrientBar 
          label="Water" 
          current={data.water.current} 
          target={data.water.target}
          colorClass="nutrition-water"
        />
      </div>
    </div>
  );
}
