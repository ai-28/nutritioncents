const { sql } = require('../db');

async function getClientProfile(userId) {
  const userIdStr = String(userId);
  const [profile] = await sql`
    SELECT * FROM client_profiles WHERE user_id = ${userIdStr}
  `;
  return profile || null;
}

async function createOrUpdateClientProfile(userId, profileData) {
  const {
    dateOfBirth,
    gender,
    heightCm,
    weightKg,
    activityLevel,
    avatarUrl,
    onboardingCompleted = false,
  } = profileData;

  // Check if profile exists
  const existing = await getClientProfile(userId);

  if (existing) {
    // Update existing profile
    const [updated] = await sql`
      UPDATE client_profiles
      SET 
        date_of_birth = ${dateOfBirth || existing.date_of_birth},
        gender = ${gender || existing.gender},
        height_cm = ${heightCm || existing.height_cm},
        weight_kg = ${weightKg || existing.weight_kg},
        activity_level = ${activityLevel || existing.activity_level},
        avatar_url = ${avatarUrl || existing.avatar_url},
        onboarding_completed = ${onboardingCompleted !== undefined ? onboardingCompleted : existing.onboarding_completed},
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${String(userId)}
      RETURNING *
    `;
    return updated;
  } else {
    // Create new profile
    const [created] = await sql`
      INSERT INTO client_profiles (
        user_id, date_of_birth, gender, height_cm, weight_kg, 
        activity_level, avatar_url, onboarding_completed
      )
      VALUES (
        ${String(userId)}, ${dateOfBirth}, ${gender}, ${heightCm}, ${weightKg},
        ${activityLevel}, ${avatarUrl}, ${onboardingCompleted}
      )
      RETURNING *
    `;
    return created;
  }
}

async function checkOnboardingStatus(userId) {
  const profile = await getClientProfile(userId);
  return profile?.onboarding_completed || false;
}

module.exports = {
  getClientProfile,
  createOrUpdateClientProfile,
  checkOnboardingStatus,
};
