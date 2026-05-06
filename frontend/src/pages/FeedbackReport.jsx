import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import api from '../services/api';

/* ─── Helpers ────────────────────────────────────────────────────── */
function getScoreLabel(score) {
  if (score >= 85) return { text: 'Outstanding!', emoji: '🎉', color: 'text-green-400' };
  if (score >= 70) return { text: 'Good work!',   emoji: '👍', color: 'text-blue-400'  };
  return               { text: 'Keep practicing!', emoji: '💪', color: 'text-orange-400' };
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

/* ─── Animated score gauge ───────────────────────────────────────── */
function ScoreGauge({ score }) {
  const r = 90;
  const circumference = 2 * Math.PI * r;
  const [val, setVal] = useState(0);

  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += 2;
      if (current >= score) {
        setVal(score);
        clearInterval(timer);
      } else {
        setVal(current);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [score]);

  const offset = circumference - (val / 100) * circumference;
  const label = getScoreLabel(score);

  return (
    <div
      className="relative w-56 h-56 mx-auto"
      role="img"
      aria-label={`Overall score: ${score} out of 100`}
    >
      <svg className="w-56 h-56 -rotate-90" aria-hidden="true">
        <circle cx="112" cy="112" r={r}
          stroke="rgba(255,255,255,0.08)" strokeWidth="14" fill="none" />
        <circle cx="112" cy="112" r={r}
          stroke="url(#scoreGrad)" strokeWidth="14" fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0" x2="1">
            <stop offset="0%"   stopColor="#6C63FF" />
            <stop offset="100%" stopColor="#8B85FF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="text-6xl font-extrabold gradient-text" aria-hidden="true">
          {val}
        </span>
        <span className="text-sm text-gray-400">Overall Score</span>
        <span className={`text-sm font-semibold mt-1 ${label.color}`} aria-hidden="true">
          {label.emoji} {label.text}
        </span>
      </div>
    </div>
  );
}

/* ─── Animated skill bar ─────────────────────────────────────────── */
function SkillBar({ label, value, delay }) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const colorClass =
    clampedValue >= 80 ? 'from-green-500 to-green-400' :
    clampedValue >= 60 ? 'from-accent to-accent-light' :
    'from-orange-500 to-orange-400';

  return (
    <div role="meter" aria-label={`${label}: ${clampedValue}%`} aria-valuenow={clampedValue} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-accent-light font-semibold">{clampedValue}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${colorClass} rounded-full`}
        />
      </div>
    </div>
  );
}

