import express from 'express';
import { protect } from '../middleware/auth.js';
import { generateQuestions, evaluateAnswer } from '../services/openaiService.js';
import Session from '../models/Session.js';
import User from '../models/User.js';

const router = express.Router();

// Start an interview - generate questions
router.post('/start', protect, async (req, res) => {
  try {
    const { role, type, difficulty, questionCount, answerMode } = req.body;
    const questions = await generateQuestions(role, type, difficulty, questionCount || 5);
    const session = await Session.create({
      userId: req.user._id,
      role,
      type,
      difficulty,
      answerMode: answerMode || 'text',
      questionCount: questions.length,
      answers: questions.map((q) => ({ question: q })),
    });
    res.json({ sessionId: session._id, questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit answer for evaluation
router.post('/answer', protect, async (req, res) => {
  try {
    const { sessionId, questionIndex, answer, timeTaken } = req.body;
    const session = await Session.findOne({ _id: sessionId, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const question = session.answers[questionIndex].question;
    const feedback = await evaluateAnswer(question, answer, session.role, session.type);

    session.answers[questionIndex].userAnswer = answer;
    session.answers[questionIndex].feedback = feedback;
    session.answers[questionIndex].timeTaken = timeTaken || 0;
    await session.save();

    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Complete session - aggregate scores
router.post('/complete/:id', protect, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const answered = session.answers.filter((a) => a.feedback?.overallScore != null);
    if (answered.length === 0) return res.status(400).json({ message: 'No answers provided' });

    const avg = (key) =>
      Math.round(answered.reduce((s, a) => s + (a.feedback.scores?.[key] || 0), 0) / answered.length);
    session.overallScore = Math.round(
      answered.reduce((s, a) => s + a.feedback.overallScore, 0) / answered.length
    );
    session.averageScores = {
      clarity: avg('clarity'),
      relevance: avg('relevance'),
      structure: avg('structure'),
      confidence: avg('confidence'),
      technical_depth: avg('technical_depth'),
    };
    session.duration = answered.reduce((s, a) => s + (a.timeTaken || 0), 0);
    session.completed = true;
    await session.save();

    // Update user stats
    const user = await User.findById(req.user._id);
    user.stats.totalSessions += 1;
    user.stats.bestScore = Math.max(user.stats.bestScore, session.overallScore);
    const allSessions = await Session.find({ userId: req.user._id, completed: true });
    user.stats.averageScore = Math.round(
      allSessions.reduce((s, x) => s + x.overallScore, 0) / allSessions.length
    );
    await user.save();

    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all sessions
router.get('/sessions', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-answers.feedback.ideal_answer_summary');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single session
router.get('/session/:id', protect, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/session/:id', protect, async (req, res) => {
  try {
    await Session.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;