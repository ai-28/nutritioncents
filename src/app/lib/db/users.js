const { sql } = require('../db');
const bcrypt = require('bcryptjs');

async function createUser({ email, password, name, role = 'client' }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await sql`
    INSERT INTO users (email, password_hash, name, role) 
    VALUES (${email}, ${hashedPassword}, ${name}, ${role}) 
    RETURNING id, email, name, role, created_at
  `;
  return user;
}

async function findUserByEmail(email) {
  if (!email) return null;
  // Use LOWER for case-insensitive comparison
  const [user] = await sql`
    SELECT * FROM users WHERE LOWER(email) = LOWER(${email})
  `;
  return user || null;
}

async function findUserById(id) {
  const idStr = String(id);
  const [user] = await sql`
    SELECT id, email, name, role, created_at, last_login_at 
    FROM users 
    WHERE id = ${idStr} AND is_active = TRUE
  `;
  return user || null;
}

async function updateUserLastLogin(userId) {
  const userIdStr = String(userId);
  await sql`
    UPDATE users 
    SET last_login_at = CURRENT_TIMESTAMP 
    WHERE id = ${userIdStr}
  `;
}

async function verifyPassword(user, password) {
  if (!user || !user.password_hash) return false;
  return await bcrypt.compare(password, user.password_hash);
}

async function getAllClients() {
  const clients = await sql`
        SELECT 
            id,
            name,
            email,
            created_at,
            last_login_at,
            is_active
        FROM users 
        WHERE role = 'client'
        ORDER BY created_at DESC
    `;
  return clients || [];
}

async function getAllAdmins() {
  const admins = await sql`
        SELECT 
            id,
            name,
            email,
            created_at,
            last_login_at,
            is_active
        FROM users 
        WHERE role = 'admin'
        ORDER BY created_at DESC
    `;
  return admins || [];
}

async function updateUser(userId, updates) {
  const userIdStr = String(userId);
  let hasUpdates = false;

  await sql.begin(async sql => {
    if (updates.name !== undefined) {
      await sql`
        UPDATE users 
        SET name = ${updates.name}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${userIdStr}
      `;
      hasUpdates = true;
    }
    if (updates.email !== undefined) {
      await sql`
        UPDATE users 
        SET email = ${updates.email}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${userIdStr}
      `;
      hasUpdates = true;
    }
    if (updates.password !== undefined) {
      const hashedPassword = await bcrypt.hash(updates.password, 10);
      await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${userIdStr}
      `;
      hasUpdates = true;
    }
    if (updates.is_active !== undefined) {
      await sql`
        UPDATE users 
        SET is_active = ${updates.is_active}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${userIdStr}
      `;
      hasUpdates = true;
    }
    if (updates.role !== undefined) {
      await sql`
        UPDATE users 
        SET role = ${updates.role}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${userIdStr}
      `;
      hasUpdates = true;
    }
  });

  if (!hasUpdates) {
    return null;
  }

  // Return updated user
  const [user] = await sql`
    SELECT id, email, name, role, created_at, last_login_at, is_active
    FROM users 
    WHERE id = ${userIdStr}
  `;
  return user || null;
}

async function deleteUser(userId) {
  const userIdStr = String(userId);
  // Soft delete by setting is_active to false
  const [user] = await sql`
    UPDATE users 
    SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${userIdStr}
    RETURNING id, email, name, role
  `;
  return user || null;
}

async function hardDeleteClient(userId) {
  const userIdStr = String(userId);
  // Hard delete - this will cascade delete all related records due to ON DELETE CASCADE
  // First check if user exists and is a client
  const [user] = await sql`
    SELECT id, email, name, role
    FROM users 
    WHERE id = ${userIdStr} AND role = 'client'
  `;

  if (!user) {
    return null;
  }

  // Delete in proper order to avoid trigger conflicts
  // 1. Delete meals first - trigger will update daily_nutrition_summary while user still exists
  await sql`
    DELETE FROM meals 
    WHERE user_id = ${userIdStr}
  `;

  // 2. Delete daily_nutrition_summary (trigger may have created/updated records)
  await sql`
    DELETE FROM daily_nutrition_summary 
    WHERE user_id = ${userIdStr}
  `;

  // 3. Delete the user - CASCADE will handle all remaining related data
  await sql`
    DELETE FROM users 
    WHERE id = ${userIdStr}
  `;

  return user;
}

async function getDashboardStats() {
  // Get active users count (clients with is_active = true)
  const [activeUsersResult] = await sql`
    SELECT COUNT(*) as count
    FROM users 
    WHERE role = 'client' AND is_active = TRUE
  `;
  const activeUsers = parseInt(activeUsersResult?.count || 0);

  // Get new registrations this month
  const [newThisMonthResult] = await sql`
    SELECT COUNT(*) as count
    FROM users 
    WHERE role = 'client' 
      AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
      AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  `;
  const newThisMonth = parseInt(newThisMonthResult?.count || 0);

  // Get users who logged in today
  const [loggedInTodayResult] = await sql`
    SELECT COUNT(*) as count
    FROM users 
    WHERE role = 'client' 
      AND last_login_at >= CURRENT_DATE
      AND last_login_at < CURRENT_DATE + INTERVAL '1 day'
  `;
  const loggedInToday = parseInt(loggedInTodayResult?.count || 0);

  return {
    activeUsers,
    newThisMonth,
    loggedInToday,
  };
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserLastLogin,
  verifyPassword,
  getAllClients,
  getAllAdmins,
  updateUser,
  deleteUser,
  hardDeleteClient,
  getDashboardStats,
};
