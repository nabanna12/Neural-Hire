import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import api from '../services/api';

const ScoreGauge = ({ score }) => {
  const r = 90;
  const c = 2 * Math.PI * r;
  const [val, setVal] = useState(0);
  useEffect(() => {
    let s = 0;
    const i = setInterval(() => {
      s += 2;
      if (s >= score) { setVal(score); clearInterval(i); } else setVal(s);
    }, 25);
    return () => clearInterval(i);
  }, [score]);
  const offset = c - (val / 100) * c;
  return (
    <div className="relative w-56 h-56 mx-auto">
      <svg className="w-56 h-56 -rotate-90">
        <circle cx="112" cy="112" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="14" fill="none" />
        <circle cx="112" cy="112" r={r} stroke="url(#grad)" strokeWidth="14" fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
        <defs>
          <linearGradient id="grad" x1="0" x2="1">
            <stop offset="0%" stopColor="#6C63FF" />
            <stop offset="100%" stopColor="#8B85FF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-extrabold gradient-text">{val}</span>
        <span className="text-sm text-gray-400">Overall Score</span>
      </div>
    </div>
  );
};

const Bar = ({ label, value, delay }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span>{label}</span>
      <span className="text-accent-light font-semibold">{value}%</span>
    </div>
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay }}
        className="h-full bg-gradient-to-r from-accent to-accent-light"
      />
    </div>
  </div>
);

export default function FeedbackReport() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    api.get(`/interview/session/${sessionId}`).then((res) => {
      setSession(res.data);
      if (res.data.overallScore >= 85) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 6000);
      }
    });
  }, [sessionId]);

  if (!session) return <div className="p-10 text-center">Loading report...</div>;

  const a = session.answers[activeIdx];
  const fb = a?.feedback;
  const avg = session.averageScores || {};

  return (
    <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
      {confetti && <Confetti recycle={false} numberOfPieces={300} />}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Your <span className="gradient-text">Feedback Report</span></h1>
        <p className="text-gray-400 mt-2">{session.role} • {session.type} • {session.difficulty}</p>
      </motion.div>

      {/* Overall + breakdown */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 flex flex-col items-center justify-center">
          <ScoreGauge score={session.overallScore} />
          <p className="text-gray-400 text-sm mt-4">
            {session.overallScore >= 85 ? '🎉 Outstanding!' : session.overallScore >= 70 ? '👍 Good work!' : '💪 Keep practicing!'}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="glass p-8 space-y-4">
          <h3 className="font-bold text-lg mb-4">Performance Breakdown</h3>
          <Bar label="Clarity" value={avg.clarity || 0} delay={0.1} />
          <Bar label="Relevance" value={avg.relevance || 0} delay={0.2} />
          <Bar label="Structure" value={avg.structure || 0} delay={0.3} />
          <Bar label="Confidence" value={avg.confidence || 0} delay={0.4} />
          <Bar label="Technical Depth" value={avg.technical_depth || 0} delay={0.5} />
        </motion.div>
      </div>

      {/* Per-question */}
      <div className="glass p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">Question-by-Question</h3>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {session.answers.map((_, i) => (
            <button key={i} onClick={() => setActiveIdx(i)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                activeIdx === i ? 'bg-accent text-white' : 'bg-white/5 hover:bg-white/10'
              }`}>
              Q{i + 1} • {session.answers[i].feedback?.overallScore || '-'}%
            </button>
          ))}
        </div>

        {fb && (
          <motion.div key={activeIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="glass p-4">
              <p className="text-xs text-gray-400 mb-1">Question</p>
              <p className="font-semibold">{a.question}</p>
            </div>
            <div className="glass p-4">
              <p className="text-xs text-gray-400 mb-1">Your Answer</p>
              <p className="text-sm">{a.userAnswer}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="glass p-4 border-l-4 border-green-500">
                <h4 className="font-semibold text-green-400 mb-2">✓ Strengths</h4>
                <ul className="space-y-1 text-sm">
                  {fb.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="glass p-4 border-l-4 border-orange-500">
                <h4 className="font-semibold text-orange-400 mb-2">↗ Improvements</h4>
                <ul className="space-y-1 text-sm">
                  {fb.improvements.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </motion.div>
            </div>

            {fb.keywords_missing?.length > 0 && (
              <div className="glass p-4">
                <h4 className="font-semibold mb-2">🔑 Missing Keywords</h4>
                <div className="flex gap-2 flex-wrap">
                  {fb.keywords_missing.map((k, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent-light text-xs">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="glass p-4 border-l-4 border-accent">
              <h4 className="font-semibold mb-2">💡 Ideal Answer Summary</h4>
              <p className="text-sm text-gray-300">{fb.ideal_answer_summary}</p>
            </div>

            {fb.follow_up_question && (
              <div className="glass p-4">
                <h4 className="font-semibold mb-2">🤔 Follow-up Question</h4>
                <p className="text-sm italic text-gray-300">"{fb.follow_up_question}"</p>
              </div>
            )}

            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>Tone: <span className="text-accent-light font-semibold">{fb.tone}</span></span>
              <span>Score: <span className="gradient-text font-bold text-lg">{fb.overallScore}%</span></span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <Link to="/setup" className="btn-primary">Practice Again</Link>
        <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
        <Link to="/history" className="btn-ghost">View History</Link>
      </div>
    </div>
  );
}