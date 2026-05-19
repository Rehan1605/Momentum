const aiService = require('../services/aiService');

const unavailable = (res, error) =>
  res.status(503).json({
    message: 'Momentum AI is unavailable. Make sure Ollama is running with llama3.2.',
    error: error.message,
  });

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const reply = await aiService.chat(req.user._id, message.trim());
    return res.json({ reply });
  } catch (error) {
    return unavailable(res, error);
  }
};

const weeklySummary = async (req, res) => {
  try {
    const summary = await aiService.weeklySummary(req.user._id);
    return res.json({ summary });
  } catch (error) {
    return unavailable(res, error);
  }
};

const insights = async (req, res) => {
  try {
    const items = await aiService.insights(req.user._id);
    return res.json({ insights: items });
  } catch (error) {
    return unavailable(res, error);
  }
};

const motivate = async (req, res) => {
  try {
    const message = await aiService.motivate(req.user._id);
    return res.json({ message });
  } catch (error) {
    return unavailable(res, error);
  }
};

module.exports = {
  chat,
  weeklySummary,
  insights,
  motivate,
};
