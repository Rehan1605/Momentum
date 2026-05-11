const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const difficultyWeights = {
  easy: 1,
  medium: 3,
  hard: 5,
};

const startOfDay = (value = new Date()) => HabitLog.startOfDay(value);

const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return startOfDay(next);
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const percentage = (completed, total) => {
  if (!total) {
    return 0;
  }

  return Math.round((completed / total) * 100);
};

const isHabitEligibleOnDate = (habit, date) => {
  if (!habit.active) {
    return false;
  }

  if (startOfDay(habit.createdAt) > date) {
    return false;
  }

  if (habit.scheduleType === 'daily') {
    return true;
  }

  return habit.days.includes(dayMap[date.getDay()]);
};

const getDateRange = (days, endDate = startOfDay()) => {
  const dates = [];
  const startDate = addDays(endDate, -(days - 1));

  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    dates.push(date);
  }

  return dates;
};

const buildCompletedLogMap = (logs) => {
  const map = new Map();

  logs.forEach((log) => {
    const habitId = log.habitId.toString();
    const dateKey = formatDateKey(startOfDay(log.date));
    map.set(`${habitId}:${dateKey}`, Boolean(log.completed));
  });

  return map;
};

const getUserAnalyticsData = async (userId, daysBack = 90) => {
  const today = startOfDay();
  const rangeStart = addDays(today, -(daysBack - 1));
  const habits = await Habit.find({ userId }).lean();
  const logs = await HabitLog.find({
    userId,
    date: { $gte: rangeStart, $lte: today },
  }).lean();

  return {
    today,
    rangeStart,
    habits,
    activeHabits: habits.filter((habit) => habit.active),
    logs,
    completedLogMap: buildCompletedLogMap(logs),
  };
};

const getScheduledOccurrences = (habits, dates) => {
  const occurrences = [];

  dates.forEach((date) => {
    habits.forEach((habit) => {
      if (isHabitEligibleOnDate(habit, date)) {
        occurrences.push({ habit, date });
      }
    });
  });

  return occurrences;
};

const isOccurrenceCompleted = (completedLogMap, habit, date) =>
  completedLogMap.get(`${habit._id.toString()}:${formatDateKey(date)}`) === true;

const calculateCompletionPercent = (habits, completedLogMap, days, today) => {
  const dates = getDateRange(days, today);
  const occurrences = getScheduledOccurrences(habits, dates);
  const completed = occurrences.filter(({ habit, date }) =>
    isOccurrenceCompleted(completedLogMap, habit, date)
  ).length;

  return percentage(completed, occurrences.length);
};

const calculateTodayScore = (habits, completedLogMap, today) => {
  const scheduledToday = getScheduledOccurrences(habits, [today]);

  const totals = scheduledToday.reduce(
    (score, { habit, date }) => {
      const weight = difficultyWeights[habit.difficulty] || 1;
      score.total += weight;

      if (isOccurrenceCompleted(completedLogMap, habit, date)) {
        score.completed += weight;
      }

      return score;
    },
    { completed: 0, total: 0 }
  );

  return {
    todayScore: percentage(totals.completed, totals.total),
    completedToday: scheduledToday.filter(({ habit, date }) =>
      isOccurrenceCompleted(completedLogMap, habit, date)
    ).length,
  };
};

const isProductiveDay = (habits, completedLogMap, date) =>
  getScheduledOccurrences(habits, [date]).some(({ habit }) =>
    isOccurrenceCompleted(completedLogMap, habit, date)
  );

