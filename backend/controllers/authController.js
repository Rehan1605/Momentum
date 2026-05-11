const validator = require('validator');

const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

const validateRegisterInput = ({ name, email, password }) => {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  return errors;
};

const validateLoginInput = ({ email, password }) => {
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  }

  return errors;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const errors = validateRegisterInput({ name, email, password });

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(user._id),
      user: formatUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const errors = validateLoginInput({ email, password });

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      message: 'Logged in successfully',
      token: generateToken(user._id),
      user: formatUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res) => {
  return res.json({
    user: formatUser(req.user),
  });
};

const logout = async (req, res) => {
  return res.json({
    message: 'Logged out successfully',
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};
