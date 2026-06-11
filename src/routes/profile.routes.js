const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const controller = require('../controllers/profile.controller');

router.post('/questionnaire', authRequired, controller.saveQuestionnaire);

module.exports = router;
