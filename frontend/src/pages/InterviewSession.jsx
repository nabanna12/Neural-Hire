import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const TIME_PER_Q = 120; // seconds

export default function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [config, setConfig] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [paused, setPaused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [typed, setTyped] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const timerStartRef = useRef(Date.now());

  // Load session
  useEffect(() => {
    const q = sessionStorage.getItem(`questions_${sessionId}`);
    const c = sessionStorage.getItem(`config_${sessionId}`);
    if (q && c) {
      setQuestions(JSON.parse(q));
      setConfig(JSON.parse(c));
    } else {
      api.get(`/interview/session/${sessionId}`).then((res) => {
        setQuestions(res.data.answers.map((a) => a.question));
        setConfig({ answerMode: res.data.answerMode });
      });
    }
  }, [sessionId]);

  // Typewriter
  useEffect(() => {
    if (!questions[idx]) return;
    setTyped('');
    let i = 0;
    const text = questions[idx];
    const t = setInterval(() => {
      if (i <= text.length) {
        setTyped(text.slice(0, i));
        i++;
      } else clearInterval(t);
    }, 25);
    // TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
    return () => { clearInterval(t); window.speechSynthesis?.cancel(); };
  }, [idx, questions]);

  // Timer
  useEffect(() => {
    if (paused) return;
    setTimeLeft(TIME_PER_Q);
    timerStartRef.current = Date.now();
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [idx, paused]);

  // Voice setup
  useEffect(() => {
    if (config?.answerMode !== 'voice') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice not supported in this browser'); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
      }
      if (final) setAnswer((p) => p + final);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, [config]);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (listening) recognitionRef.current.stop();
    else { recognitionRef.current.start(); setListening(true); }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); }
        return;
      }
      if (e.code === 'Space' && config?.answerMode === 'voice') { e.preventDefault(); toggleVoice(); }
      if (e.key === 'Enter') submit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answer, idx, listening, config]);

  const submit = async () => {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    if (listening) recognitionRef.current?.stop();
    const timeTaken = Math.round((Date.now() - timerStartRef.current) / 1000);
    try {
      await api.post('/interview/answer', { sessionId, questionIndex: idx, answer, timeTaken });
      if (idx + 1 < questions.length) {
        setIdx(idx + 1);
        setAnswer('');
      } else {
        await api.post(`/interview/complete/${sessionId}`);
        sessionStorage.removeItem(`questions_${sessionId}`);
        sessionStorage.removeItem(`config_${sessionId}`);
        navigate(`/report/${sessionId}`);
      }
    } catch {
      toast.error('Failed to submit');
    }
    setSubmitting(false);
  };

  const exit = async () => {
    if (!confirm('Exit and discard this interview?')) return;
    navigate('/dashboard');
  };

  if (!questions.length || !config) return <div className="p-10 text-center">Loading...</div>;

  const progress = ((idx + 1) / questions.length) * 100;
  const timerPct = (timeLeft / TIME_PER_Q) * 100;
  const circumference = 2 * Math.PI * 38;

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <p className="text-sm text-gray-400 mb-2">Question {idx + 1} of {questions.length}</p>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-accent to-accent-light" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Timer ring */}
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="38" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
              <circle
                cx="40" cy="40" r="38" stroke="#6C63FF" strokeWidth="4" fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (timerPct / 100) * circumference}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold">{timeLeft}s</div>
          </div>
          <button onClick={() => setPaused(!paused)} className="btn-ghost text-sm">{paused ? '▶' : '⏸'}</button>
          <button onClick={exit} className="btn-ghost text-sm">✕</button>
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className="glass p-6 md:p-8 mb-6 animate-pulse-glow"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shrink-0 text-xl">🤖</div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-2">AI Interviewer</p>
              <h2 className="text-xl md:text-2xl font-semibold leading-relaxed typewriter">{typed}</h2>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Answer area */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="glass p-6">
        <textarea
          value={answer} onChange={(e) => setAnswer(e.target.value)}
          placeholder={config.answerMode === 'voice' ? 'Click 🎤 or press Space to speak...' : 'Type your answer here...'}
          rows={6} className="input resize-none"
        />
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          {config.answerMode === 'voice' && (
            <button onClick={toggleVoice}
              className={`btn-ghost ${listening ? 'bg-red-500/20 border-red-500 animate-pulse' : ''}`}>
              {listening ? '🔴 Stop' : '🎤 Speak'}
            </button>
          )}
          <button onClick={submit} disabled={submitting || !answer.trim()}
            className="btn-primary flex-1 sm:flex-initial">
            {submitting ? 'Evaluating...' : idx + 1 === questions.length ? 'Finish ✓' : 'Next →'}
          </button>
          <p className="text-xs text-gray-500 ml-auto hidden md:block">
            {config.answerMode === 'voice' && 'Space=record • '}Enter=submit
          </p>
        </div>
      </motion.div>
    </div>
  );
}