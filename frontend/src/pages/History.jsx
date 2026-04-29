import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  const load = () => api.get('/interview/sessions').then((r) => setSessions(r.data));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm('Delete this session?')) return;
    await api.delete(`/interview/session/${id}`);
    toast.success('Deleted');
    load();
  };

  let filtered = sessions.filter((s) => filter === 'all' || s.type === filter);
  filtered = [...filtered].sort((a, b) => {
    if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === 'highest') return b.overallScore - a.overallScore;
    return a.overallScore - b.overallScore;
  });

  return (
    <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold mb-6">Interview <span className="gradient-text">History</span></motion.h1>

      <div className="glass p-4 mb-6 flex gap-3 flex-wrap">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input max-w-xs">
          <option value="all">All Types</option>
          <option>Behavioral</option><option>Technical</option><option>HR</option><option>Mixed</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input max-w-xs">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Score</option>
          <option value="lowest">Lowest Score</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="glass p-12 text-center">
          <p className="text-gray-400 mb-4">No sessions found</p>
          <Link to="/setup" className="btn-primary">Start one →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s, i) => (
            <motion.div key={s._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass p-5 glass-hover">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-bold">{s.role}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {s.type} • {s.difficulty} • {s.questionCount} Qs • {new Date(s.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-3xl font-bold gradient-text">{s.overallScore}%</div>
                <div className="flex gap-2">
                  <Link to={`/report/${s._id}`} className="btn-ghost text-sm">View</Link>
                  <button onClick={() => remove(s._id)} className="btn-ghost text-sm hover:text-red-400">🗑</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}