const express = require('express');

const {
  getCategories,
  getDashboard,
  getGrowthScore,
  getHeatmap,
  getStreaks,
} = require('../controllers/statsController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/streaks', getStreaks);
router.get('/categories', getCategories);
router.get('/heatmap', getHeatmap);
router.get('/growth-score', getGrowthScore);

module.exports = router;
