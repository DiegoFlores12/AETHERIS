const pool = require('../config/db');

async function findActive(filters = {}) {
  const params = [];
  const where = ['active=TRUE'];
  if (filters.category) { params.push(filters.category); where.push(`category=$${params.length}`); }
  if (filters.material) { params.push(filters.material); where.push(`material=$${params.length}`); }
  const { rows } = await pool.query(`SELECT * FROM products WHERE ${where.join(' AND ')} ORDER BY id`, params);
  return rows;
}

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
  return rows;
}

async function create(data) {
  const { name, category, type, material, recycledPercent, weightGrams, price, stock, imageUrl } = data;
  const { rows } = await pool.query(
    `INSERT INTO products (name, category, type, material, recycled_percent, weight_grams, price, stock, image_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [name, category, type, material, recycledPercent || 0, weightGrams || 0, price, stock || 0, imageUrl || null]
  );
  return rows[0];
}

async function update(id, data) {
  const { name, category, type, material, recycledPercent, weightGrams, price, stock, imageUrl, active } = data;
  const { rows } = await pool.query(
      `UPDATE products
      SET name=COALESCE($1,name), category=COALESCE($2,category), type=COALESCE($3,type),
          material=COALESCE($4,material), recycled_percent=COALESCE($5,recycled_percent),
          weight_grams=COALESCE($6,weight_grams), price=COALESCE($7,price), stock=COALESCE($8,stock),
          image_url=COALESCE($9,image_url), active=COALESCE($10,active)
     WHERE id=$11 RETURNING *`,
    [name || null, category || null, type || null, material || null,
      recycledPercent === undefined ? null : Number(recycledPercent),
      weightGrams === undefined ? null : Number(weightGrams),
      price === undefined ? null : Number(price),
      stock === undefined ? null : Number(stock), imageUrl || null,
      active === undefined ? null : Boolean(active), id]
  );
  return rows[0];
}

module.exports = { findActive, findAll, create, update };
