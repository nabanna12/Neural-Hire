import express from 'express';
import bcrypt from 'bcryptjs';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Session from '../models/Session.js';

const router = express.Router();

router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (preferences) user.preferences = { ...user.preferences.toObject(), ...preferences };
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(400).json({ message: 'Current password incorrect' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Min 6 characters' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/dashboard', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id, completed: true })
      .sort({ createdAt: -1 })
      .limit(10);
    const allDone = await Session.find({ userId: req.user._id, completed: true });
    const trend = allDone.slice(-10).map((s) => ({
      date: s.createdAt.toISOString().slice(0, 10),
      score: s.overallScore,
    }));
    const skills = allDone.length
      ? {
          clarity: Math.round(allDone.reduce((s, x) => s + (x.averageScores?.clarity || 0), 0) / allDone.length),
          relevance: Math.round(allDone.reduce((s, x) => s + (x.averageScores?.relevance || 0), 0) / allDone.length),
          structure: Math.round(allDone.reduce((s, x) => s + (x.averageScores?.structure || 0), 0) / allDone.length),
          confidence: Math.round(allDone.reduce((s, x) => s + (x.averageScores?.confidence || 0), 0) / allDone.length),
          technical_depth: Math.round(
            allDone.reduce((s, x) => s + (x.averageScores?.technical_depth || 0), 0) / allDone.length
          ),
        }
      : { clarity: 0, relevance: 0, structure: 0, confidence: 0, technical_depth: 0 };
    res.json({ stats: req.user.stats, recentSessions: sessions, trend, skills });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;