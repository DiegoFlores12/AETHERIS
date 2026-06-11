const pool = require('../config/db');
const productRepository = require('../repositories/product.repository');
const orderFacade = require('../patterns/OrderFacade');

async function listProducts(req, res) {
  const rows = await productRepository.findActive(req.query);
  res.json(rows);
}

async function listAllProducts(req, res) {
  const rows = await productRepository.findAll();
  res.json(rows);
}

async function createProduct(req, res) {
  const { name, category, type, material, price } = req.body;
  if (!name || !category || !type || !material || price == null) {
    return res.status(400).json({ message: 'Faltan campos del producto' });
  }
  const product = await productRepository.create(req.body);
  res.status(201).json(product);
}

async function updateProduct(req, res) {
  const product = await productRepository.update(req.params.productId, req.body);
  if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json(product);
}

async function createOrder(req, res) {
  try {
    const order = await orderFacade.createOrder({
      userId: req.user.id,
      productId: req.body.productId
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function myOrders(req, res) {
  const { rows } = await pool.query(`
    SELECT o.id, o.status, o.quantity, o.total, o.plastic_kg, o.created_at,
          p.name AS product_name, p.type, p.material, p.image_url
    FROM orders o
    JOIN products p ON p.id=o.product_id
    WHERE o.user_id=$1
    ORDER BY o.created_at DESC
  `, [req.user.id]);
  res.json(rows);
}

module.exports = { listProducts, listAllProducts, createProduct, updateProduct, createOrder, myOrders };
