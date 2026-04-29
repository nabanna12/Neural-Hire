import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'DevOps Engineer',
  'Cloud Engineer', 'Product Manager', 'Project Manager', 'UX/UI Designer',
  'QA Engineer', 'Cybersecurity Analyst', 'Mobile Developer', 'Business Analyst',
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    role: 'Software Engineer',
    type: 'Mixed',
    difficulty: 'Medium',
    questionCount: 5,
    answerMode: 'text',
  });

  const start = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/interview/start', config);
      sessionStorage.setItem(`questions_${data.sessionId}`, JSON.stringify(data.questions));
      sessionStorage.setItem(`config_${data.sessionId}`, JSON.stringify(config));
      navigate(`/interview/${data.sessionId}`);
    } catch (err) {
      toast.error('Failed to start interview');
    }
    setLoading(false);
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Set Up Your <span className="gradient-text">Interview</span></h1>
        <p className="text-gray-400 mb-8">Customize your practice session</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass p-6 md:p-8 space-y-6">

        <div>
          <label className="block text-sm font-semibold mb-3">Job Role</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button key={r} onClick={() => setConfig({ ...config, role: r })}
                className={`p-3 rounded-lg text-sm transition border ${
                  config.role === r ? 'bg-accent/20 border-accent text-accent-light' : 'border-white/10 hover:border-accent/50'
                }`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3">Interview Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Behavioral', 'Technical', 'HR', 'Mixed'].map((t) => (
              <button key={t} onClick={() => setConfig({ ...config, type: t })}
                className={`p-3 rounded-lg transition border ${
                  config.type === t ? 'bg-accent/20 border-accent text-accent-light' : 'border-white/10 hover:border-accent/50'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3">Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {['Easy', 'Medium', 'Hard'].map((d) => (
              <button key={d} onClick={() => setConfig({ ...config, difficulty: d })}
                className={`p-3 rounded-lg transition border ${
                  config.difficulty === d ? 'bg-accent/20 border-accent text-accent-light' : 'border-white/10 hover:border-accent/50'
                }`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3">Number of Questions: {config.questionCount}</label>
          <input type="range" min="3" max="10" value={config.questionCount}
            onChange={(e) => setConfig({ ...config, questionCount: +e.target.value })}
            className="w-full accent-accent" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3">Answer Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {[{ v: 'text', l: '⌨️ Text' }, { v: 'voice', l: '🎤 Voice' }].map((m) => (
              <button key={m.v} onClick={() => setConfig({ ...config, answerMode: m.v })}
                className={`p-3 rounded-lg transition border ${
                  config.answerMode === m.v ? 'bg-accent/20 border-accent text-accent-light' : 'border-white/10 hover:border-accent/50'
                }`}>
                {m.l}
              </button>
            ))}
          </div>
        </div>

        <button onClick={start} disabled={loading} className="btn-primary w-full text-lg">
          {loading ? 'Generating questions...' : '🚀 Start Interview'}
        </button>
      </motion.div>
    </div>
  );
}