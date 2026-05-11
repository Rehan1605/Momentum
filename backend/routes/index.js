const express = require('express');

const aiRoutes = require('./aiRoutes');
const authRoutes = require('./authRoutes');
const badgeRoutes = require('./badgeRoutes');
const habitLogRoutes = require('./habitLogRoutes');
const habitRoutes = require('./habitRoutes');
const journalRoutes = require('./journalRoutes');
const moodRoutes = require('./moodRoutes');
const statsRoutes = require('./statsRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Momentum backend running',
  });
});

router.use('/auth', authRoutes);
router.use('/habits', habitRoutes);
router.use('/logs', habitLogRoutes);
router.use('/stats', statsRoutes);
router.use('/mood', moodRoutes);
router.use('/journal', journalRoutes);
router.use('/badges', badgeRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
