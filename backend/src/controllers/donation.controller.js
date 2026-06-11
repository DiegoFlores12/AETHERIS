const pool = require('../config/db');

const DONATION_GOAL_KG = 1250;
const PLASTIC_KG_PER_AMOUNT = 0.02;

function getUserIdFromOptionalToken(req) {
  return req.user?.id || null;
}

async function summary(req, res) {
  const total = await pool.query(`
    SELECT COALESCE(SUM(amount),0)::int AS money,
          COALESCE(SUM(plastic_kg),0)::numeric(10,2) AS plastic_kg
    FROM donations
  `);

  const userId = getUserIdFromOptionalToken(req);
  let mine = { money: 0, plastic_kg: 0 };
  if (userId) {
    const my = await pool.query(`
      SELECT COALESCE(SUM(amount),0)::int AS money,
            COALESCE(SUM(plastic_kg),0)::numeric(10,2) AS plastic_kg
      FROM donations
      WHERE user_id=$1
    `, [userId]);
    mine = my.rows[0];
  }

  const plasticKg = Number(total.rows[0].plastic_kg || 0);
  res.json({
    totalMoney: Number(total.rows[0].money || 0),
    totalPlasticKg: plasticKg,
    goalKg: DONATION_GOAL_KG,
    percent: Math.min(100, Math.round((plasticKg / DONATION_GOAL_KG) * 100)),
    myMoney: Number(mine.money || 0),
    myPlasticKg: Number(mine.plastic_kg || 0)
  });
}

async function createDonation(req, res) {
  const amount = Number(req.body.amount || 0);
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Monto inválido' });

  const plasticKg = Number((amount * PLASTIC_KG_PER_AMOUNT).toFixed(2));
  const userId = getUserIdFromOptionalToken(req);

  const { rows } = await pool.query(
    `INSERT INTO donations (user_id, amount, plastic_kg)
     VALUES ($1,$2,$3) RETURNING *`,
    [userId, amount, plasticKg]
  );

  res.status(201).json({
    message: 'Donación registrada',
    donation: rows[0]
  });
}

module.exports = { summary, createDonation };
