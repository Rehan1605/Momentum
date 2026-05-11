const mongoose = require('mongoose');

const JournalEntry = require('../models/JournalEntry');
const MoodLog = require('../models/MoodLog');
const { startOfDay } = require('../models/HabitLog');

const parseDate = (value, fallback = new Date()) => {
  const normalized = startOfDay(value || fallback);
  return normalized;
};

const sendValidationError = (res, errors) => {
  res.status(400).json({
    message: 'Validation failed',
    errors,
  });
};

const buildDateFilter = (query) => {
  const { start, end } = query;
  const filter = {};
  const errors = [];

  if (start || end) {
    filter.date = {};

    if (start) {
      const startDate = parseDate(start);

      if (!startDate) {
        errors.push('Start date is malformed');
      } else {
        filter.date.$gte = startDate;
      }
    }

    if (end) {
      const endDate = parseDate(end);

      if (!endDate) {
        errors.push('End date is malformed');
      } else {
        filter.date.$lte = endDate;
      }
    }
  }

  return { filter, errors };
};

const validateMoodInput = ({ date, mood, note }, { partial = false } = {}) => {
  const errors = [];

  if (date !== undefined && !parseDate(date)) {
    errors.push('Date is malformed');
  }

  if (!partial || mood !== undefined) {
    if (!MoodLog.moods.includes(mood)) {
      errors.push('Mood is invalid');
    }
  }

  if (note !== undefined && note.length > 300) {
    errors.push('Note must be 300 characters or fewer');
  }

  return errors;
};

const validateJournalInput = ({ date, content }, { partial = false } = {}) => {
  const errors = [];

  if (date !== undefined && !parseDate(date)) {
    errors.push('Date is malformed');
  }

  if (!partial || content !== undefined) {
    if (!content || !content.trim()) {
      errors.push('Content is required');
    } else if (content.length > 2000) {
      errors.push('Content must be 2000 characters or fewer');
    }
  }

  return errors;
};

const upsertMood = async (req, res, next) => {
  try {
    const { date, mood, note = '' } = req.body;
    const normalizedDate = parseDate(date);
    const errors = validateMoodInput({ date, mood, note });

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const moodLog = await MoodLog.findOneAndUpdate(
      {
        userId: req.user._id,
        date: normalizedDate,
      },
      {
        $set: {
          mood,
          note,
        },
        $setOnInsert: {
          userId: req.user._id,
          date: normalizedDate,
        },
      },
      {
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        upsert: true,
      }
    );

    return res.json({
      message: 'Mood saved successfully',
      moodLog,
    });
  } catch (error) {
    return next(error);
  }
};

const getMoodHistory = async (req, res, next) => {
  try {
    const { filter, errors } = buildDateFilter(req.query);

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const moodLogs = await MoodLog.find({
      userId: req.user._id,
      ...filter,
    }).sort({ date: -1 });

    return res.json({ moodLogs });
  } catch (error) {
    return next(error);
  }
};

const updateMood = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Mood log not found' });
    }

    const updates = {};

    ['date', 'mood', 'note'].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    const errors = validateMoodInput(updates, { partial: true });

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    if (updates.date) {
      updates.date = parseDate(updates.date);
    }

    const moodLog = await MoodLog.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!moodLog) {
      return res.status(404).json({ message: 'Mood log not found' });
    }

    return res.json({
      message: 'Mood updated successfully',
      moodLog,
    });
  } catch (error) {
    return next(error);
  }
};

const upsertJournal = async (req, res, next) => {
  try {
    const { date, content } = req.body;
    const normalizedDate = parseDate(date);
    const errors = validateJournalInput({ date, content });

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const journalEntry = await JournalEntry.findOneAndUpdate(
      {
        userId: req.user._id,
        date: normalizedDate,
      },
      {
        $set: {
          content,
        },
        $setOnInsert: {
          userId: req.user._id,
          date: normalizedDate,
        },
      },
      {
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        upsert: true,
      }
    );

    return res.json({
      message: 'Journal entry saved successfully',
      journalEntry,
    });
  } catch (error) {
    return next(error);
  }
};

const getJournalEntries = async (req, res, next) => {
  try {
    const { filter, errors } = buildDateFilter(req.query);

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const journalEntries = await JournalEntry.find({
      userId: req.user._id,
      ...filter,
    }).sort({ date: -1 });

    return res.json({ journalEntries });
  } catch (error) {
    return next(error);
  }
};

const updateJournal = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    const updates = {};

    ['date', 'content'].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    const errors = validateJournalInput(updates, { partial: true });

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    if (updates.date) {
      updates.date = parseDate(updates.date);
    }

    const journalEntry = await JournalEntry.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!journalEntry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    return res.json({
      message: 'Journal entry updated successfully',
      journalEntry,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteJournal = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    const journalEntry = await JournalEntry.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!journalEntry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    return res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  upsertMood,
  getMoodHistory,
  updateMood,
  upsertJournal,
  getJournalEntries,
  updateJournal,
  deleteJournal,
};
