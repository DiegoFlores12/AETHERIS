const pool = require('../config/db');

async function dashboard(req, res) {
  const users = await pool.query('SELECT COUNT(*)::int total FROM users WHERE role <> $1', ['admin']);
  const orders = await pool.query('SELECT COUNT(*)::int total FROM orders');
  const beneficiaries = await pool.query('SELECT COUNT(*)::int total FROM users WHERE is_beneficiary=TRUE');
  const qrPlastic = await pool.query('SELECT COALESCE(SUM(progress_percent),0)::int total FROM users');
  const donations = await pool.query(`SELECT COALESCE(SUM(amount),0)::int money, COALESCE(SUM(plastic_kg),0)::numeric(10,2) plastic FROM donations`);
  const inventory = await pool.query(`SELECT COUNT(*)::int products, COALESCE(SUM(stock),0)::int stock FROM products WHERE active=TRUE`);
  const chart = await pool.query(`
    SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS day, COALESCE(SUM(amount),0)::int amount
    FROM donations
    GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
    ORDER BY day ASC
    LIMIT 7
  `);

  res.json({
    users: users.rows[0].total,
    orders: orders.rows[0].total,
    beneficiaries: beneficiaries.rows[0].total,
    recycledKg: Math.round(qrPlastic.rows[0].total * 0.12),
    donationMoney: Number(donations.rows[0].money || 0),
    donationPlasticKg: Number(donations.rows[0].plastic || 0),
    inventoryProducts: inventory.rows[0].products,
    inventoryStock: inventory.rows[0].stock,
    donationChart: chart.rows
  });
}

async function listUsers(req, res) {
  const { rows } = await pool.query(`
    SELECT id, name, rut, email, role, profile_completed, is_beneficiary, progress_percent, created_at
    FROM users
    WHERE role <> 'admin'
    ORDER BY created_at DESC
  `);
  res.json(rows);
}

async function setBeneficiary(req, res) {
  const { userId } = req.params;
  const { isBeneficiary } = req.body;
  const { rows } = await pool.query(
    'UPDATE users SET is_beneficiary=$1 WHERE id=$2 RETURNING id, name, is_beneficiary',
    [Boolean(isBeneficiary), userId]
  );
  res.json(rows[0]);
}

async function listOrders(req, res) {
  const { rows } = await pool.query(`
    SELECT o.id, o.status, o.quantity, o.total, o.plastic_kg, o.created_at,
          u.name AS user_name, u.email AS user_email, p.name AS product_name
    FROM orders o
    LEFT JOIN users u ON u.id=o.user_id
    LEFT JOIN products p ON p.id=o.product_id
    ORDER BY o.created_at DESC
  `);
  res.json(rows);
}

async function updateOrder(req, res) {
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: 'Estado requerido' });
  const { rows } = await pool.query('UPDATE orders SET status=$1 WHERE id=$2 RETURNING *', [status, req.params.orderId]);
  if (!rows[0]) return res.status(404).json({ message: 'Orden no encontrada' });
  res.json(rows[0]);
}

async function listDonations(req, res) {
  const { rows } = await pool.query(`
    SELECT d.id, d.amount, d.plastic_kg, d.created_at, u.name AS user_name, u.email AS user_email
    FROM donations d
    LEFT JOIN users u ON u.id=d.user_id
    ORDER BY d.created_at DESC
  `);
  res.json(rows);
}

module.exports = { dashboard, listUsers, setBeneficiary, listOrders, updateOrder, listDonations };
