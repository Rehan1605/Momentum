const express = require('express');

const {
  getMoodHistory,
  updateMood,
  upsertMood,
} = require('../controllers/wellbeingController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', upsertMood);
router.get('/history', getMoodHistory);
router.put('/:id', updateMood);

module.exports = router;
