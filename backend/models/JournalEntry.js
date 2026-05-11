const mongoose = require('mongoose');
const { startOfDay } = require('./HabitLog');

const journalEntrySchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      minlength: [1, 'Content is required'],
      maxlength: [2000, 'Content must be 2000 characters or fewer'],
    },
  },
  {
    timestamps: true,
  }
);

journalEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

journalEntrySchema.pre('validate', function normalizeJournalDate() {
  this.date = startOfDay(this.date);
});

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
