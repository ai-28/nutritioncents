const { sql } = require('../db');

async function getMealDailyAggregates(userId, startDate, endDate) {
  const userIdStr = String(userId);
  return await sql`
    SELECT
      meal_date AS summary_date,
      COALESCE(SUM(total_calories), 0) AS total_calories,
      COALESCE(SUM(total_protein), 0) AS total_protein,
      COALESCE(SUM(total_carbs), 0) AS total_carbs,
      COALESCE(SUM(total_fats), 0) AS total_fats,
      COALESCE(SUM(total_fiber), 0) AS total_fiber,
      COALESCE(SUM(total_sodium), 0) AS total_sodium,
      COALESCE(SUM(total_sugar), 0) AS total_sugar,
      COUNT(*)::int AS meal_count
    FROM meals
    WHERE user_id = ${userIdStr}
      AND meal_date BETWEEN ${startDate} AND ${endDate}
    GROUP BY meal_date
    ORDER BY meal_date
  `;
}

function mergeDailyRows({ userId, summaryRows, mealAggRows }) {
  const map = new Map();

  (summaryRows || []).forEach((r) => {
    const key = String(r.summary_date).slice(0, 10);
    map.set(key, r);
  });

  // Prefer aggregates from meals (source-of-truth) so UI works even if triggers aren't installed.
  (mealAggRows || []).forEach((r) => {
    const key = String(r.summary_date).slice(0, 10);
    map.set(key, { ...(map.get(key) || {}), user_id: userId, ...r });
  });

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => v);
}

async function getWeeklyNutrition(userId, weekStart) {
  const userIdStr = String(userId);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  const summaryRows = await sql`
    SELECT * FROM daily_nutrition_summary
    WHERE user_id = ${userIdStr}
      AND summary_date BETWEEN ${weekStart} AND ${weekEndStr}
    ORDER BY summary_date
  `;

  const mealAggRows = await getMealDailyAggregates(userIdStr, weekStart, weekEndStr);
  const summaries = mergeDailyRows({ userId, summaryRows, mealAggRows });

  // Calculate averages
  const totals = summaries.reduce((acc, day) => {
    const calories = parseFloat(day.total_calories || 0);
    const mealCount = parseInt(day.meal_count || 0);

    acc.calories += calories;
    acc.protein += parseFloat(day.total_protein || 0);
    acc.carbs += parseFloat(day.total_carbs || 0);
    acc.fats += parseFloat(day.total_fats || 0);

    if (mealCount > 0 || calories > 0) acc.daysLogged += 1;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fats: 0, daysLogged: 0 });

  const daysCount = summaries.length || 1;

  return {
    days: summaries,
    averages: {
      calories: totals.calories / daysCount,
      protein: totals.protein / daysCount,
      carbs: totals.carbs / daysCount,
      fats: totals.fats / daysCount,
    },
    totals,
    daysLogged: totals.daysLogged,
  };
}

async function getMonthlyNutrition(userId, year, month) {
  const userIdStr = String(userId);
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const summaries = await sql`
    SELECT * FROM daily_nutrition_summary
    WHERE user_id = ${userIdStr}
      AND summary_date BETWEEN ${startDate} AND ${endDate}
    ORDER BY summary_date
  `;

  // Calculate weekly breakdowns
  const weeks = [];
  let currentWeek = [];
  let currentWeekStart = null;

  for (const day of summaries) {
    const date = new Date(day.summary_date);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 1 || currentWeekStart === null) {
      if (currentWeek.length > 0) {
        weeks.push({
          weekStart: currentWeekStart,
          days: currentWeek,
          totals: calculateWeekTotals(currentWeek),
        });
      }
      currentWeek = [day];
      currentWeekStart = day.summary_date;
    } else {
      currentWeek.push(day);
    }
  }

  if (currentWeek.length > 0) {
    weeks.push({
      weekStart: currentWeekStart,
      days: currentWeek,
      totals: calculateWeekTotals(currentWeek),
    });
  }

  // Calculate monthly totals
  const monthlyTotals = summaries.reduce((acc, day) => {
    acc.calories += parseFloat(day.total_calories || 0);
    acc.protein += parseFloat(day.total_protein || 0);
    acc.carbs += parseFloat(day.total_carbs || 0);
    acc.fats += parseFloat(day.total_fats || 0);
    acc.daysLogged += 1;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fats: 0, daysLogged: 0 });

  const daysCount = summaries.length || 1;

  return {
    weeks,
    monthly: {
      averages: {
        calories: monthlyTotals.calories / daysCount,
        protein: monthlyTotals.protein / daysCount,
        carbs: monthlyTotals.carbs / daysCount,
        fats: monthlyTotals.fats / daysCount,
      },
      totals: monthlyTotals,
      daysLogged: monthlyTotals.daysLogged,
    },
  };
}

function calculateWeekTotals(days) {
  return days.reduce((acc, day) => {
    acc.calories += parseFloat(day.total_calories || 0);
    acc.protein += parseFloat(day.total_protein || 0);
    acc.carbs += parseFloat(day.total_carbs || 0);
    acc.fats += parseFloat(day.total_fats || 0);
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
}

async function getNutritionTrends(userId, days = 30) {
  const userIdStr = String(userId);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = new Date().toISOString().split('T')[0];

  const summaryRows = await sql`
    SELECT * FROM daily_nutrition_summary
    WHERE user_id = ${userIdStr}
      AND summary_date BETWEEN ${startStr} AND ${endStr}
    ORDER BY summary_date
  `;

  const mealAggRows = await getMealDailyAggregates(userIdStr, startStr, endStr);
  const summaries = mergeDailyRows({ userId, summaryRows, mealAggRows });

  return summaries;
}

module.exports = {
  getWeeklyNutrition,
  getMonthlyNutrition,
  getNutritionTrends,
};
