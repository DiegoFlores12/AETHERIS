const router = require('express').Router();
const { authRequired, adminRequired } = require('../middleware/auth');
const controller = require('../controllers/news.controller');

router.get('/', controller.listNews);
router.post('/', authRequired, adminRequired, controller.createNews);
router.post('/:newsId/reactions', authRequired, controller.reactNews);

module.exports = router;
