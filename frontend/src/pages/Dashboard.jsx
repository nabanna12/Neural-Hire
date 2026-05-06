import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─── Motivational quotes ─────────────────────────────────────────── */
const QUOTES = [
  '"The only way to do great work is to love what you do." – Steve Jobs',
  '"Success is preparation meeting opportunity." – Bobby Unser',
  '"Believe you can and you\'re halfway there." – Theodore Roosevelt',
  '"Don\'t watch the clock; do what it does. Keep going."',
  '"The harder you work, the luckier you get."',
];

/* ─── Skeleton loader (shown while data is fetching) ─────────────── */
function DashboardSkeleton() {
  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto" aria-busy="true" aria-label="Loading dashboard">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-9 w-52 rounded-lg bg-white/10 animate-pulse mb-3" />
        <div className="h-4 w-80 rounded bg-white/5 animate-pulse" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-3 w-24 rounded bg-white/10 animate-pulse mb-3" />
                <div className="h-8 w-16 rounded bg-white/10 animate-pulse" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {[1, 2].map((i) => (
          <div key={i} className="glass p-6">
            <div className="h-5 w-32 rounded bg-white/10 animate-pulse mb-4" />
            <div className="h-[250px] rounded-lg bg-white/5 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Recent sessions skeleton */}
      <div className="glass p-6">
        <div className="h-5 w-36 rounded bg-white/10 animate-pulse mb-5" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 w-40 rounded bg-white/10 animate-pulse mb-2" />
                <div className="h-3 w-28 rounded bg-white/5 animate-pulse" />
              </div>
              <div className="h-7 w-14 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Error state ─────────────────────────────────────────────────── */
function DashboardError({ onRetry }) {
  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="glass p-12 flex flex-col items-center text-center gap-4">
        <div className="text-5xl" aria-hidden="true">⚠️</div>
        <h2 className="font-semibold text-lg">Couldn't load your dashboard</h2>
        <p className="text-gray-400 text-sm max-w-xs">
          There was a problem fetching your data. Check your connection and try again.
        </p>
        <button
          onClick={onRetry}
          className="btn-primary text-sm mt-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

/* ─── Empty sessions state ───────────────────────────────────────── */
function EmptySessions() {
  return (
    <div className="flex flex-col items-center text-center py-12 gap-4">
      <div className="text-5xl" aria-hidden="true">🎤</div>
      <h3 className="font-semibold text-lg">No interviews yet</h3>
      <p className="text-gray-400 text-sm max-w-xs">
        Start your first mock interview and get instant AI feedback on your answers.
      </p>
      <Link
        to="/setup"
        className="btn-primary text-sm mt-2"
      >
        Start your first interview →
      </Link>
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────── */
const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function StatCard({ label, value, icon }) {
  return (
    <motion.div
      variants={statVariants}
      whileHover={{ y: -3 }}
      className="glass p-6 glass-hover"
      role="region"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-3xl font-bold mt-1 gradient-text">{value}</p>
        </div>
        <div className="text-4xl" aria-hidden="true">{icon}</div>
      </div>
    </motion.div>
  );
}

/* ─── Session row ────────────────────────────────────────────────── */
function SessionRow({ session, index }) {
  const date = new Date(session.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/report/${session._id}`}
        className="block glass p-4 glass-hover"
        aria-label={`View report for ${session.role} interview — score ${session.overallScore}%`}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-semibold">{session.role}</p>
            <p className="text-xs text-gray-400">
              {session.type} • {session.difficulty} • {date}
            </p>
          </div>
          <div className="text-2xl font-bold gradient-text" aria-hidden="true">
            {session.overallScore}%
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const fetchDashboard = () => {
    setLoading(true);
    setError(false);
    api
      .get('/user/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDashboard(); }, []);

  /* Loading state */
  if (loading) return <DashboardSkeleton />;

  /* Error state */
  if (error) return <DashboardError onRetry={fetchDashboard} />;

  const { stats, recentSessions, trend, skills } = data;

  const radarData = [
    { skill: 'Clarity',    value: skills.clarity },
    { skill: 'Relevance',  value: skills.relevance },
    { skill: 'Structure',  value: skills.structure },
    { skill: 'Confidence', value: skills.confidence },
    { skill: 'Tech Depth', value: skills.technical_depth },
  ];

  return (
    <main id="main" className="px-4 md:px-8 py-6 max-w-7xl mx-auto">

      {/* ── Greeting ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-1">
          Hi, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400 italic text-sm">{quote}</p>
      </motion.div>

      {/* ── Stat cards ── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
        role="list"
        aria-label="Performance summary"
      >
        <StatCard label="Total Sessions" value={stats.totalSessions}       icon="🎯" />
        <StatCard label="Average Score"  value={`${stats.averageScore}%`}  icon="📊" />
        <StatCard label="Best Score"     value={`${stats.bestScore}%`}     icon="🏆" />
      </motion.div>

      {/* ── Charts ── */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">

        {/* Score trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-6"
          role="region"
          aria-label="Score trend chart"
        >
          <h2 className="font-bold text-lg mb-4">Score Trend</h2>
          {trend.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-16">
              Complete more interviews to see your trend.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trend}>
                <XAxis dataKey="date" stroke="#888" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: '#15152e',
                    border: '1px solid #6C63FF',
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6C63FF"
                  strokeWidth={3}
                  dot={{ fill: '#6C63FF', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Skill radar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-6"
          role="region"
          aria-label="Skill radar chart"
        >
          <h2 className="font-bold text-lg mb-4">Skill Radar</h2>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="skill" stroke="#aaa" fontSize={11} />
              <PolarRadiusAxis domain={[0, 100]} stroke="#444" fontSize={10} />
              <Radar
                dataKey="value"
                stroke="#6C63FF"
                fill="#6C63FF"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

      </div>

      {/* ── Recent sessions ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass p-6 mt-6"
        role="region"
        aria-label="Recent interview sessions"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Recent Sessions</h2>
          <Link to="/setup" className="btn-primary text-sm" aria-label="Start a new interview">
            + New Interview
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <EmptySessions />
        ) : (
          <div className="space-y-3">
            {recentSessions.map((s, i) => (
              <SessionRow key={s._id} session={s} index={i} />
            ))}
          </div>
        )}
      </motion.div>

    </main>
  );
}
