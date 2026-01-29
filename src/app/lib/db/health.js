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

module.exports = {
  getAllergies,
  createAllergy,
  checkMealForAllergens,
  getHealthConditions,
  createHealthCondition,
  getHealthRecommendations,
  getDietaryRestrictions,
  createDietaryRestriction,
};
