'use client';

import { useEffect, useMemo, useState } from 'react';
import { CircularProgress } from './CircularProgress';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Droplet, Candy, Wheat } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function DailyNutritionDisplay({ summary, goals }) {
  if (!summary) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 text-center text-muted-foreground">
        No nutrition data for today
      </div>
    );
  }

  const calories = parseFloat(summary.total_calories || 0);
  const protein = parseFloat(summary.total_protein || 0);
  const carbs = parseFloat(summary.total_carbs || 0);
  const fats = parseFloat(summary.total_fats || 0);

  const caloriesTarget = goals?.calories_target || 2000;
  const proteinTarget = goals?.protein_target || 150;
  const carbsTarget = goals?.carbs_target || 250;
  const fatsTarget = goals?.fats_target || 65;
  const fiberTarget = goals?.fiber_target || 0;
  const sugarTarget = goals?.sugar_target || 0;
  const sodiumTarget = goals?.sodium_target || 0;

  const caloriesPercentage = Math.min((calories / caloriesTarget) * 100, 100);
  const proteinPercentage = Math.min((protein / proteinTarget) * 100, 100);
  const carbsPercentage = Math.min((carbs / carbsTarget) * 100, 100);
  const fatsPercentage = Math.min((fats / fatsTarget) * 100, 100);

  const fiber = parseFloat(summary.total_fiber || 0);
  const sugar = parseFloat(summary.total_sugar || 0);
  const sodium = parseFloat(summary.total_sodium || 0);
  const water = parseFloat(summary.total_water || 0);
  const waterTarget = goals?.water_target || 2000;

  const [carouselApi, setCarouselApi] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;
    const update = () => setSlideIndex(carouselApi.selectedScrollSnap());
    update();
    carouselApi.on('select', update);
    return () => {
      try {
        carouselApi.off('select', update);
      } catch {
        // ignore
      }
    };
  }, [carouselApi]);

  const displayDate = useMemo(() => {
    const raw = summary.summary_date;
    if (typeof raw === 'string' && raw.length >= 10) {
      try {
        return format(parseISO(raw.slice(0, 10)), 'EEEE, MMMM d');
      } catch {
        return raw.slice(0, 10);
      }
    }
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, [summary?.summary_date]);

  const healthScore = useMemo(() => {
    const safeDiv = (a, b) => (b > 0 ? a / b : 0);
    const within = (cur, target) => {
      if (!target || target <= 0) return 1;
      return Math.max(0, 1 - Math.abs(cur - target) / target);
    };
    const overPenalty = (cur, target) => {
      if (!target || target <= 0) return 0;
      return Math.min(1, Math.max(0, cur - target) / target);
    };

    const caloriesWithin = within(calories, caloriesTarget);
    const proteinWithin = within(protein, proteinTarget);
    const penalties = [
      overPenalty(sugar, sugarTarget),
      overPenalty(sodium, sodiumTarget),
    ].filter((p) => Number.isFinite(p));
    const penaltyAvg = penalties.length ? penalties.reduce((a, b) => a + b, 0) / penalties.length : 0;

    const score01 = 0.45 * caloriesWithin + 0.45 * proteinWithin + 0.10 * (1 - penaltyAvg);
    return Math.max(0, Math.min(10, Math.round(score01 * 10)));
  }, [calories, caloriesTarget, protein, proteinTarget, sugar, sugarTarget, sodium, sodiumTarget]);

  const insight = useMemo(() => {
    const calDiff = caloriesTarget - calories;
    const proteinDiff = proteinTarget - protein;

    if (calDiff > 0 && proteinDiff > 0) {
      return 'You are under your calorie and protein goals — consider adding a protein-forward snack or lean protein to support your goal.';
    }
    if (calDiff < 0) {
      return 'You are over your calorie goal — try a lighter meal or reduce added fats/sugars to get back on track.';
    }
    if (proteinDiff > 0) {
      return 'You are under your protein goal — prioritize lean proteins (eggs, chicken, Greek yogurt, tofu) to improve satiety and results.';
    }
    return 'Nice work — keep consistency and aim for balanced macros through the day.';
  }, [calories, caloriesTarget, protein, proteinTarget]);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Today's Nutrition</h2>
        <p className="text-sm text-muted-foreground">
          {displayDate}
        </p>
      </div>

      <Carousel setApi={setCarouselApi} opts={{ loop: false, align: 'start' }} className="w-full">
        <CarouselContent className="-ml-3">
          {/* Slide 1: Calories + Macros */}
          <CarouselItem className="pl-3">
            <div className="space-y-6">
              <div className="flex justify-center">
                <CircularProgress
                  value={caloriesPercentage}
                  size={120}
                  strokeWidth={8}
                  label="Calories"
                  current={Math.round(calories)}
                  target={Math.round(caloriesTarget)}
                  unit="cal"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <MacroBar
                  label="Protein"
                  current={Math.round(protein)}
                  target={Math.round(proteinTarget)}
                  unit="g"
                  percentage={proteinPercentage}
                  color="bg-blue-500"
                />
                <MacroBar
                  label="Carbs"
                  current={Math.round(carbs)}
                  target={Math.round(carbsTarget)}
                  unit="g"
                  percentage={carbsPercentage}
                  color="bg-orange-500"
                />
                <MacroBar
                  label="Fats"
                  current={Math.round(fats)}
                  target={Math.round(fatsTarget)}
                  unit="g"
                  percentage={fatsPercentage}
                  color="bg-yellow-500"
                />
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Remaining</span>
                  <span className="text-lg font-semibold">
                    {Math.max(0, Math.round(caloriesTarget - calories))} cal
                  </span>
                </div>
              </div>
            </div>
          </CarouselItem>

          {/* Slide 2: Micros + Health score */}
          <CarouselItem className="pl-3">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <MicroCard
                  label="Fiber"
                  unit="g"
                  current={fiber}
                  target={fiberTarget}
                  color="text-purple-600"
                  ring="stroke-purple-500"
                  icon={<Wheat className="h-4 w-4 text-purple-600" />}
                />
                <MicroCard
                  label="Sugar"
                  unit="g"
                  current={sugar}
                  target={sugarTarget}
                  color="text-pink-600"
                  ring="stroke-pink-500"
                  icon={<Candy className="h-4 w-4 text-pink-600" />}
                />
                <MicroCard
                  label="Sodium"
                  unit="mg"
                  current={sodium}
                  target={sodiumTarget}
                  color="text-amber-600"
                  ring="stroke-amber-500"
                  icon={<Droplet className="h-4 w-4 text-amber-600" />}
                  displayScale={1000} // stored in mg in DB? keep as-is; this only affects rounding display
                />
                <MicroCard
                  label="Water"
                  unit="ml"
                  current={water}
                  target={waterTarget}
                  color="text-blue-600"
                  ring="stroke-blue-500"
                  icon={<Droplet className="h-4 w-4 text-blue-600" />}
                />
              </div>

              <div className="rounded-xl border border-border p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Health Score</div>
                  <div className="font-semibold">{healthScore}/10</div>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, (healthScore / 10) * 100))}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{insight}</p>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>

      {/* Dots */}
      <div className="flex justify-center gap-2 pt-1">
        {[0, 1].map((i) => (
          <button
            key={i}
            type="button"
            aria-label={i === 0 ? 'Macros' : 'Micros'}
            className={cn(
              'h-2 w-2 rounded-full transition-colors',
              slideIndex === i ? 'bg-foreground' : 'bg-muted-foreground/30',
            )}
            onClick={() => carouselApi?.scrollTo(i)}
          />
        ))}
      </div>
    </div>
  );
}

