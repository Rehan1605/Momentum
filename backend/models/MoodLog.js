const mongoose = require('mongoose');
const { startOfDay } = require('./HabitLog');

const moods = ['great', 'good', 'okay', 'bad', 'terrible'];

const moodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      set: startOfDay,
    },
    mood: {
      type: String,
      required: [true, 'Mood is required'],
      enum: {
        values: moods,
        message: 'Invalid mood',
      },
    },
    note: {
      type: String,
      trim: true,
      maxlength: [300, 'Note must be 300 characters or fewer'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

moodLogSchema.index({ userId: 1, date: 1 }, { unique: true });

moodLogSchema.pre('validate', function normalizeMoodDate() {
  this.date = startOfDay(this.date);
});

module.exports = mongoose.model('MoodLog', moodLogSchema);
module.exports.moods = moods;
