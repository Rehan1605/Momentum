const badgeService = require('../services/badgeService');

const getBadges = async (req, res, next) => {
  try {
    const badges = await badgeService.getAllBadgesWithStatus(req.user._id);
    return res.json(badges);
  } catch (error) {
    return next(error);
  }
};

const getUnlockedBadges = async (req, res, next) => {
  try {
    const badges = await badgeService.getUnlockedBadges(req.user._id);
    return res.json(badges);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getBadges,
  getUnlockedBadges,
};
