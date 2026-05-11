const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    badgeKey: {
      type: String,
      required: [true, 'Badge key is required'],
      trim: true,
    },
    badgeName: {
      type: String,
      required: [true, 'Badge name is required'],
      trim: true,
    },
    unlockedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userBadgeSchema.index({ userId: 1, badgeKey: 1 }, { unique: true });

module.exports = mongoose.model('UserBadge', userBadgeSchema);
