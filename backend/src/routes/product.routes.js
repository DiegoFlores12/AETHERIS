const router = require('express').Router();
const { authRequired, adminRequired } = require('../middleware/auth');
const controller = require('../controllers/product.controller');

router.get('/', controller.listProducts);
router.get('/admin/all', authRequired, adminRequired, controller.listAllProducts);
router.post('/', authRequired, adminRequired, controller.createProduct);
router.patch('/:productId', authRequired, adminRequired, controller.updateProduct);
router.post('/orders', authRequired, controller.createOrder);
router.get('/orders/mine', authRequired, controller.myOrders);

module.exports = router;
