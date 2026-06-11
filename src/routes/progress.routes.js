const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const controller = require('../controllers/progress.controller');

router.post('/scan', authRequired, controller.scanQr);

module.exports = router;
