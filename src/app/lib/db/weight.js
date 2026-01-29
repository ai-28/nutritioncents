const { sql } = require('../db');

async function addWeightEntry(userId, weightKg, date, notes) {
  const userIdStr = String(userId);
  const [entry] = await sql`
    INSERT INTO weight_tracking (user_id, weight_kg, measurement_date, notes)
    VALUES (${userIdStr}, ${weightKg}, ${date}, ${notes || null})
    ON CONFLICT (user_id, measurement_date) 
    DO UPDATE SET weight_kg = ${weightKg}, notes = ${notes || null}
    RETURNING *
  `;
  return entry;
}

async function getWeightEntries(userId, startDate, endDate) {
  const userIdStr = String(userId);
  const entries = await sql`
    SELECT * FROM weight_tracking
    WHERE user_id = ${userIdStr}
      AND measurement_date BETWEEN ${startDate} AND ${endDate}
    ORDER BY measurement_date DESC
  `;
  return entries;
}

async function getLatestWeight(userId) {
  const userIdStr = String(userId);
  const [entry] = await sql`
    SELECT * FROM weight_tracking
    WHERE user_id = ${userIdStr}
    ORDER BY measurement_date DESC
    LIMIT 1
  `;
  return entry || null;
}

async function deleteWeightEntry(entryId, userId) {
  const userIdStr = String(userId);
  const [deleted] = await sql`
    DELETE FROM weight_tracking
    WHERE id = ${entryId} AND user_id = ${userIdStr}
    RETURNING id
  `;
  return deleted;
}

module.exports = {
  addWeightEntry,
  getWeightEntries,
  getLatestWeight,
  deleteWeightEntry,
};
