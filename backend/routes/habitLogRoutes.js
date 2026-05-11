const express = require('express');

const {
  checkHabit,
  getLogHistory,
  getTodayLogStatus,
} = require('../controllers/habitLogController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/check', checkHabit);
router.get('/history', getLogHistory);
router.get('/today', getTodayLogStatus);

module.exports = router;