function MacroBar({ label, current, target, unit, percentage, color }) {
  return (
    <div className="space-y-2">
      <div className="text-sm">
        <div className="font-medium">{label}</div>
        <div className="text-muted-foreground">
          {current}/{target}{unit}
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-xs text-center text-muted-foreground">
        {Math.round(percentage)}%
      </div>
    </div>
  );
}

function MicroCard({ label, unit, current, target, icon, ring, color, displayScale }) {
  const safeTarget = Number(target) > 0 ? Number(target) : 0;
  const cur = Number.isFinite(Number(current)) ? Number(current) : 0;
  const diff = safeTarget - cur;
  const status = safeTarget > 0 ? (diff >= 0 ? 'left' : 'over') : 'total';

  const display = (v) => {
    const n = Number.isFinite(Number(v)) ? Number(v) : 0;
    if (displayScale) return Math.round(n);
    return Math.round(n);
  };

  const headline = safeTarget > 0 ? `${Math.abs(Math.round(diff))}${unit}` : `${display(cur)}${unit}`;
  const sub = safeTarget > 0 ? `${label} ${status}` : label;
  const pct = safeTarget > 0 ? Math.min((cur / safeTarget) * 100, 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-lg font-semibold leading-none">{headline}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>

      <div className="mt-3 flex items-center justify-center">
        <MiniRing value={pct} ringClassName={ring} icon={icon} />
      </div>
    </div>
  );
}

function MiniRing({ value, ringClassName, icon }) {
  const size = 44;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-300', ringClassName)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{icon}</div>
    </div>
  );
}
