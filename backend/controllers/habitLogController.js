const mongoose = require('mongoose');

const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const parseDate = (value, fallback = new Date()) => {
  const source = value || fallback;
  const normalized = HabitLog.startOfDay(source);

  if (!normalized) {
    return null;
  }

  return normalized;
};

const sendValidationError = (res, errors) => {
  res.status(400).json({
    message: 'Validation failed',
    errors,
  });
};

const checkHabit = async (req, res, next) => {
  try {
    const { habitId, date, completed = true } = req.body;

    if (!mongoose.Types.ObjectId.isValid(habitId)) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    if (typeof completed !== 'boolean') {
      return sendValidationError(res, ['Completed must be true or false']);
    }

    const normalizedDate = parseDate(date);

    if (!normalizedDate) {
      return sendValidationError(res, ['Date is malformed']);
    }

    const habit = await Habit.findOne({ _id: habitId, userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const log = await HabitLog.findOneAndUpdate(
      {
        userId: req.user._id,
        habitId: habit._id,
        date: normalizedDate,
      },
      {
        $set: {
          completed,
          completedAt: completed ? new Date() : null,
        },
        $setOnInsert: {
          userId: req.user._id,
          habitId: habit._id,
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
      message: 'Habit log updated successfully',
      log,
    });
  } catch (error) {
    return next(error);
  }
};

const getLogHistory = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const filter = { userId: req.user._id };

    if (start || end) {
      filter.date = {};

      if (start) {
        const startDate = parseDate(start);

        if (!startDate) {
          return sendValidationError(res, ['Start date is malformed']);
        }

        filter.date.$gte = startDate;
      }

      if (end) {
        const endDate = parseDate(end);

        if (!endDate) {
          return sendValidationError(res, ['End date is malformed']);
        }

        filter.date.$lte = endDate;
      }
    }

    const logs = await HabitLog.find(filter)
      .populate('habitId', 'name category difficulty')
      .sort({ date: -1, updatedAt: -1 });

    return res.json({ logs });
  } catch (error) {
    return next(error);
  }
};

const getTodayLogStatus = async (req, res, next) => {
  try {
    const today = dayMap[new Date().getDay()];
    const todayDate = parseDate();

    const habits = await Habit.find({
      userId: req.user._id,
      active: true,
      $or: [{ scheduleType: 'daily' }, { scheduleType: 'selected_days', days: today }],
    }).sort({ createdAt: -1 });

    const habitIds = habits.map((habit) => habit._id);
    const logs = await HabitLog.find({
      userId: req.user._id,
      habitId: { $in: habitIds },
      date: todayDate,
    });
    const logMap = new Map(logs.map((log) => [log.habitId.toString(), log]));

    const statuses = habits.map((habit) => {
      const log = logMap.get(habit._id.toString());

      return {
        habitId: habit._id,
        name: habit.name,
        category: habit.category,
        difficulty: habit.difficulty,
        completed: Boolean(log && log.completed),
        logId: log ? log._id : null,
      };
    });

    return res.json({
      today,
      date: todayDate,
      habits: statuses,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  checkHabit,
  getLogHistory,
  getTodayLogStatus,
};
