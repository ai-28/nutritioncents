// Simple in-memory user store
// In production, replace this with a database (PostgreSQL, MongoDB, etc.)

let users = [];
let userIdCounter = 1;

export function addUser(user) {
  const newUser = {
    id: userIdCounter++,
    ...user,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  return newUser;
}

export function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

export function findUserById(id) {
  return users.find(u => u.id === id);
}

export function getAllUsers() {
  return users;
}
