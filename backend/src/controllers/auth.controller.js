const authService = require('../services/auth.service');
const pool = require('../config/db');

async function register(req, res) {
  try {
    const data = await authService.register(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function login(req, res) {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
}

async function me(req, res) {
  const { rows } = await pool.query(
    'SELECT id, name, rut, email, role, profile_completed, is_beneficiary, progress_percent, last_recycling_at, created_at FROM users WHERE id=$1',
    [req.user.id]
  );
  res.json(rows[0]);
}

module.exports = { register, login, me };
