const { sql } = require('../db');

async function createMealTemplate(userId, templateData) {
  const userIdStr = String(userId);
  const { templateName, mealType, items, totalCalories } = templateData;
  
  const [template] = await sql`
    INSERT INTO meal_templates (user_id, template_name, meal_type, items, total_calories)
    VALUES (${userIdStr}, ${templateName}, ${mealType}, ${JSON.stringify(items)}, ${totalCalories || 0})
    RETURNING *
  `;
  return template;
}

async function getMealTemplates(userId, mealType = null) {
  const userIdStr = String(userId);
  let templates;
  if (mealType) {
    templates = await sql`
      SELECT * FROM meal_templates
      WHERE user_id = ${userIdStr} AND meal_type = ${mealType}
      ORDER BY is_favorite DESC, usage_count DESC, created_at DESC
    `;
  } else {
    templates = await sql`
      SELECT * FROM meal_templates
      WHERE user_id = ${userIdStr}
      ORDER BY is_favorite DESC, usage_count DESC, created_at DESC
    `;
  }
  return templates;
}

async function getMealTemplateById(templateId, userId) {
  const userIdStr = String(userId);
  const [template] = await sql`
    SELECT * FROM meal_templates
    WHERE id = ${templateId} AND user_id = ${userIdStr}
  `;
  return template || null;
}

async function updateMealTemplate(templateId, userId, updates) {
  const userIdStr = String(userId);
  const { templateName, isFavorite, items, totalCalories } = updates;
  
  const updateFields = {};
  if (templateName !== undefined) updateFields.template_name = templateName;
  if (isFavorite !== undefined) updateFields.is_favorite = isFavorite;
  if (items !== undefined) updateFields.items = JSON.stringify(items);
  if (totalCalories !== undefined) updateFields.total_calories = totalCalories;
  
  const setParts = [];
  const values = [];
  let paramIndex = 1;
  
  for (const [key, value] of Object.entries(updateFields)) {
    setParts.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }
  
  values.push(templateId, userIdStr);
  
  const [template] = await sql.unsafe(`
    UPDATE meal_templates 
    SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    RETURNING *
  `, values);
  
  return template;
}

async function incrementTemplateUsage(templateId) {
  await sql`
    UPDATE meal_templates
    SET usage_count = usage_count + 1
    WHERE id = ${templateId}
  `;
}

async function deleteMealTemplate(templateId, userId) {
  const userIdStr = String(userId);
  const [deleted] = await sql`
    DELETE FROM meal_templates
    WHERE id = ${templateId} AND user_id = ${userIdStr}
    RETURNING id
  `;
  return deleted;
}

module.exports = {
  createMealTemplate,
  getMealTemplates,
  getMealTemplateById,
  updateMealTemplate,
  incrementTemplateUsage,
  deleteMealTemplate,
};
