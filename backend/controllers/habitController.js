const mongoose = require('mongoose');

const Habit = require('../models/Habit');

const allowedFields = [
  'name',
  'description',
  'category',
  'difficulty',
  'scheduleType',
  'days',
  'active',
];

const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const sendValidationError = (res, errors) => {
  res.status(400).json({
    message: 'Validation failed',
    errors,
  });
};

const validateHabitInput = (payload, { partial = false } = {}) => {
  const errors = [];
  const nextScheduleType = payload.scheduleType;
  const hasDays = Object.prototype.hasOwnProperty.call(payload, 'days');

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'name')) {
    if (!payload.name || payload.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'category')) {
    if (!Habit.categories.includes(payload.category)) {
      errors.push('Category is invalid');
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'difficulty')) {
    if (!Habit.difficulties.includes(payload.difficulty)) {
      errors.push('Difficulty is invalid');
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'scheduleType')) {
    if (!Habit.scheduleTypes.includes(payload.scheduleType)) {
      errors.push('Schedule type is invalid');
    }
  }

  if (hasDays) {
    if (!Array.isArray(payload.days)) {
      errors.push('Days must be an array');
    } else if (payload.days.some((day) => !Habit.weekdays.includes(day))) {
      errors.push('Days must use valid weekday values');
    }
  }

  if (nextScheduleType === 'selected_days' && (!Array.isArray(payload.days) || payload.days.length === 0)) {
    errors.push('Selected-days habits require at least one day');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'active') && typeof payload.active !== 'boolean') {
    errors.push('Active must be true or false');
  }

  return errors;
};

const pickHabitFields = (body) =>
  allowedFields.reduce((fields, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      fields[field] = body[field];
    }

    return fields;
  }, {});

const createHabit = async (req, res, next) => {
  try {
    const habitInput = pickHabitFields(req.body);
    const errors = validateHabitInput(habitInput);

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const habit = await Habit.create({
      ...habitInput,
      userId: req.user._id,
    });

    return res.status(201).json({
      message: 'Habit created successfully',
      habit,
    });
  } catch (error) {
    return next(error);
  }
};

const getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });

    return res.json({ habits });
  } catch (error) {
    return next(error);
  }
};

const getTodayHabits = async (req, res, next) => {
  try {
    const today = dayMap[new Date().getDay()];
    const habits = await Habit.find({
      userId: req.user._id,
      active: true,
      $or: [{ scheduleType: 'daily' }, { scheduleType: 'selected_days', days: today }],
    }).sort({ createdAt: -1 });

    return res.json({
      today,
      habits,
    });
  } catch (error) {
    return next(error);
  }
};

const updateHabit = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const habit = await Habit.findOne({ _id: id, userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const updates = pickHabitFields(req.body);
    const mergedHabit = {
      ...habit.toObject(),
      ...updates,
    };
    const errors = validateHabitInput(mergedHabit);

    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    Object.assign(habit, updates);
    await habit.save();

    return res.json({
      message: 'Habit updated successfully',
      habit,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteHabit = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const habit = await Habit.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    return res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

const pauseHabit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    if (typeof active !== 'boolean') {
      return sendValidationError(res, ['Active must be true or false']);
    }

    const habit = await Habit.findOne({ _id: id, userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    habit.active = active;
    await habit.save();

    return res.json({
      message: active ? 'Habit resumed successfully' : 'Habit paused successfully',
      habit,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createHabit,
  getHabits,
  getTodayHabits,
  updateHabit,
  deleteHabit,
  pauseHabit,
};
