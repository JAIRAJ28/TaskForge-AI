// controllers/auth.controller.js
const SignupModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
  console.log(req?.body)
  try {
    const { name, password } = req.body || {};
    if (!name || String(name).trim().length < 3) {
      return res.status(400).json({ error: true, message: 'Invalid name' });
    }
    if (!password || String(password).length < 3) {
      return res.status(400).json({ error: true, message: 'Password must be ≥ 3 chars' });
    }
    const exists = await SignupModel.findOne({ name: String(name).trim() }).lean();
    if (exists) {
      return res.status(409).json({ error: true, message: 'Name already taken' });
    }
    const hash = await bcrypt.hash(password, 5);
    const user = await SignupModel.create({ name: String(name).trim(), password: hash });
    const token = jwt.sign(
      { userId: user._id.toString(), name: user.name },
      process.env.SECRET_KEY,
      { expiresIn: '7d' }
    );
    return res.status(201).json({
      error: false,
      message: 'Registered',
      user: { id: user._id, name: user.name },
      token,
    });
  } catch (e) {
    return res.status(500).json({ error: true, message: `Unable to register: ${e.message}` });
  }
};

const login = async (req, res) => {
  try {
    const { name, password } = req.body || {};
    if (!name || !password) {
      return res.status(400).json({ error: true, message: 'Name and password required' });
    }

    const user = await SignupModel.findOne({ name: String(name).trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: true, message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: true, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), name: user.name },
      process.env.SECRET_KEY,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      error: false,
      message: 'Logged in',
      user: { id: user._id, name: user.name },
      token,
    });
  } catch (e) {
    return res.status(500).json({ error: true, message: `Unable to login: ${e.message}` });
  }
};

const logout = async (_req, res) => {
  return res.status(200).json({ error: false, message: 'Logged out (discard token on client)' });
};

module.exports = { register, login, logout };
