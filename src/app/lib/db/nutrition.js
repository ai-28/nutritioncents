const { sql } = require('../db');

async function getActiveNutritionGoals(userId, date) {
  const userIdStr = String(userId);
  const [goal] = await sql`
    SELECT * FROM nutrition_goals 
    WHERE user_id = ${userIdStr} 
      AND is_active = TRUE
      AND start_date <= ${date}
      AND (end_date IS NULL OR end_date >= ${date})
    ORDER BY created_at DESC
    LIMIT 1
  `;

  return goal || null;
}

async function createNutritionGoal(userId, goalData) {
  const userIdStr = String(userId);
  const {
    caloriesTarget,
    proteinTarget,
    carbsTarget,
    fatsTarget,
    fiberTarget,
    sodiumTarget,
    sugarTarget,
    waterTarget,
    startDate,
    endDate,
    healthGoalId,
  } = goalData;

  // Check if there's an active goal for this user (check for any active goal)
  const today = new Date().toISOString().split('T')[0];
  const existingGoal = await getActiveNutritionGoals(userIdStr, today);

  if (existingGoal) {
    // Update existing goal instead of creating a new one
    const updates = {
      calories_target: caloriesTarget,
      protein_target: proteinTarget || 0,
      carbs_target: carbsTarget || 0,
      fats_target: fatsTarget || 0,
      fiber_target: fiberTarget || 0,
      sodium_target: sodiumTarget || 0,
      sugar_target: sugarTarget || 0,
      water_target: waterTarget || 0,
      start_date: startDate || new Date().toISOString().split('T')[0],
      end_date: endDate || null,
      health_goal_id: healthGoalId || null,
      is_active: true,
    };

    return await updateNutritionGoal(existingGoal.id, userIdStr, updates);
  }

  // No existing goal, create a new one
  // Deactivate any other active goals first
  await sql`
    UPDATE nutrition_goals 
    SET is_active = FALSE 
    WHERE user_id = ${userIdStr} AND is_active = TRUE
  `;

  const [goal] = await sql`
    INSERT INTO nutrition_goals (
      user_id, health_goal_id, calories_target, protein_target, carbs_target, fats_target,
      fiber_target, sodium_target, sugar_target, water_target, start_date, end_date
    ) VALUES (
      ${userIdStr},
      ${healthGoalId || null},
      ${caloriesTarget},
      ${proteinTarget || 0},
      ${carbsTarget || 0},
      ${fatsTarget || 0},
      ${fiberTarget || 0},
      ${sodiumTarget || 0},
      ${sugarTarget || 0},
      ${waterTarget || 0},
      ${startDate || new Date().toISOString().split('T')[0]},
      ${endDate || null}
    )
    RETURNING *
  `;

  return goal;
}

async function updateNutritionGoal(goalId, userId, updates) {
  const userIdStr = String(userId);
  const goalIdStr = String(goalId);
  
  if (Object.keys(updates).length === 0) {
    throw new Error('No fields to update');
  }

  // Update all provided fields - since we're always providing all values from createNutritionGoal
  const [goal] = await sql`
    UPDATE nutrition_goals 
    SET 
      calories_target = ${updates.calories_target},
      protein_target = ${updates.protein_target},
      carbs_target = ${updates.carbs_target},
      fats_target = ${updates.fats_target},
      fiber_target = ${updates.fiber_target},
      sodium_target = ${updates.sodium_target},
      sugar_target = ${updates.sugar_target},
      water_target = ${updates.water_target},
      start_date = ${updates.start_date},
      end_date = ${updates.end_date},
      health_goal_id = ${updates.health_goal_id},
      is_active = ${updates.is_active},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${goalIdStr} AND user_id = ${userIdStr}
    RETURNING *
  `;

  return goal;
}

module.exports = {
  getActiveNutritionGoals,
  createNutritionGoal,
  updateNutritionGoal,
};
