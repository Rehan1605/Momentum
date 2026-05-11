const HabitLog = require('../models/HabitLog');
const UserBadge = require('../models/UserBadge');
const statsService = require('./statsService');

const badgeDefinitions = [
  {
    badgeKey: 'consistency_starter',
    badgeName: 'Consistency Starter',
    isUnlocked: ({ metrics }) => metrics.totalCompletedLogs >= 1,
  },
  {
    badgeKey: 'seven_day_streak',
    badgeName: '7 Day Warrior',
    isUnlocked: ({ metrics }) => metrics.overallCurrentStreak >= 7,
  },
  {
    badgeKey: 'thirty_day_streak',
    badgeName: '30 Day Beast',
    isUnlocked: ({ metrics }) => metrics.overallCurrentStreak >= 30,
  },
  {
    badgeKey: 'century_club',
    badgeName: '100 Habit Legend',
    isUnlocked: ({ metrics }) => metrics.totalCompletedLogs >= 100,
  },
  {
    badgeKey: 'weekend_warrior',
    badgeName: 'Weekend Warrior',
    isUnlocked: ({ weekendCompletedLogs }) => weekendCompletedLogs >= 5,
  },
  {
    badgeKey: 'learning_machine',
    badgeName: 'Learning Machine',
    isUnlocked: ({ categoryPercent }) => (categoryPercent.get('Learning') || 0) >= 80,
  },
  {
    badgeKey: 'fitness_fighter',
    badgeName: 'Fitness Fighter',
    isUnlocked: ({ categoryPercent }) => (categoryPercent.get('Fitness') || 0) >= 80,
  },
];

const countWeekendCompletedLogs = async (userId) => {
  const completedLogs = await HabitLog.find({
    userId,
    completed: true,
  }).lean();

  return completedLogs.filter((log) => {
    const day = new Date(log.date).getDay();
    return day === 0 || day === 6;
  }).length;
};

const getEvaluationContext = async (userId) => {
  const metrics = await statsService.getBadgeMetrics(userId);
  const weekendCompletedLogs = await countWeekendCompletedLogs(userId);
  const categoryPercent = new Map(
    metrics.categoryBreakdown.map((category) => [
      category.category,
      category.completionPercent,
    ])
  );

  return {
    metrics,
    weekendCompletedLogs,
    categoryPercent,
  };
};

const evaluateUserBadges = async (userId) => {
  const context = await getEvaluationContext(userId);
  const earnedDefinitions = badgeDefinitions.filter((badge) => badge.isUnlocked(context));

  if (earnedDefinitions.length > 0) {
    await Promise.all(
      earnedDefinitions.map((badge) =>
        UserBadge.updateOne(
          {
            userId,
            badgeKey: badge.badgeKey,
          },
          {
            $setOnInsert: {
              userId,
              badgeKey: badge.badgeKey,
              badgeName: badge.badgeName,
              unlockedAt: new Date(),
            },
          },
          { upsert: true, timestamps: false }
        )
      )
    );
  }

  return UserBadge.find({ userId }).sort({ unlockedAt: -1 });
};

const getAllBadgesWithStatus = async (userId) => {
  const unlockedBadges = await evaluateUserBadges(userId);
  const unlockedMap = new Map(unlockedBadges.map((badge) => [badge.badgeKey, badge]));

  return badgeDefinitions.map((definition) => {
    const unlockedBadge = unlockedMap.get(definition.badgeKey);

    return {
      badgeKey: definition.badgeKey,
      badgeName: definition.badgeName,
      unlocked: Boolean(unlockedBadge),
      unlockedAt: unlockedBadge ? unlockedBadge.unlockedAt : null,
    };
  });
};

const getUnlockedBadges = async (userId) => {
  await evaluateUserBadges(userId);
  return UserBadge.find({ userId }).sort({ unlockedAt: -1 });
};

module.exports = {
  badgeDefinitions,
  evaluateUserBadges,
  getAllBadgesWithStatus,
  getUnlockedBadges,
};
