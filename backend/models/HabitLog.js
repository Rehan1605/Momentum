const mongoose = require('mongoose');

const startOfDay = (value = new Date()) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

const habitLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: [true, 'Habit is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      set: startOfDay,
    },
    completed: {
      type: Boolean,
      required: true,
      default: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

habitLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

habitLogSchema.pre('validate', function normalizeLogDate() {
  this.date = startOfDay(this.date);

  if (this.completed) {
    this.completedAt = this.completedAt || new Date();
  } else {
    this.completedAt = null;
  }
});

habitLogSchema.pre('findOneAndUpdate', function normalizeLogUpdate() {
  const update = this.getUpdate();
  const target = update.$set || update;

  if (target.date) {
    target.date = startOfDay(target.date);
  }

  if (Object.prototype.hasOwnProperty.call(target, 'completed')) {
    target.completedAt = target.completed ? new Date() : null;
  }

  if (update.$set) {
    update.$set = target;
  }

  this.setUpdate(update);
});

module.exports = mongoose.model('HabitLog', habitLogSchema);
module.exports.startOfDay = startOfDay;
