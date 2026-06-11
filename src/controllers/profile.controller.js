const pool = require('../config/db');

async function saveQuestionnaire(req, res) {
  const { familyMembers, monthlyIncome, disabilityType, needsDescription } = req.body;
  const score = Number(familyMembers || 1) * 10 + (Number(monthlyIncome || 0) < 500000 ? 40 : 10);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const q = await client.query(
      `INSERT INTO questionnaires (user_id, family_members, monthly_income, disability_type, needs_description, social_score)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, familyMembers || 1, monthlyIncome || 0, disabilityType || '', needsDescription || '', score]
    );
    await client.query(
      `UPDATE users SET role='usuario_voluntario', profile_completed=TRUE WHERE id=$1`,
      [req.user.id]
    );
    await client.query('COMMIT');
    res.status(201).json(q.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
}

module.exports = { saveQuestionnaire };
