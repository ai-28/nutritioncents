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

  // Deactivate existing goals
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
  if (Object.keys(updates).length === 0) {
    throw new Error('No fields to update');
  }

  // Build update query dynamically
  const setParts = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      setParts.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  values.push(goalId, userIdStr);

  // Use raw query for dynamic updates
  const [goal] = await sql.unsafe(`
    UPDATE nutrition_goals 
    SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    RETURNING *
  `, values);

  return goal;
}

module.exports = {
  getActiveNutritionGoals,
  createNutritionGoal,
  updateNutritionGoal,
};