const calculateOverallStreaks = (habits, completedLogMap, today) => {
  if (!habits.length) {
    return {
      current: 0,
      longest: 0,
    };
  }

  const firstCreatedAt = habits.reduce((earliest, habit) => {
    const createdAt = startOfDay(habit.createdAt);
    return createdAt < earliest ? createdAt : earliest;
  }, startOfDay(habits[0].createdAt));

  let current = 0;

  for (let date = today; date >= firstCreatedAt; date = addDays(date, -1)) {
    if (!isProductiveDay(habits, completedLogMap, date)) {
      break;
    }

    current += 1;
  }

  let longest = 0;
  let running = 0;

  for (let date = firstCreatedAt; date <= today; date = addDays(date, 1)) {
    if (isProductiveDay(habits, completedLogMap, date)) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  return {
    current,
    longest,
  };
};

const calculateHabitStreak = (habit, completedLogMap, today) => {
  const createdAt = startOfDay(habit.createdAt);
  const scheduledDates = [];

  for (let date = createdAt; date <= today; date = addDays(date, 1)) {
    if (isHabitEligibleOnDate(habit, date)) {
      scheduledDates.push(date);
    }
  }

  let longestStreak = 0;
  let running = 0;

  scheduledDates.forEach((date) => {
    if (isOccurrenceCompleted(completedLogMap, habit, date)) {
      running += 1;
      longestStreak = Math.max(longestStreak, running);
    } else {
      running = 0;
    }
  });

  let currentStreak = 0;

  for (let index = scheduledDates.length - 1; index >= 0; index -= 1) {
    const date = scheduledDates[index];

    if (!isOccurrenceCompleted(completedLogMap, habit, date)) {
      break;
    }

    currentStreak += 1;
  }

  return {
    currentStreak,
    longestStreak,
  };
};

const calculateBestHabit = (habits, completedLogMap, today) => {
  const dates = getDateRange(30, today);
  const scoredHabits = habits.map((habit) => {
    const scheduledDates = dates.filter((date) => isHabitEligibleOnDate(habit, date));
    const completed = scheduledDates.filter((date) =>
      isOccurrenceCompleted(completedLogMap, habit, date)
    ).length;

    return {
      habit,
      completed,
      total: scheduledDates.length,
      completionPercent: percentage(completed, scheduledDates.length),
    };
  });

  const eligible = scoredHabits.filter((entry) => entry.total > 0);

  if (!eligible.length) {
    return null;
  }

  eligible.sort((a, b) => b.completionPercent - a.completionPercent || b.completed - a.completed);

  return {
    habitId: eligible[0].habit._id,
    name: eligible[0].habit.name,
    category: eligible[0].habit.category,
    completionPercent: eligible[0].completionPercent,
  };
};

const calculateCategoryBreakdown = (habits, completedLogMap, today) => {
  const dates = getDateRange(30, today);
  const categoryTotals = new Map();

  habits.forEach((habit) => {
    dates.forEach((date) => {
      if (!isHabitEligibleOnDate(habit, date)) {
        return;
      }

      const existing = categoryTotals.get(habit.category) || { completed: 0, total: 0 };
      existing.total += 1;

      if (isOccurrenceCompleted(completedLogMap, habit, date)) {
        existing.completed += 1;
      }

      categoryTotals.set(habit.category, existing);
    });
  });

  return Array.from(categoryTotals.entries()).map(([category, totals]) => ({
    category,
    completionPercent: percentage(totals.completed, totals.total),
  }));
};

const calculateHeatmapData = (logs, today) => {
  const dates = getDateRange(90, today);
  const completedByDate = logs.reduce((map, log) => {
    if (!log.completed) {
      return map;
    }

    const dateKey = formatDateKey(startOfDay(log.date));
    map.set(dateKey, (map.get(dateKey) || 0) + 1);
    return map;
  }, new Map());

  return dates.map((date) => {
    const dateKey = formatDateKey(date);

    return {
      date: dateKey,
      completedCount: completedByDate.get(dateKey) || 0,
    };
  });
};

const calculateGrowthScore = (habits, completedLogMap, today) => {
  const dates = getDateRange(30, today);
  const occurrences = getScheduledOccurrences(habits, dates);
  const totals = occurrences.reduce(
    (score, { habit, date }) => {
      const weight = difficultyWeights[habit.difficulty] || 1;
      score.total += weight;

      if (isOccurrenceCompleted(completedLogMap, habit, date)) {
        score.completed += weight;
      }

      return score;
    },
    { completed: 0, total: 0 }
  );

  return percentage(totals.completed, totals.total);
};

const getDashboardSummary = async (userId) => {
  const { today, activeHabits, completedLogMap } = await getUserAnalyticsData(userId, 90);
  const todayStats = calculateTodayScore(activeHabits, completedLogMap, today);
  const overallStreaks = calculateOverallStreaks(activeHabits, completedLogMap, today);

  return {
    todayScore: todayStats.todayScore,
    weeklyCompletion: calculateCompletionPercent(activeHabits, completedLogMap, 7, today),
    monthlyCompletion: calculateCompletionPercent(activeHabits, completedLogMap, 30, today),
    overallCurrentStreak: overallStreaks.current,
    overallLongestStreak: overallStreaks.longest,
    bestHabit: calculateBestHabit(activeHabits, completedLogMap, today),
    totalHabits: activeHabits.length,
    completedToday: todayStats.completedToday,
  };
};

const getHabitStreaks = async (userId) => {
  const { today, activeHabits, completedLogMap } = await getUserAnalyticsData(userId, 365);

  return activeHabits.map((habit) => ({
    habitId: habit._id,
    name: habit.name,
    ...calculateHabitStreak(habit, completedLogMap, today),
  }));
};

const getCategories = async (userId) => {
  const { today, activeHabits, completedLogMap } = await getUserAnalyticsData(userId, 30);
  return calculateCategoryBreakdown(activeHabits, completedLogMap, today);
};

const getHeatmap = async (userId) => {
  const { today, logs } = await getUserAnalyticsData(userId, 90);
  return calculateHeatmapData(logs, today);
};

const getGrowthScore = async (userId) => {
  const { today, activeHabits, completedLogMap } = await getUserAnalyticsData(userId, 30);
  return {
    score: calculateGrowthScore(activeHabits, completedLogMap, today),
  };
};

const getBadgeMetrics = async (userId) => {
  const { today, activeHabits, logs, completedLogMap } = await getUserAnalyticsData(userId, 90);
  const overallStreaks = calculateOverallStreaks(activeHabits, completedLogMap, today);

  return {
    overallCurrentStreak: overallStreaks.current,
    totalCompletedLogs: logs.filter((log) => log.completed).length,
    categoryBreakdown: calculateCategoryBreakdown(activeHabits, completedLogMap, today),
  };
};

module.exports = {
  getDashboardSummary,
  getHabitStreaks,
  getCategories,
  getHeatmap,
  getGrowthScore,
  getBadgeMetrics,
};
