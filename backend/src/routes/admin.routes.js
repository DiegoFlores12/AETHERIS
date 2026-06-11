const router = require('express').Router();
const { authRequired, adminRequired } = require('../middleware/auth');
const controller = require('../controllers/admin.controller');

router.get('/dashboard', authRequired, adminRequired, controller.dashboard);
router.get('/users', authRequired, adminRequired, controller.listUsers);
router.patch('/users/:userId/beneficiary', authRequired, adminRequired, controller.setBeneficiary);
router.get('/orders', authRequired, adminRequired, controller.listOrders);
router.patch('/orders/:orderId', authRequired, adminRequired, controller.updateOrder);
router.get('/donations', authRequired, adminRequired, controller.listDonations);

module.exports = router;
