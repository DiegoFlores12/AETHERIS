const pool = require('../config/db');

class OrderFacade {
  async createOrder({ userId, productId }) {
    if (!productId) {
      throw new Error('Producto requerido');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const productResult = await client.query(
        'SELECT * FROM products WHERE id=$1 AND active=TRUE AND stock > 0 FOR UPDATE',
        [productId]
      );

      const product = productResult.rows[0];
      if (!product) {
        throw new Error('Producto sin stock o inexistente');
      }

      await client.query(
        'UPDATE products SET stock = stock - 1 WHERE id=$1',
        [productId]
      );

      const plasticKg = Number(
        ((Number(product.weight_grams || 0) * Number(product.recycled_percent || 0)) / 100000).toFixed(2)
      );

      const orderResult = await client.query(
        `INSERT INTO orders (user_id, product_id, status, quantity, total, plastic_kg)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING *`,
        [userId, productId, 'pendiente', 1, product.price, plasticKg]
      );

      await client.query('COMMIT');
      return orderResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new OrderFacade();
