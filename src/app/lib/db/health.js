const { sql } = require('../db');

// Allergies
async function getAllergies(userId) {
  const userIdStr = String(userId);
  const allergies = await sql`
    SELECT * FROM allergies
    WHERE user_id = ${userIdStr} AND is_active = TRUE
    ORDER BY severity DESC, created_at DESC
  `;
  return allergies;
}

async function createAllergy(userId, allergyData) {
  const userIdStr = String(userId);
  const { allergenName, allergenCategory, severity, reactionDescription, diagnosedBy, diagnosedDate } = allergyData;
  
  const [allergy] = await sql`
    INSERT INTO allergies (
      user_id, allergen_name, allergen_category, severity, 
      reaction_description, diagnosed_by, diagnosed_date
    ) VALUES (
      ${userIdStr}, ${allergenName}, ${allergenCategory || null}, ${severity || 'moderate'},
      ${reactionDescription || null}, ${diagnosedBy || null}, ${diagnosedDate || null}
    )
    ON CONFLICT (user_id, allergen_name) 
    DO UPDATE SET 
      severity = ${severity || 'moderate'},
      is_active = TRUE,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return allergy;
}

async function checkMealForAllergens(userId, mealItems) {
  const userIdStr = String(userId);
  const allergies = await getAllergies(userIdStr);
  const alerts = [];
  
  for (const item of mealItems) {
    const foodName = item.food_name?.toLowerCase() || '';
    
    for (const allergy of allergies) {
      const allergenName = allergy.allergen_name.toLowerCase();
      
      if (foodName.includes(allergenName) || allergenName.includes(foodName)) {
        const alertLevel = 
          allergy.severity === 'life_threatening' || allergy.severity === 'severe' 
            ? 'critical' 
            : allergy.severity === 'moderate' 
            ? 'warning' 
            : 'info';
        
        alerts.push({
          allergen_id: allergy.id,
          allergen_name: allergy.allergen_name,
          severity: allergy.severity,
          detected_in: item.food_name,
          alert_level: alertLevel,
        });
      }
    }
  }
  
  return alerts;
}

// Health Conditions
async function getHealthConditions(userId) {
  const userIdStr = String(userId);
  const conditions = await sql`
    SELECT * FROM health_conditions
    WHERE user_id = ${userIdStr} AND is_active = TRUE
    ORDER BY created_at DESC
  `;
  return conditions;
}

async function createHealthCondition(userId, conditionData) {
  const userIdStr = String(userId);
  const { conditionName, conditionCategory, diagnosisDate, severity, isManaged, managementNotes, doctorName } = conditionData;
  
  const [condition] = await sql`
    INSERT INTO health_conditions (
      user_id, condition_name, condition_category, diagnosis_date,
      severity, is_managed, management_notes, doctor_name
    ) VALUES (
      ${userIdStr}, ${conditionName}, ${conditionCategory || null}, ${diagnosisDate || null},
      ${severity || null}, ${isManaged !== undefined ? isManaged : true},
      ${managementNotes || null}, ${doctorName || null}
    )
    RETURNING *
  `;
  return condition;
}

async function getHealthRecommendations(userId) {
  const conditions = await getHealthConditions(userId);
  const recommendations = [];
  
  for (const condition of conditions) {
    const category = condition.condition_category?.toLowerCase();
    let recs = [];
    
    if (category === 'metabolic' || condition.condition_name?.toLowerCase().includes('diabetes')) {
      recs = [
        'Monitor carbohydrate intake carefully',
        'Maintain consistent meal timing',
        'Track blood sugar levels if applicable',
        'Focus on low glycemic index foods',
      ];
    } else if (category === 'cardiovascular' || condition.condition_name?.toLowerCase().includes('heart')) {
      recs = [
        'Limit sodium intake to < 2g per day',
        'Focus on heart-healthy fats (omega-3)',
        'Monitor cholesterol levels',
        'Increase fiber intake',
      ];
    } else if (category === 'digestive') {
      recs = [
        'Track fiber intake (aim for 25-30g daily)',
        'Identify and avoid trigger foods',
        'Maintain a food diary',
        'Stay hydrated',
      ];
    } else {
      recs = ['Follow medical advice and dietary recommendations'];
    }
    
    recommendations.push({
      condition: condition.condition_name,
      category: condition.condition_category,
      recommendations: recs,
      management_notes: condition.management_notes,
    });
  }
  
  return recommendations;
}

// Dietary Restrictions
async function getDietaryRestrictions(userId) {
  const userIdStr = String(userId);
  const restrictions = await sql`
    SELECT * FROM dietary_restrictions
    WHERE user_id = ${userIdStr} AND is_active = TRUE
    ORDER BY created_at DESC
  `;
  return restrictions;
}

async function createDietaryRestriction(userId, restrictionData) {
  const userIdStr = String(userId);
  const { restrictionType, restrictionName, strictness, notes } = restrictionData;
  
  const [restriction] = await sql`
    INSERT INTO dietary_restrictions (
      user_id, restriction_type, restriction_name, strictness, notes
    ) VALUES (
      ${userIdStr}, ${restrictionType}, ${restrictionName || null}, 
      ${strictness || 'moderate'}, ${notes || null}
    )
    RETURNING *
  `;
  return restriction;
}

async function updateDietaryRestriction(restrictionId, userId, updates) {
  const userIdStr = String(userId);
  const restrictionIdStr = String(restrictionId);
  
  const [restriction] = await sql`
    UPDATE dietary_restrictions 
    SET 
      restriction_type = ${updates.restriction_type},
      restriction_name = ${updates.restriction_name},
      strictness = ${updates.strictness},
      notes = ${updates.notes},
      is_active = ${updates.is_active !== undefined ? updates.is_active : true},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${restrictionIdStr} AND user_id = ${userIdStr}
    RETURNING *
  `;
  return restriction;
}

async function deleteDietaryRestriction(restrictionId, userId) {
  const userIdStr = String(userId);
  const restrictionIdStr = String(restrictionId);
  
  const [restriction] = await sql`
    UPDATE dietary_restrictions 
    SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${restrictionIdStr} AND user_id = ${userIdStr}
    RETURNING *
  `;
  return restriction;
}

// Health Goals
async function getHealthGoals(userId) {
  const userIdStr = String(userId);
  const goals = await sql`
    SELECT * FROM health_goals
    WHERE user_id = ${userIdStr} AND is_active = TRUE
    ORDER BY priority DESC, created_at DESC
  `;
  return goals;
}

async function createHealthGoal(userId, goalData) {
  const userIdStr = String(userId);
  const { goalType, goalName, targetWeightKg, currentWeightKg, targetDate, priority, notes } = goalData;
  
  const [goal] = await sql`
    INSERT INTO health_goals (
      user_id, goal_type, goal_name, target_weight_kg, current_weight_kg, 
      target_date, priority, notes
    ) VALUES (
      ${userIdStr}, ${goalType}, ${goalName || null}, 
      ${targetWeightKg || null}, ${currentWeightKg || null},
      ${targetDate || null}, ${priority || 1}, ${notes || null}
    )
    RETURNING *
  `;
  return goal;
}

async function updateHealthGoal(goalId, userId, updates) {
  const userIdStr = String(userId);
  const goalIdStr = String(goalId);
  
  const [goal] = await sql`
    UPDATE health_goals 
    SET 
      goal_type = ${updates.goal_type},
      goal_name = ${updates.goal_name},
      target_weight_kg = ${updates.target_weight_kg},
      current_weight_kg = ${updates.current_weight_kg},
      target_date = ${updates.target_date},
      priority = ${updates.priority},
      notes = ${updates.notes},
      is_active = ${updates.is_active !== undefined ? updates.is_active : true},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${goalIdStr} AND user_id = ${userIdStr}
    RETURNING *
  `;
  return goal;
}

module.exports = {
  getAllergies,
  createAllergy,
  checkMealForAllergens,
  getHealthConditions,
  createHealthCondition,
  getHealthRecommendations,
  getDietaryRestrictions,
  createDietaryRestriction,
  updateDietaryRestriction,
  deleteDietaryRestriction,
  getHealthGoals,
  createHealthGoal,
  updateHealthGoal,
};