/* ─── Question tab pill ──────────────────────────────────────────── */
function QuestionTab({ index, score, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Question ${index + 1}, score ${score ?? '—'}%`}
      className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
        isActive
          ? 'bg-accent text-white shadow-lg shadow-accent/30'
          : 'bg-white/5 hover:bg-white/10 text-gray-300'
      }`}
    >
      Q{index + 1}
      {score != null && (
        <span className={`ml-1.5 text-xs font-semibold ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
          {score}%
        </span>
      )}
    </button>
  );
}

/* ─── Keyword badge ──────────────────────────────────────────────── */
function KeywordBadge({ word }) {
  return (
    <span className="px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent-light text-xs">
      {word}
    </span>
  );
}

/* ─── Skeleton loader ────────────────────────────────────────────── */
function ReportSkeleton() {
  return (
    <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto" aria-busy="true" aria-label="Loading report">
      <div className="text-center mb-8">
        <div className="h-10 w-72 rounded-lg bg-white/10 animate-pulse mx-auto mb-3" />
        <div className="h-4 w-48 rounded bg-white/5 animate-pulse mx-auto" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="glass p-8 flex items-center justify-center">
          <div className="w-56 h-56 rounded-full border-[14px] border-white/10 animate-pulse" />
        </div>
        <div className="glass p-8 space-y-5">
          <div className="h-5 w-40 rounded bg-white/10 animate-pulse" />
          {[1,2,3,4,5].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-28 rounded bg-white/10 animate-pulse" />
              <div className="h-2 w-full rounded-full bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      <div className="glass p-6 mb-6">
        <div className="h-5 w-44 rounded bg-white/10 animate-pulse mb-4" />
        <div className="flex gap-2 mb-4">
          {[1,2,3].map(i => <div key={i} className="h-9 w-20 rounded-lg bg-white/10 animate-pulse" />)}
        </div>
        <div className="h-64 rounded-lg bg-white/5 animate-pulse" />
      </div>
    </div>
  );
}

/* ─── Error state ────────────────────────────────────────────────── */
function ReportError({ onRetry }) {
  const navigate = useNavigate();
  return (
    <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
      <div className="glass p-12 flex flex-col items-center text-center gap-4">
        <div className="text-5xl" aria-hidden="true">⚠️</div>
        <h2 className="font-semibold text-lg">Couldn't load this report</h2>
        <p className="text-gray-400 text-sm max-w-xs">
          The session may have been deleted, or there was a network error.
        </p>
        <div className="flex gap-3 flex-wrap justify-center mt-2">
          <button onClick={onRetry} className="btn-primary text-sm">Try again</button>
          <button onClick={() => navigate('/history')} className="btn-ghost text-sm">View History</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Per-question feedback panel ────────────────────────────────── */
function QuestionFeedback({ answer, feedback }) {
  return (
    <motion.div
      key={answer._id || answer.question}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      {/* Question */}
      <div className="glass p-4">
        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Question</p>
        <p className="font-semibold leading-relaxed">{answer.question}</p>
      </div>

      {/* User's answer */}
      <div className="glass p-4">
        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Your Answer</p>
        <p className="text-sm text-gray-200 leading-relaxed">{answer.userAnswer}</p>
      </div>

      {/* Strengths + Improvements */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass p-4 border-l-2 border-green-500">
          <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
            <span aria-hidden="true">✓</span> Strengths
          </h4>
          <ul className="space-y-2 text-sm" role="list">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-green-500 mt-0.5" aria-hidden="true">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass p-4 border-l-2 border-orange-500">
          <h4 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
            <span aria-hidden="true">↗</span> Improvements
          </h4>
          <ul className="space-y-2 text-sm" role="list">
            {feedback.improvements.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-orange-500 mt-0.5" aria-hidden="true">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Missing keywords */}
      {feedback.keywords_missing?.length > 0 && (
        <div className="glass p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span aria-hidden="true">🔑</span> Missing Keywords
          </h4>
          <div className="flex gap-2 flex-wrap" role="list" aria-label="Missing keywords">
            {feedback.keywords_missing.map((k, i) => (
              <span key={i} role="listitem">
                <KeywordBadge word={k} />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ideal answer */}
      <div className="glass p-4 border-l-2 border-accent">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <span aria-hidden="true">💡</span> Ideal Answer Summary
        </h4>
        <p className="text-sm text-gray-300 leading-relaxed">{feedback.ideal_answer_summary}</p>
      </div>

      {/* Follow-up question */}
      {feedback.follow_up_question && (
        <div className="glass p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span aria-hidden="true">🤔</span> Follow-up Question
          </h4>
          <p className="text-sm italic text-gray-300">"{feedback.follow_up_question}"</p>
        </div>
      )}

      {/* Tone + score footer */}
      <div className="flex justify-between items-center text-sm text-gray-400 pt-1">
        <span>
          Tone: <span className="text-accent-light font-semibold">{feedback.tone}</span>
        </span>
        <span>
          Score:{' '}
          <span className="gradient-text font-bold text-lg" aria-label={`${feedback.overallScore} percent`}>
            {feedback.overallScore}%
          </span>
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Main FeedbackReport page ───────────────────────────────────── */
export default function FeedbackReport() {
  const { sessionId } = useParams();
  const [session, setSession]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [confetti, setConfetti]   = useState(false);

  const fetchReport = useCallback(() => {
    setLoading(true);
    setError(false);
    api
      .get(`/interview/session/${sessionId}`)
      .then((res) => {
        setSession(res.data);
        if (res.data.overallScore >= 85) {
          setConfetti(true);
          setTimeout(() => setConfetti(false), 6000);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  if (loading) return <ReportSkeleton />;
  if (error)   return <ReportError onRetry={fetchReport} />;

  const activeAnswer   = session.answers[activeIdx];
  const activeFeedback = activeAnswer?.feedback;
  const avg            = session.averageScores || {};

  return (
    <main id="main" className="px-4 md:px-8 py-6 max-w-6xl mx-auto">

      {/* Confetti for high scores */}
      {confetti && (
        <Confetti
          recycle={false}
          numberOfPieces={300}
          aria-hidden="true"
        />
      )}

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold">
          Your <span className="gradient-text">Feedback Report</span>
        </h1>
        <p className="text-gray-400 mt-2">
          {session.role} • {session.type} • {session.difficulty}
          {session.createdAt && (
            <span className="ml-2 text-gray-500">· {formatDate(session.createdAt)}</span>
          )}
        </p>
      </motion.div>

      {/* ── Score + breakdown ── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 flex flex-col items-center justify-center"
          role="region"
          aria-label="Overall score"
        >
          <ScoreGauge score={session.overallScore} />
        </motion.div>

        {/* Skill bars */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-8 space-y-4"
          role="region"
          aria-label="Performance breakdown by skill"
        >
          <h2 className="font-bold text-lg mb-4">Performance Breakdown</h2>
          <SkillBar label="Clarity"         value={avg.clarity          ?? 0} delay={0.1} />
          <SkillBar label="Relevance"       value={avg.relevance        ?? 0} delay={0.2} />
          <SkillBar label="Structure"       value={avg.structure        ?? 0} delay={0.3} />
          <SkillBar label="Confidence"      value={avg.confidence       ?? 0} delay={0.4} />
          <SkillBar label="Technical Depth" value={avg.technical_depth  ?? 0} delay={0.5} />
        </motion.div>

      </div>

      {/* ── Per-question section ── */}
      <div
        className="glass p-6 mb-6"
        role="region"
        aria-label="Question by question feedback"
      >
        <h2 className="font-bold text-lg mb-4">Question-by-Question</h2>

        {/* Tab row */}
        <div
          className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-thin"
          role="tablist"
          aria-label="Interview questions"
        >
          {session.answers.map((ans, i) => (
            <QuestionTab
              key={i}
              index={i}
              score={ans.feedback?.overallScore ?? null}
              isActive={activeIdx === i}
              onClick={() => setActiveIdx(i)}
            />
          ))}
        </div>

        {/* Feedback panel */}
        <AnimatePresence mode="wait">
          {activeFeedback ? (
            <QuestionFeedback
              key={activeIdx}
              answer={activeAnswer}
              feedback={activeFeedback}
            />
          ) : (
            <motion.p
              key="no-feedback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400 text-sm text-center py-10"
            >
              No feedback available for this question.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex gap-3 justify-center flex-wrap">
        <Link to="/setup"      className="btn-primary"  aria-label="Start a new practice interview">Practice Again</Link>
        <Link to="/dashboard"  className="btn-ghost"    aria-label="Go to dashboard">Dashboard</Link>
        <Link to="/history"    className="btn-ghost"    aria-label="View all interview history">View History</Link>
      </div>

    </main>
  );
}
