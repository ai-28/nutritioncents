'use client';

import { useEffect, useMemo, useState } from 'react';
import { UserLayout } from '@/components/layout/UserLayout';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { format, startOfWeek, addDays, subDays, addWeeks, subWeeks, endOfWeek } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = previous week, 1 = next week

  useEffect(() => {
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, weekOffset]);

  const getCurrentWeekStart = () => {
    const today = new Date();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 });
    return addWeeks(currentWeekStart, weekOffset);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const weekStartDate = getCurrentWeekStart();
      const weekStart = format(weekStartDate, 'yyyy-MM-dd');
      const [weeklyRes, trendsRes] = await Promise.all([
        fetch(`/api/analytics/weekly?weekStart=${weekStart}`),
        fetch('/api/analytics/trends?days=60'),
      ]);

      if (weeklyRes.ok) {
        const data = await weeklyRes.json();
        if (data.days && data.days.length > 0) {
        }
        setWeeklyData(data);
      }
      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setTrends(data.trends || []);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const weekSeries = useMemo(() => {
    const weekStartDate = getCurrentWeekStart();
    const map = new Map();
    (weeklyData?.days || []).forEach((d) => {
      // Handle both date objects and strings
      const dateKey = d.summary_date 
        ? (typeof d.summary_date === 'string' 
            ? d.summary_date.slice(0, 10) 
            : new Date(d.summary_date).toISOString().slice(0, 10))
        : null;
      if (dateKey) {
        map.set(dateKey, d);
      }
    });

    const series = Array.from({ length: 7 }).map((_, idx) => {
      const date = addDays(weekStartDate, idx);
      const key = format(date, 'yyyy-MM-dd');
      const row = map.get(key);
      
      // Extract values from database - ensure we're getting protein, carbs, and fats
      const calories = Math.round(parseFloat(row?.total_calories || 0));
      const protein = Math.round(parseFloat(row?.total_protein || 0));
      const carbs = Math.round(parseFloat(row?.total_carbs || 0));
      const fats = Math.round(parseFloat(row?.total_fats || 0));
      
      return {
        key, // Keep the date key for debugging
        date: key, // Also include as 'date' for tooltip
        dow: format(date, 'EEEEE'), // S M T W T F S
        calories,
        protein,
        carbs,
        fats,
      };
    });
    
    return series;
  }, [weeklyData, weekOffset]);

  const loggedDaysSet = useMemo(() => {
    const set = new Set();
    trends.forEach((d) => {
      const dateKey = String(d.summary_date).slice(0, 10);
      const calories = parseFloat(d.total_calories || 0);
      const mealCount = parseInt(d.meal_count || 0);
      if (mealCount > 0 || calories > 0) set.add(dateKey);
    });
    return set;
  }, [trends]);

  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 365; i++) {
      const day = subDays(new Date(), i);
      const key = format(day, 'yyyy-MM-dd');
      if (!loggedDaysSet.has(key)) break;
      count += 1;
    }
    return count;
  }, [loggedDaysSet]);

  const streakWeek = useMemo(() => {
    const today = new Date();
    const weekStartDate = getCurrentWeekStart();
    const todayKey = format(today, 'yyyy-MM-dd');

    return Array.from({ length: 7 }).map((_, idx) => {
      const date = addDays(weekStartDate, idx);
      const key = format(date, 'yyyy-MM-dd');
      return {
        key,
        label: format(date, 'EEEEE'),
        isToday: key === todayKey,
        logged: loggedDaysSet.has(key),
      };
    });
  }, [loggedDaysSet, weekOffset]);

  return (
    <UserLayout>
      <div className="px-4 py-6 space-y-6 pb-24">
        <h1 className="text-3xl font-bold">Progress</h1>

        {/* Streak */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-orange-500/15 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <div className="text-xl font-bold leading-none">{streak || 0}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {streakWeek.map((d) => (
                <div key={d.key} className="flex flex-col items-center gap-1">
                  <div className="text-[10px] text-muted-foreground">{d.label}</div>
                  <div
                    className={cn(
                      'h-6 w-6 rounded-full flex items-center justify-center border',
                      d.isToday ? 'bg-orange-500 text-white border-orange-500' : 'bg-background border-border',
                    )}
                  >
                    {d.logged ? <Check className={cn('h-4 w-4', d.isToday ? 'text-white' : 'text-foreground')} /> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calorie graph */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Calories</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekOffset(prev => prev - 1)}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm text-muted-foreground min-w-[120px] text-center">
                {(() => {
                  const weekStart = getCurrentWeekStart();
                  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
                  const isCurrentWeek = weekOffset === 0;
                  if (isCurrentWeek) {
                    return 'This week';
                  }
                  return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
                })()}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWeekOffset(prev => prev + 1)}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading...</div>
          ) : (
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="caloriesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false}
                    // Use date as key (unique) but display day abbreviation
                    tickFormatter={(value, index) => {
                      // Get the day abbreviation from the data point
                      const dataPoint = weekSeries[index];
                      return dataPoint?.dow || '';
                    }}
                  />
                  <YAxis tickLine={false} axisLine={false} width={32} />
                  <Tooltip 
                    content={<MacroTooltip />}
                    // Ensure tooltip uses the correct data point
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="calories"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fill="url(#caloriesFill)"
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

function MacroTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  
  // Recharts passes the full data object in payload[0].payload
  // The payload structure: [{ name: 'calories', value: 570, payload: { calories: 570, protein: 41, ... } }]
  const data = payload[0]?.payload;
  
  if (!data) {
    console.warn('Tooltip: No payload data found', { payload });
    return null;
  }

  // Extract values - the data object should have all the fields we set in weekSeries
  const calories = Number(data.calories) || 0;
  const protein = Number(data.protein) || 0;
  const carbs = Number(data.carbs) || 0;
  const fats = Number(data.fats) || 0;
  const date = data.date || data.key || label; // Get the date to verify which day we're showing

  // Debug: verify we're showing the correct day
  console.log('Tooltip - Date:', date, 'Label:', label, 'Data:', { calories, protein, carbs, fats });

  return (
    <div className="rounded-xl bg-orange-500 text-white px-3 py-2 shadow-md">
      <div className="text-sm font-semibold">{Math.round(calories)} cal</div>
      <div className="text-xs opacity-95 mt-1">Fat&nbsp;&nbsp;&nbsp;{Math.round(fats)}g</div>
      <div className="text-xs opacity-95">Carbs {Math.round(carbs)}g</div>
      <div className="text-xs opacity-95">Protein {Math.round(protein)}g</div>
    </div>
  );
}
