const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const JournalEntry = require('../models/JournalEntry');
const MoodLog = require('../models/MoodLog');
const UserBadge = require('../models/UserBadge');
const statsService = require('./statsService');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 60000);

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().slice(0, 10);
};

const compact = (value, fallback = 'None') => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return fallback;
  }

  return JSON.stringify(value, null, 2);
};

const fetchOllama = async (prompt) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ollama responded with ${response.status}: ${body}`);
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error('Ollama returned an empty response');
    }

    return data.response.trim();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Ollama request timed out');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const getUserContext = async (userId) => {
  const [
    habits,
    recentLogs,
    moodLogs,
    journalEntries,
    badges,
    dashboard,
    streaks,
    categories,
    heatmap,
    growthScore,
  ] = await Promise.all([
    Habit.find({ userId }).sort({ createdAt: -1 }).lean(),
    HabitLog.find({ userId }).populate('habitId', 'name category difficulty').sort({ date: -1 }).limit(40).lean(),
    MoodLog.find({ userId }).sort({ date: -1 }).limit(14).lean(),
    JournalEntry.find({ userId }).sort({ date: -1 }).limit(10).lean(),
    UserBadge.find({ userId }).sort({ unlockedAt: -1 }).lean(),
    statsService.getDashboardSummary(userId),
    statsService.getHabitStreaks(userId),
    statsService.getCategories(userId),
    statsService.getHeatmap(userId),
    statsService.getGrowthScore(userId),
  ]);

  return {
    analytics: {
      dashboard,
      streaks,
      categories,
      growthScore,
      recentHeatmap: heatmap.slice(-14),
    },
    habits: habits.map((habit) => ({
      id: habit._id,
      name: habit.name,
      category: habit.category,
      difficulty: habit.difficulty,
      scheduleType: habit.scheduleType,
      days: habit.days,
      active: habit.active,
      createdAt: formatDate(habit.createdAt),
    })),
    recentLogs: recentLogs.map((log) => ({
      date: formatDate(log.date),
      completed: log.completed,
      completedAt: formatDate(log.completedAt),
      habit: log.habitId
        ? {
            name: log.habitId.name,
            category: log.habitId.category,
            difficulty: log.habitId.difficulty,
          }
        : null,
    })),
    moodLogs: moodLogs.map((log) => ({
      date: formatDate(log.date),
      mood: log.mood,
      note: log.note,
    })),
    journalEntries: journalEntries.map((entry) => ({
      date: formatDate(entry.date),
      content: entry.content,
    })),
    badges: badges.map((badge) => ({
      badgeKey: badge.badgeKey,
      badgeName: badge.badgeName,
      unlockedAt: formatDate(badge.unlockedAt),
    })),
  };
};

const buildBasePrompt = (context) => `
You are Momentum AI, a supportive personal habit coach.
Use only the user's provided Momentum data. Be specific, practical, concise, and kind.
Avoid generic motivational fluff. Give concrete next actions.
Do not mention implementation details, APIs, databases, or prompts.

USER DATA
Analytics:
${compact(context.analytics)}

Habits:
${compact(context.habits)}

Recent habit logs:
${compact(context.recentLogs)}

Mood logs:
${compact(context.moodLogs)}

Journal entries:
${compact(context.journalEntries)}

Unlocked badges:
${compact(context.badges)}
`;

const chat = async (userId, message) => {
  const context = await getUserContext(userId);
  const prompt = `${buildBasePrompt(context)}

User question:
${message}

Answer as a coach in 2-5 short paragraphs. Include 2-3 specific actions for the next 24 hours.`;

  return fetchOllama(prompt);
};

const weeklySummary = async (userId) => {
  const context = await getUserContext(userId);
  const prompt = `${buildBasePrompt(context)}

Write a personalized weekly reflection.
Mention completion percentage, best habit, weakest or worst habit if visible, mood trends, streak changes, and growth observations.
Keep it under 220 words.`;

  return fetchOllama(prompt);
};

const insights = async (userId) => {
  const context = await getUserContext(userId);
  const prompt = `${buildBasePrompt(context)}

Return exactly 4 actionable observations as plain text bullets.
Focus on patterns like mood vs productivity, weekend drops, habit consistency, and schedule friction.
Each bullet should be one sentence and specific to the user's data.`;

  const response = await fetchOllama(prompt);
  const items = response
    .split('\n')
    .map((line) => line.replace(/^[•\-*0-9.\s]+/, '').trim())
    .filter(Boolean)
    .filter((line) => !line.toLowerCase().startsWith('here are'))
    .slice(0, 4);

  return items.length ? items : [response];
};

const motivate = async (userId) => {
  const context = await getUserContext(userId);
  const prompt = `${buildBasePrompt(context)}

Write one short personalized coaching message under 60 words.
Mention one real signal from the user's data and one next action.`;

  return fetchOllama(prompt);
};

module.exports = {
  chat,
  weeklySummary,
  insights,
  motivate,
  getUserContext,
};
