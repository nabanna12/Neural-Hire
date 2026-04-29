import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  question: String,
  userAnswer: String,
  feedback: {
    overallScore: Number,
    scores: {
      clarity: Number,
      relevance: Number,
      structure: Number,
      confidence: Number,
      technical_depth: Number,
    },
    strengths: [String],
    improvements: [String],
    ideal_answer_summary: String,
    keywords_missing: [String],
    tone: String,
    follow_up_question: String,
  },
  timeTaken: Number,
});

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    type: { type: String, enum: ['Behavioral', 'Technical', 'HR', 'Mixed'], required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    answerMode: { type: String, enum: ['text', 'voice'], default: 'text' },
    questionCount: Number,
    answers: [answerSchema],
    overallScore: { type: Number, default: 0 },
    averageScores: {
      clarity: Number,
      relevance: Number,
      structure: Number,
      confidence: Number,
      technical_depth: Number,
    },
    duration: Number,
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Session', sessionSchema);