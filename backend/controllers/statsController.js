const statsService = require('../services/statsService');

const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await statsService.getDashboardSummary(req.user._id);
    return res.json(dashboard);
  } catch (error) {
    return next(error);
  }
};

const getStreaks = async (req, res, next) => {
  try {
    const streaks = await statsService.getHabitStreaks(req.user._id);
    return res.json(streaks);
  } catch (error) {
    return next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await statsService.getCategories(req.user._id);
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
};

const getHeatmap = async (req, res, next) => {
  try {
    const heatmap = await statsService.getHeatmap(req.user._id);
    return res.json(heatmap);
  } catch (error) {
    return next(error);
  }
};

const getGrowthScore = async (req, res, next) => {
  try {
    const growthScore = await statsService.getGrowthScore(req.user._id);
    return res.json(growthScore);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboard,
  getStreaks,
  getCategories,
  getHeatmap,
  getGrowthScore,
};
