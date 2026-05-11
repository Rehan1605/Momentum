const express = require('express');

const {
  deleteJournal,
  getJournalEntries,
  updateJournal,
  upsertJournal,
} = require('../controllers/wellbeingController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', upsertJournal);
router.get('/', getJournalEntries);
router.put('/:id', updateJournal);
router.delete('/:id', deleteJournal);

module.exports = router;
