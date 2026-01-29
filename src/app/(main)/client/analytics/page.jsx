'use client';

import { useEffect, useMemo, useState } from 'react';
import { UserLayout } from '@/components/layout/UserLayout';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { format, startOfWeek, addDays, subDays } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Check } from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd');
      const [weeklyRes, trendsRes] = await Promise.all([
        fetch(`/api/analytics/weekly?weekStart=${weekStart}`),
        fetch('/api/analytics/trends?days=60'),
      ]);

      if (weeklyRes.ok) {
        const data = await weeklyRes.json();
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
    const today = new Date();
    const weekStartDate = startOfWeek(today, { weekStartsOn: 0 });
    const map = new Map();
    (weeklyData?.days || []).forEach((d) => {
      map.set(String(d.summary_date).slice(0, 10), d);
    });

    return Array.from({ length: 7 }).map((_, idx) => {
      const date = addDays(weekStartDate, idx);
      const key = format(date, 'yyyy-MM-dd');
      const row = map.get(key);
      return {
        key,
        dow: format(date, 'EEEEE'), // S M T W T F S
        calories: Math.round(parseFloat(row?.total_calories || 0)),
        protein: Math.round(parseFloat(row?.total_protein || 0)),
        carbs: Math.round(parseFloat(row?.total_carbs || 0)),
        fats: Math.round(parseFloat(row?.total_fats || 0)),
      };
    });
  }, [weeklyData]);

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
    const weekStartDate = startOfWeek(today, { weekStartsOn: 0 });
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
  }, [loggedDaysSet]);

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
            <div className="flex items-center gap-2">
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
            <div className="text-sm text-muted-foreground">This week</div>
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
                  <XAxis dataKey="dow" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={32} />
                  <Tooltip content={<MacroTooltip />} />
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

function MacroTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;

  return (
    <div className="rounded-xl bg-orange-500 text-white px-3 py-2 shadow-md">
      <div className="text-sm font-semibold">{p.calories} cal</div>
      <div className="text-xs opacity-95 mt-1">Fat&nbsp;&nbsp;&nbsp;{p.fats}g</div>
      <div className="text-xs opacity-95">Carbs {p.carbs}g</div>
      <div className="text-xs opacity-95">Protein {p.protein}g</div>
    </div>
  );
}
