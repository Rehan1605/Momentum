const mongoose = require('mongoose');

const categories = ['Fitness', 'Learning', 'Mindset', 'Health', 'Productivity', 'Personal'];
const difficulties = ['easy', 'medium', 'hard'];
const scheduleTypes = ['daily', 'selected_days'];
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      minlength: [2, 'Habit name must be at least 2 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: categories,
        message: 'Invalid category',
      },
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: difficulties,
        message: 'Invalid difficulty',
      },
    },
    scheduleType: {
      type: String,
      required: [true, 'Schedule type is required'],
      enum: {
        values: scheduleTypes,
        message: 'Invalid schedule type',
      },
    },
    days: {
      type: [String],
      default: [],
      validate: [
        {
          validator(days) {
            return days.every((day) => weekdays.includes(day));
          },
          message: 'Days must use valid weekday values',
        },
        {
          validator(days) {
            return this.scheduleType !== 'selected_days' || days.length > 0;
          },
          message: 'Selected-days habits require at least one day',
        },
      ],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

habitSchema.pre('validate', function normalizeDays() {
  if (this.scheduleType === 'daily') {
    this.days = [];
  }
});

module.exports = mongoose.model('Habit', habitSchema);
module.exports.categories = categories;
module.exports.difficulties = difficulties;
module.exports.scheduleTypes = scheduleTypes;
module.exports.weekdays = weekdays;
