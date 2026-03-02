'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserLayout } from '@/components/layout/UserLayout';
import { DailyNutritionDisplay } from '@/components/nutrition/DailyNutritionDisplay';
import { MealCard } from '@/components/nutrition/MealCard';
import { WaterInput } from '@/components/nutrition/WaterInput';
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DatePickerStrip } from '@/components/ui/date-picker-strip';

function DashboardPageInner() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Initialize with today's date (same on server and client to avoid hydration mismatch)
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [nutrition, setNutrition] = useState(null);
  const [goals, setGoals] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const hasCheckedOnboardingRef = useRef(false);
  const dataCacheRef = useRef({});
  const hasHydratedRef = useRef(false);

  // Check URL parameter for date (coming from meal save) or default to today
  useEffect(() => {
    if (!hasHydratedRef.current && typeof window !== 'undefined') {
      hasHydratedRef.current = true;
      const dateParam = searchParams.get('date');
      const today = new Date().toISOString().split('T')[0];
      
      if (dateParam) {
        // Coming from meal save - use the date from URL
        setSelectedDate(dateParam);
        // Clear the URL parameter to keep URL clean
        router.replace('/client/dashboard', { scroll: false });
      } else {
        // Coming from dashboard tab click - use today
        setSelectedDate(today);
      }
    }
  }, [searchParams, router]);


  useEffect(() => {
    if (user && !hasCheckedOnboardingRef.current) {
      checkOnboarding();
      hasCheckedOnboardingRef.current = true;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedDate]);

  const checkOnboarding = async () => {
    try {
      const response = await fetch('/api/client/profile');
      if (response.ok) {
        const { profile } = await response.json();
        if (!profile || !profile.onboarding_completed) {
          router.push('/client/onboarding');
        }
      }
    } catch (err) {
      console.error('Error checking onboarding:', err);
    }
  };

  const loadData = async () => {
    // Check cache first
    const cacheKey = `${selectedDate}`;
    const cached = dataCacheRef.current[cacheKey];
    
    if (cached) {
      setNutrition(cached.nutrition);
      setGoals(cached.goals);
      setMeals(Array.isArray(cached.meals) ? cached.meals : []);
      setLoading(false);
      // Still refresh in background
    } else {
      setLoading(true);
    }
    
    try {
      // Load daily nutrition
      const nutritionRes = await fetch(`/api/nutrition/daily?date=${selectedDate}`);
      if (nutritionRes.ok) {
        const data = await nutritionRes.json();
        setNutrition(data.summary);
        setGoals(data.goals);
        
        // Cache the data
        if (!dataCacheRef.current[cacheKey]) {
          dataCacheRef.current[cacheKey] = {};
        }
        dataCacheRef.current[cacheKey].nutrition = data.summary;
        dataCacheRef.current[cacheKey].goals = data.goals;
      }

      // Load meals
      const mealsRes = await fetch(`/api/meals?date=${selectedDate}`);
      if (mealsRes.ok) {
        const data = await mealsRes.json();
        setMeals(Array.isArray(data.meals) ? data.meals : []);
        
        // Cache the data
        if (!dataCacheRef.current[cacheKey]) {
          dataCacheRef.current[cacheKey] = {};
        }
        dataCacheRef.current[cacheKey].meals = Array.isArray(data.meals) ? data.meals : [];
      }
    } catch (error) {
      console.error('Error loading data:', error);
      if (!cached) {
        toast.error('Failed to load nutrition data');
      }
    } finally {
      setLoading(false);
    }
  };

  const mealsList = Array.isArray(meals) ? meals : [];

  const getMealData = (mealType) => {
    const meal = mealsList.find(m => m.meal_type === mealType);
    if (!meal) {
      return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    }
    return {
      calories: parseFloat(meal.total_calories || 0),
      protein: parseFloat(meal.total_protein || 0),
      carbs: parseFloat(meal.total_carbs || 0),
      fats: parseFloat(meal.total_fats || 0),
    };
  };

  const handleAddMeal = (mealType) => {
    router.push(`/client/meals/add?type=${mealType}&date=${selectedDate}`);
  };

  const handleMealClick = (mealType) => {
    const meal = mealsList.find(m => m.meal_type === mealType);
    if (meal) {
      router.push(`/client/meals/${meal.id}`);
    }
  };

  // Only show loading if we don't have any data yet
  if (loading && !nutrition && mealsList.length === 0) {
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
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Date Selector */}
        <div>
          <DatePickerStrip
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            className="bg-white rounded-lg p-2 border border-border"
          />
        </div>

        {/* Daily Nutrition Summary */}
        <DailyNutritionDisplay summary={nutrition} goals={goals} />

        {/* Water Intake */}
        <WaterInput
          date={selectedDate}
          currentWater={nutrition?.total_water || 0}
          waterTarget={goals?.water_target || 2000}
          onUpdate={(newTotal) => {
            // Update local state to reflect water change
            if (nutrition) {
              setNutrition({ ...nutrition, total_water: newTotal });
            }
            // Invalidate cache
            const cacheKey = `${selectedDate}`;
            if (dataCacheRef.current[cacheKey]) {
              dataCacheRef.current[cacheKey].nutrition = {
                ...nutrition,
                total_water: newTotal,
              };
            }
          }}
        />

        {/* Meals */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Meals</h2>
          
          <MealCard
            mealType="early_am"
            {...getMealData('early_am')}
            onAdd={() => handleAddMeal('early_am')}
            onClick={() => handleMealClick('early_am')}
          />
          
          <MealCard
            mealType="breakfast"
            {...getMealData('breakfast')}
            onAdd={() => handleAddMeal('breakfast')}
            onClick={() => handleMealClick('breakfast')}
          />
          
          <MealCard
            mealType="lunch"
            {...getMealData('lunch')}
            onAdd={() => handleAddMeal('lunch')}
            onClick={() => handleMealClick('lunch')}
          />
          
          <MealCard
            mealType="dinner"
            {...getMealData('dinner')}
            onAdd={() => handleAddMeal('dinner')}
            onClick={() => handleMealClick('dinner')}
          />
        </div>
      </div>
    </UserLayout>
  );
}

export default function DashboardPage() {
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
      <DashboardPageInner />
    </Suspense>
  );
}
