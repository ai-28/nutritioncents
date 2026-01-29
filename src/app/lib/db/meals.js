const { sql } = require('../db');

async function createMeal(userId, mealData) {
  const { mealType, mealDate, inputMethod, items, notes } = mealData;
  const userIdStr = String(userId);

  let mealId;

  // Start transaction
  await sql.begin(async sql => {
    // Create or update meal (upsert) - handle duplicate meal per day constraint
    const [meal] = await sql`
      INSERT INTO meals (user_id, meal_type, meal_date, input_method, notes)
      VALUES (${userIdStr}, ${mealType}, ${mealDate}, ${inputMethod || 'manual'}, ${notes || null})
      ON CONFLICT (user_id, meal_date, meal_type)
      DO UPDATE SET
        input_method = EXCLUDED.input_method,
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    mealId = meal.id;

    // Delete existing meal items before inserting new ones
    await sql`DELETE FROM meal_items WHERE meal_id = ${mealId}`;

    // Insert meal items
    if (items && items.length > 0) {
      for (const item of items) {
        await sql`
          INSERT INTO meal_items (
            meal_id, food_name, quantity, unit, calories, protein, carbs, fats,
            fiber, sugar, sodium, barcode, source_image_url, confidence_score
          ) VALUES (
            ${mealId},
            ${item.food_name},
            ${item.quantity},
            ${item.unit},
            ${item.calories || 0},
            ${item.protein || 0},
            ${item.carbs || 0},
            ${item.fats || 0},
            ${item.fiber || 0},
            ${item.sugar || 0},
            ${item.sodium || 0},
            ${item.barcode || null},
            ${item.source_image_url || null},
            ${item.confidence_score || 1.0}
          )
        `;
      }
    }
  });

  // Get full meal with items
  return await getMealById(mealId);
}

async function getMealById(mealId) {
  const mealIdStr = String(mealId);
  const [meal] = await sql`
    SELECT * FROM meals WHERE id = ${mealIdStr}
  `;

  if (!meal) return null;

  const items = await sql`
    SELECT * FROM meal_items 
    WHERE meal_id = ${mealIdStr} 
    ORDER BY created_at
  `;

  meal.items = items;
  return meal;
}

async function getMealsByDate(userId, date) {
  const userIdStr = String(userId);
  const meals = await sql`
    SELECT m.*
    FROM meals m
    WHERE m.user_id = ${userIdStr} AND m.meal_date = ${date}
    ORDER BY 
      CASE m.meal_type
        WHEN 'early_am' THEN 1
        WHEN 'breakfast' THEN 2
        WHEN 'lunch' THEN 3
        WHEN 'dinner' THEN 4
      END
  `;

  // Get items for each meal
  for (const meal of meals) {
    const items = await sql`
      SELECT * FROM meal_items WHERE meal_id = ${meal.id} ORDER BY created_at
    `;
    meal.items = items;
  }

  return meals;
}

async function getMealsByDateRange(userId, startDate, endDate) {
  const userIdStr = String(userId);
  const meals = await sql`
    SELECT m.*
    FROM meals m
    WHERE m.user_id = ${userIdStr} AND m.meal_date BETWEEN ${startDate} AND ${endDate}
    ORDER BY m.meal_date DESC, 
      CASE m.meal_type
        WHEN 'early_am' THEN 1
        WHEN 'breakfast' THEN 2
        WHEN 'lunch' THEN 3
        WHEN 'dinner' THEN 4
      END
  `;

  // Get items for each meal
  for (const meal of meals) {
    const items = await sql`
      SELECT * FROM meal_items WHERE meal_id = ${meal.id} ORDER BY created_at
    `;
    meal.items = items;
  }

  return meals;
}

async function updateMeal(mealId, userId, updates) {
  const { notes, items, mealType, mealDate } = updates;
  const userIdStr = String(userId);

  await sql.begin(async sql => {
    // Update meal fields - update each field separately if provided
    if (notes !== undefined) {
      await sql`
        UPDATE meals 
        SET notes = ${notes}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${mealId} AND user_id = ${userIdStr}
      `;
    }
    if (mealType !== undefined) {
      await sql`
        UPDATE meals 
        SET meal_type = ${mealType}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${mealId} AND user_id = ${userIdStr}
      `;
    }
    if (mealDate !== undefined) {
      await sql`
        UPDATE meals 
        SET meal_date = ${mealDate}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${mealId} AND user_id = ${userIdStr}
      `;
    }
    // If only updated_at needs to be updated (when only items change)
    if (items && notes === undefined && mealType === undefined && mealDate === undefined) {
      await sql`
        UPDATE meals 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${mealId} AND user_id = ${userIdStr}
      `;
    }

    // Update items if provided
    if (items) {
      // Delete existing items
      await sql`DELETE FROM meal_items WHERE meal_id = ${mealId}`;

      // Insert new items
      for (const item of items) {
        await sql`
          INSERT INTO meal_items (
            meal_id, food_name, quantity, unit, calories, protein, carbs, fats,
            fiber, sugar, sodium, barcode, source_image_url, confidence_score, is_edited
          ) VALUES (
            ${mealId},
            ${item.food_name},
            ${item.quantity},
            ${item.unit},
            ${item.calories || 0},
            ${item.protein || 0},
            ${item.carbs || 0},
            ${item.fats || 0},
            ${item.fiber || 0},
            ${item.sugar || 0},
            ${item.sodium || 0},
            ${item.barcode || null},
            ${item.source_image_url || null},
            ${item.confidence_score || 1.0},
            ${item.is_edited || false}
          )
        `;
      }
    }
  });

  return await getMealById(mealId);
}

async function deleteMeal(mealId, userId) {
  const userIdStr = String(userId);
  const mealIdStr = String(mealId);
  const [deleted] = await sql`
    DELETE FROM meals 
    WHERE id = ${mealIdStr} AND user_id = ${userIdStr} 
    RETURNING id
  `;
  return deleted;
}

async function getDailyNutritionSummary(userId, date) {
  const userIdStr = String(userId);
  const [summary] = await sql`
    SELECT * FROM daily_nutrition_summary 
    WHERE user_id = ${userIdStr} AND summary_date = ${date}
  `;

  if (summary) {
    return summary;
  }

  // If no summary exists, calculate from meals
  const meals = await getMealsByDate(userId, date);
  const calculatedSummary = {
    user_id: userId,
    summary_date: date,
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fats: 0,
    total_fiber: 0,
    total_sodium: 0,
    total_sugar: 0,
    meal_count: meals.length,
  };

  meals.forEach(meal => {
    calculatedSummary.total_calories += parseFloat(meal.total_calories || 0);
    calculatedSummary.total_protein += parseFloat(meal.total_protein || 0);
    calculatedSummary.total_carbs += parseFloat(meal.total_carbs || 0);
    calculatedSummary.total_fats += parseFloat(meal.total_fats || 0);
    calculatedSummary.total_fiber += parseFloat(meal.total_fiber || 0);
    calculatedSummary.total_sodium += parseFloat(meal.total_sodium || 0);
    calculatedSummary.total_sugar += parseFloat(meal.total_sugar || 0);
  });

  return calculatedSummary;
}

module.exports = {
  createMeal,
  getMealById,
  getMealsByDate,
  getMealsByDateRange,
  updateMeal,
  deleteMeal,
  getDailyNutritionSummary,
};
