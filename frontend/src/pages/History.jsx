import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

/* ─── Helpers ────────────────────────────────────────────────────── */
function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function getScoreColor(score) {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-accent-light';
  return 'text-orange-400';
}

function getScoreBadgeBg(score) {
  if (score >= 80) return 'bg-green-500/15 border-green-500/30';
  if (score >= 60) return 'bg-accent/15 border-accent/30';
  return 'bg-orange-500/15 border-orange-500/30';
}

const FILTER_OPTIONS = [
  { value: 'all',        label: 'All Types'  },
  { value: 'Behavioral', label: 'Behavioral' },
  { value: 'Technical',  label: 'Technical'  },
  { value: 'HR',         label: 'HR'         },
  { value: 'Mixed',      label: 'Mixed'      },
];

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest First'  },
  { value: 'oldest',  label: 'Oldest First'  },
  { value: 'highest', label: 'Highest Score' },
  { value: 'lowest',  label: 'Lowest Score'  },
];

/* ─── Skeleton loader ────────────────────────────────────────────── */
function HistorySkeleton() {
  return (
    <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto" aria-busy="true" aria-label="Loading history">
      <div className="h-10 w-64 rounded-lg bg-white/10 animate-pulse mb-6" />
      <div className="glass p-4 mb-6 flex gap-3">
        <div className="h-10 w-40 rounded-lg bg-white/10 animate-pulse" />
        <div className="h-10 w-40 rounded-lg bg-white/10 animate-pulse" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="h-5 w-48 rounded bg-white/10 animate-pulse mb-2" />
                <div className="h-3 w-64 rounded bg-white/5 animate-pulse" />
              </div>
              <div className="h-9 w-16 rounded-lg bg-white/10 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-9 w-16 rounded-lg bg-white/10 animate-pulse" />
                <div className="h-9 w-10 rounded-lg bg-white/10 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Error state ────────────────────────────────────────────────── */
function HistoryError({ onRetry }) {
  return (
    <div className="glass p-12 flex flex-col items-center text-center gap-4">
      <div className="text-5xl" aria-hidden="true">⚠️</div>
      <h2 className="font-semibold text-lg">Couldn't load your history</h2>
      <p className="text-gray-400 text-sm max-w-xs">
        There was a problem fetching your sessions. Check your connection and try again.
      </p>
      <button onClick={onRetry} className="btn-primary text-sm mt-2">
        Try again
      </button>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */
function EmptyHistory({ hasFilter }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-12 flex flex-col items-center text-center gap-4"
      role="status"
    >
      <div className="text-5xl" aria-hidden="true">
        {hasFilter ? '🔍' : '🎤'}
      </div>
      <h2 className="font-semibold text-lg">
        {hasFilter ? 'No matches found' : 'No interviews yet'}
      </h2>
      <p className="text-gray-400 text-sm max-w-xs">
        {hasFilter
          ? 'Try changing the filter or sort options to see more results.'
          : 'Complete your first mock interview to see it here.'}
      </p>
      {!hasFilter && (
        <Link to="/setup" className="btn-primary text-sm mt-2">
          Start your first interview →
        </Link>
      )}
    </motion.div>
  );
}

/* ─── Delete confirm dialog ──────────────────────────────────────── */
function DeleteConfirmDialog({ session, onConfirm, onCancel, isDeleting }) {
  // Trap focus & close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="relative glass p-6 max-w-sm w-full rounded-2xl shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl mb-4 text-center" aria-hidden="true">🗑️</div>
        <h2 id="delete-title" className="font-bold text-lg text-center mb-2">
          Delete this session?
        </h2>
        <p id="delete-desc" className="text-gray-400 text-sm text-center mb-6">
          <span className="font-semibold text-gray-200">{session.role}</span> — {session.type} · {formatDate(session.createdAt)}
          <br />
          <span className="text-xs mt-1 block">This action cannot be undone.</span>
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-ghost flex-1 text-sm"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 text-sm inline-flex items-center justify-center gap-2 font-semibold px-5 py-2.5 min-h-[44px] rounded-xl transition bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:outline-offset-2 disabled:opacity-50"
            disabled={isDeleting}
            aria-busy={isDeleting}
          >
            {isDeleting ? (
              <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" aria-hidden="true" />
            ) : null}
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Session row card ───────────────────────────────────────────── */
function SessionCard({ session, index, onDelete }) {
  const scoreColor = getScoreColor(session.overallScore);
  const scoreBg    = getScoreBadgeBg(session.overallScore);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.04 }}
      className="glass p-5 glass-hover"
      aria-label={`${session.role} interview, score ${session.overallScore}%`}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">

        {/* Info */}
        <div className="flex-1 min-w-[200px]">
          <p className="font-bold">{session.role}</p>
          <p className="text-xs text-gray-400 mt-1">
            {session.type}
            {session.difficulty && <> • {session.difficulty}</>}
            {session.questionCount != null && <> • {session.questionCount} Qs</>}
            {' • '}{formatDate(session.createdAt)}
          </p>
        </div>

        {/* Score badge */}
        <div
          className={`px-3 py-1 rounded-full border text-sm font-bold ${scoreBg} ${scoreColor}`}
          aria-label={`Score: ${session.overallScore}%`}
        >
          {session.overallScore}%
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/report/${session._id}`}
            className="btn-ghost text-sm"
            aria-label={`View report for ${session.role}`}
          >
            View report
          </Link>
          <button
            onClick={() => onDelete(session)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:outline-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={`Delete ${session.role} session`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>

      </div>
    </motion.article>
  );
}

/* ─── Stats summary bar ──────────────────────────────────────────── */
function StatsSummary({ sessions }) {
  if (sessions.length === 0) return null;
  const avg  = Math.round(sessions.reduce((acc, s) => acc + s.overallScore, 0) / sessions.length);
  const best = Math.max(...sessions.map((s) => s.overallScore));
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-3 gap-3 mb-6"
      role="region"
      aria-label="History summary"
    >
      {[
        { label: 'Sessions',   value: sessions.length },
        { label: 'Average',    value: `${avg}%`       },
        { label: 'Best Score', value: `${best}%`      },
      ].map(({ label, value }) => (
        <div key={label} className="glass p-4 text-center">
          <p className="text-xl font-bold gradient-text">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{label}</p>
        </div>
      ))}
    </motion.div>
  );
}

/* ─── Main History page ──────────────────────────────────────────── */
export default function History() {
  const [sessions,   setSessions]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(false);
  const [filter,     setFilter]     = useState('all');
  const [sort,       setSort]       = useState('newest');
  const [toDelete,   setToDelete]   = useState(null);   // session object to delete
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSessions = useCallback(() => {
    setLoading(true);
    setError(false);
    api
      .get('/interview/sessions')
      .then((r) => setSessions(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  /* Confirm delete */
  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/interview/session/${toDelete._id}`);
      setSessions((prev) => prev.filter((s) => s._id !== toDelete._id));
      toast.success('Session deleted');
    } catch {
      toast.error('Failed to delete. Please try again.');
    } finally {
      setIsDeleting(false);
      setToDelete(null);
    }
  };

  /* Filtered + sorted list */
  const filtered = sessions
    .filter((s) => filter === 'all' || s.type === filter)
    .sort((a, b) => {
      if (sort === 'newest')  return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'oldest')  return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'highest') return b.overallScore - a.overallScore;
      return a.overallScore - b.overallScore;
    });

  const hasFilter = filter !== 'all' || sort !== 'newest';

  if (loading) return <HistorySkeleton />;

  return (
    <main id="main" className="px-4 md:px-8 py-6 max-w-6xl mx-auto">

      {/* ── Page heading ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold">
          Interview <span className="gradient-text">History</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
        </p>
      </motion.div>

      {/* ── Error state ── */}
      {error && <HistoryError onRetry={loadSessions} />}

      {/* ── Content ── */}
      {!error && (
        <>
          {/* Stats summary */}
          <StatsSummary sessions={sessions} />

          {/* Filter + sort bar */}
          <div
            className="glass p-4 mb-6 flex gap-3 flex-wrap items-center"
            role="group"
            aria-label="Filter and sort options"
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="filter-type" className="text-xs text-gray-400 px-1">Type</label>
              <select
                id="filter-type"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input max-w-[160px]"
              >
                {FILTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="sort-order" className="text-xs text-gray-400 px-1">Sort by</label>
              <select
                id="sort-order"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input max-w-[160px]"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Active filter count badge */}
            {filtered.length !== sessions.length && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-auto text-xs text-accent-light font-medium px-3 py-1 rounded-full bg-accent/15 border border-accent/30"
                role="status"
                aria-live="polite"
              >
                {filtered.length} of {sessions.length} shown
              </motion.span>
            )}
          </div>

          {/* Session list */}
          {filtered.length === 0 ? (
            <EmptyHistory hasFilter={hasFilter} />
          ) : (
            <div className="space-y-3" role="list" aria-label="Interview sessions">
              <AnimatePresence>
                {filtered.map((s, i) => (
                  <SessionCard
                    key={s._id}
                    session={s}
                    index={i}
                    onDelete={setToDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* ── Delete confirm dialog ── */}
      <AnimatePresence>
        {toDelete && (
          <DeleteConfirmDialog
            session={toDelete}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setToDelete(null)}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>

    </main>
  );
}
