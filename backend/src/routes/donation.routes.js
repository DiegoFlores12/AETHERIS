const router = require('express').Router();
const jwt = require('jsonwebtoken');
const controller = require('../controllers/donation.controller');

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret'); } catch {}
  next();
}

router.get('/summary', optionalAuth, controller.summary);
router.post('/', optionalAuth, controller.createDonation);

module.exports = router;
