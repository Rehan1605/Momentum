const express = require('express');

const {
  createHabit,
  deleteHabit,
  getHabits,
  getTodayHabits,
  pauseHabit,
  updateHabit,
} = require('../controllers/habitController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createHabit);
router.get('/', getHabits);
router.get('/today', getTodayHabits);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.patch('/:id/pause', pauseHabit);

module.exports = router;
