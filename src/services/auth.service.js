const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const UserFactory = require('../patterns/UserFactory');

function sign(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '8h' }
  );
}

async function register({ name, rut, email, password, wantsQuestionnaire }) {
  if (!name || !rut || !email || !password) throw new Error('Faltan campos obligatorios');
  if (password.length < 6) throw new Error('La contraseña debe tener mínimo 6 caracteres');

  const hash = await bcrypt.hash(password, 10);
  const userData = UserFactory.create({
    name,
    rut,
    email,
    passwordHash: hash,
    wantsQuestionnaire
  });

  const { rows } = await pool.query(
    `INSERT INTO users (name, rut, email, password_hash, role, profile_completed)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id, name, rut, email, role, profile_completed, is_beneficiary, progress_percent`,
    [
      userData.name,
      userData.rut,
      userData.email,
      userData.passwordHash,
      userData.role,
      userData.profileCompleted
    ]
  );

  return { user: rows[0], token: sign(rows[0]) };
}

async function login({ email, password }) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  const user = rows[0];
  if (!user) throw new Error('Credenciales inválidas');

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error('Credenciales inválidas');

  delete user.password_hash;
  return { user, token: sign(user) };
}

module.exports = { register, login };
