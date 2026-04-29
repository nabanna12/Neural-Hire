import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const QUOTES = [
  '"The only way to do great work is to love what you do." – Steve Jobs',
  '"Success is preparation meeting opportunity." – Bobby Unser',
  '"Believe you can and you’re halfway there." – Theodore Roosevelt',
  '"Don’t watch the clock; do what it does. Keep going."',
  '"The harder you work, the luckier you get."',
];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    api.get('/user/dashboard').then((res) => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return <div className="p-10 text-center">Loading...</div>;

  const { stats, recentSessions, trend, skills } = data;

  const radarData = [
    { skill: 'Clarity', value: skills.clarity },
    { skill: 'Relevance', value: skills.relevance },
    { skill: 'Structure', value: skills.structure },
    { skill: 'Confidence', value: skills.confidence },
    { skill: 'Tech Depth', value: skills.technical_depth },
  ];

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-1">Hi, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-400 italic text-sm">{quote}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
      >
        {[
          { label: 'Total Sessions', value: stats.totalSessions, icon: '🎯' },
          { label: 'Average Score', value: `${stats.averageScore}%`, icon: '📊' },
          { label: 'Best Score', value: `${stats.bestScore}%`, icon: '🏆' },
        ].map((s, i) => (
          <motion.div
            key={i}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -3 }}
            className="glass p-6 glass-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{s.label}</p>
                <p className="text-3xl font-bold mt-1 gradient-text">{s.value}</p>
              </div>
              <div className="text-4xl">{s.icon}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6">
          <h3 className="font-bold text-lg mb-4">Score Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trend}>
              <XAxis dataKey="date" stroke="#888" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#888" fontSize={11} />
              <Tooltip contentStyle={{ background: '#15152e', border: '1px solid #6C63FF', borderRadius: 8 }} />
              <Line type="monotone" dataKey="score" stroke="#6C63FF" strokeWidth={3}
                dot={{ fill: '#6C63FF', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6">
          <h3 className="font-bold text-lg mb-4">Skill Radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="skill" stroke="#aaa" fontSize={11} />
              <PolarRadiusAxis domain={[0, 100]} stroke="#444" fontSize={10} />
              <Radar dataKey="value" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="glass p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Recent Sessions</h3>
          <Link to="/setup" className="btn-primary text-sm">+ New</Link>
        </div>
        {recentSessions.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No sessions yet. Start your first interview!</p>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((s, i) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/report/${s._id}`} className="block glass p-4 glass-hover">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold">{s.role}</p>
                      <p className="text-xs text-gray-400">{s.type} • {s.difficulty} • {new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-2xl font-bold gradient-text">{s.overallScore}%</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}