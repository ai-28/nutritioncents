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

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserLastLogin,
    verifyPassword,
};
