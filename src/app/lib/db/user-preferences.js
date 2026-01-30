const { sql } = require('../db');

async function getUserPreferences(userId) {
  const userIdStr = String(userId);
  const [preferences] = await sql`
    SELECT * FROM user_preferences
    WHERE user_id = ${userIdStr}
  `;
  return preferences || null;
}

async function createOrUpdateUserPreferences(userId, preferencesData) {
  const userIdStr = String(userId);
  const {
    preferredInputMethod,
    typicalBreakfast,
    typicalLunch,
    typicalDinner,
    commonFoods,
    portionPreferences,
    correctionHistory,
  } = preferencesData;

  const [preferences] = await sql`
    INSERT INTO user_preferences (
      user_id, preferred_input_method, typical_breakfast, typical_lunch, typical_dinner,
      common_foods, portion_preferences, correction_history
    ) VALUES (
      ${userIdStr},
      ${preferredInputMethod || 'voice'},
      ${typicalBreakfast || null},
      ${typicalLunch || null},
      ${typicalDinner || null},
      ${commonFoods ? JSON.stringify(commonFoods) : null}::JSONB,
      ${portionPreferences ? JSON.stringify(portionPreferences) : null}::JSONB,
      ${correctionHistory ? JSON.stringify(correctionHistory) : null}::JSONB
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      preferred_input_method = ${preferredInputMethod || 'voice'},
      typical_breakfast = ${typicalBreakfast || null},
      typical_lunch = ${typicalLunch || null},
      typical_dinner = ${typicalDinner || null},
      common_foods = ${commonFoods ? JSON.stringify(commonFoods) : null}::JSONB,
      portion_preferences = ${portionPreferences ? JSON.stringify(portionPreferences) : null}::JSONB,
      correction_history = ${correctionHistory ? JSON.stringify(correctionHistory) : null}::JSONB,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return preferences;
}

async function addCommonFood(userId, foodName) {
  const preferences = await getUserPreferences(userId);
  const commonFoods = preferences?.common_foods || [];
  
  if (!commonFoods.includes(foodName)) {
    commonFoods.push(foodName);
    // Keep only last 50 foods
    if (commonFoods.length > 50) {
      commonFoods.shift();
    }
  }
  
  return await createOrUpdateUserPreferences(userId, { commonFoods });
}

async function addCorrectionHistory(userId, correction) {
  const preferences = await getUserPreferences(userId);
  const correctionHistory = preferences?.correction_history || [];
  
  correctionHistory.push({
    ...correction,
    timestamp: new Date().toISOString(),
  });
  
  // Keep only last 100 corrections
  if (correctionHistory.length > 100) {
    correctionHistory.shift();
  }
  
  return await createOrUpdateUserPreferences(userId, { correctionHistory });
}

module.exports = {
  getUserPreferences,
  createOrUpdateUserPreferences,
  addCommonFood,
  addCorrectionHistory,
};
