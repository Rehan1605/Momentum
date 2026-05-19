const express = require('express');

const {
  chat,
  insights,
  motivate,
  weeklySummary,
} = require('../controllers/aiController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/chat', chat);
router.post('/coach', chat);
router.get('/weekly-summary', weeklySummary);
router.get('/insights', insights);
router.get('/motivate', motivate);

module.exports = router;
