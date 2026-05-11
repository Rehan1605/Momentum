const express = require('express');

const {
  getBadges,
  getUnlockedBadges,
} = require('../controllers/badgeController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getBadges);
router.get('/unlocked', getUnlockedBadges);

module.exports = router;
