import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─── Avatar initials generator ─────────────────────────────────── */
function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function getAvatarGradient(name = '') {
  const gradients = [
    'from-violet-500 to-indigo-500',
    'from-cyan-500 to-blue-500',
    'from-pink-500 to-rose-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
  ];
  const idx = name.charCodeAt(0) % gradients.length || 0;
  return gradients[idx];
}

/* ─── Floating particle dots ─────────────────────────────────────── */
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ─── Animated 3D avatar card ────────────────────────────────────── */
function AvatarCard({ user }) {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / rect.height) * -14;
    const ry = ((e.clientX - cx) / rect.width) * 14;
    setRotate({ x: rx, y: ry });
  };

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  const initials = getInitials(user?.name);
  const gradient = getAvatarGradient(user?.name);
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : 'Neural-Hire Member';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
      className="glass p-8 relative overflow-hidden text-center cursor-default"
      role="region"
      aria-label="Profile card"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <Particles />

      {/* Avatar ring */}
      <div className="relative inline-block mb-4">
        <motion.div
          className="w-28 h-28 rounded-full p-[3px] mx-auto"
          style={{
            background: 'linear-gradient(135deg, #6C63FF, #8B85FF, #C5A8FF, #6C63FF)',
            backgroundSize: '300% 300%',
          }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-3xl font-extrabold text-white" aria-hidden="true">
              {initials || '?'}
            </span>
          </div>
        </motion.div>

        {/* Online dot */}
        <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-[#0a0a1a] shadow-lg shadow-green-500/40"
          aria-label="Online" />
      </div>

      <h2 className="text-2xl font-extrabold gradient-text">{user?.name || 'User'}</h2>
      <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
      <p className="text-xs text-gray-500 mt-2">Member since {memberSince}</p>

      {/* Level badge */}
      <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/30">
        <span className="text-sm" aria-hidden="true">⚡</span>
        <span className="text-xs font-semibold text-accent-light">Neural-Hire Pro</span>
      </div>
    </motion.div>
  );
}

/* ─── Animated input field ───────────────────────────────────────── */
function Field({ id, label, children, hint }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      className="group"
    >
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </motion.div>
  );
}

/* ─── Password strength indicator ───────────────────────────────── */
function PasswordStrength({ password }) {
  const checks = [
    { label: '6+ characters', pass: password.length >= 6 },
    { label: 'Uppercase',     pass: /[A-Z]/.test(password) },
    { label: 'Number',        pass: /[0-9]/.test(password) },
    { label: 'Special char',  pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score   = checks.filter((c) => c.pass).length;
  const percent = (score / checks.length) * 100;
  const label   = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';
  const color   = score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-orange-400' : score === 3 ? 'bg-yellow-400' : 'bg-green-400';

  if (!password) return null;

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-400">Strength</span>
        <span className={`font-semibold ${score >= 3 ? 'text-green-400' : score === 2 ? 'text-yellow-400' : 'text-red-400'}`}>
          {label}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className="flex gap-3 flex-wrap">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`text-xs flex items-center gap-1 transition-colors ${c.pass ? 'text-green-400' : 'text-gray-500'}`}
          >
            <span aria-hidden="true">{c.pass ? '✓' : '○'}</span> {c.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Section card wrapper ───────────────────────────────────────── */
function SectionCard({ title, icon, delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass p-6 space-y-5 relative overflow-hidden"
    >
      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />

      <h2 className="font-bold text-lg flex items-center gap-2">
        <span aria-hidden="true">{icon}</span> {title}
      </h2>
      {children}
    </motion.div>
  );
}

/* ─── Submit button with loading state ───────────────────────────── */
function SubmitButton({ loading, label, loadingLabel }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className="btn-primary w-full flex items-center justify-center gap-2 relative overflow-hidden"
      aria-busy={loading}
    >
      {/* Shimmer sweep */}
      {!loading && (
        <motion.span
          className="absolute inset-0 bg-white/10"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
          aria-hidden="true"
        />
      )}
      {loading && (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
      )}
      <span>{loading ? loadingLabel : label}</span>
    </motion.button>
  );
}

/* ─── Skill preference chips ─────────────────────────────────────── */
const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];

function DifficultyPicker({ value, onChange }) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Default difficulty">
      {DIFFICULTY_OPTIONS.map((opt) => {
        const isActive = value === opt;
        const colors = { Easy: 'border-green-500/50 bg-green-500/15 text-green-400', Medium: 'border-accent/50 bg-accent/15 text-accent-light', Hard: 'border-red-500/50 bg-red-500/15 text-red-400' };
        return (
          <motion.button
            key={opt}
            type="button"
            role="radio"
            aria-checked={isActive}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(opt)}
            className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
              isActive ? colors[opt] : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─── Stats mini row ─────────────────────────────────────────────── */
function StatsRow({ user }) {
  // Safely read optional stats from user object
  const stats = user?.stats || {};
  const items = [
    { icon: '🎯', label: 'Sessions',    value: stats.totalSessions  ?? '—' },
    { icon: '📊', label: 'Avg Score',   value: stats.averageScore ? `${stats.averageScore}%` : '—' },
    { icon: '🏆', label: 'Best Score',  value: stats.bestScore    ? `${stats.bestScore}%`  : '—' },
    { icon: '🔥', label: 'Streak',      value: stats.streak       ? `${stats.streak}d`     : '—' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      role="region"
      aria-label="Your statistics"
    >
      {items.map(({ icon, label, value }) => (
        <div key={label} className="glass p-4 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors duration-300" aria-hidden="true" />
          <div className="text-2xl mb-1" aria-hidden="true">{icon}</div>
          <p className="text-lg font-bold gradient-text">{value}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      ))}
    </motion.div>
  );
}

/* ─── Show/hide password toggle input ────────────────────────────── */
function PasswordInput({ id, placeholder, value, onChange, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className="input pr-12"
        autoComplete={id === 'current-password' ? 'current-password' : 'new-password'}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition p-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        {show ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  );
}

/* ─── Main Profile page ──────────────────────────────────────────── */
export default function Profile() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    name:              user?.name                         || '',
    defaultRole:       user?.preferences?.defaultRole     || 'Software Engineer',
    defaultDifficulty: user?.preferences?.defaultDifficulty || 'Medium',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw,      setSavingPw]      = useState(false);
  const [pwSuccess,     setPwSuccess]     = useState(false);

  /* ── Save profile ── */
  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error('Name cannot be empty'); return; }
    setSavingProfile(true);
    try {
      const { data } = await api.put('/user/profile', {
        name: profile.name.trim(),
        preferences: {
          defaultRole:       profile.defaultRole,
          defaultDifficulty: profile.defaultDifficulty,
        },
      });
      updateUser({ ...user, name: data.name, preferences: data.preferences });
      toast.success('Profile saved ✓');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  /* ── Change password ── */
  const changePw = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSavingPw(true);
    try {
      await api.put('/user/password', pw);
      toast.success('Password updated ✓');
      setPw({ currentPassword: '', newPassword: '' });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <main id="main" className="px-4 md:px-8 py-6 max-w-4xl mx-auto">

      {/* ── Page heading ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold">
          Your <span className="gradient-text">Profile</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account settings and preferences</p>
      </motion.div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">

        {/* ── Left: avatar + stats ── */}
        <div className="space-y-4">
          <AvatarCard user={user} />
          <StatsRow user={user} />
        </div>

        {/* ── Right: forms ── */}
        <div className="space-y-6">

          {/* Profile form */}
          <SectionCard title="Account Info" icon="👤" delay={0.1}>
            <form onSubmit={saveProfile} className="space-y-4" noValidate>

              <Field id="profile-name" label="Full Name">
                <input
                  id="profile-name"
                  className="input"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  minLength={1}
                />
              </Field>

              <Field id="profile-email" label="Email" hint="Email cannot be changed">
                <input
                  id="profile-email"
                  className="input opacity-50 cursor-not-allowed"
                  value={user?.email || ''}
                  disabled
                  aria-readonly="true"
                />
              </Field>

              <Field id="profile-role" label="Default Interview Role" hint="Pre-fills the role in new interview setup">
                <input
                  id="profile-role"
                  className="input"
                  value={profile.defaultRole}
                  onChange={(e) => setProfile({ ...profile, defaultRole: e.target.value })}
                  placeholder="e.g. Software Engineer"
                />
              </Field>

              <Field id="profile-difficulty" label="Default Difficulty">
                <DifficultyPicker
                  value={profile.defaultDifficulty}
                  onChange={(v) => setProfile({ ...profile, defaultDifficulty: v })}
                />
              </Field>

              <SubmitButton loading={savingProfile} label="Save Changes" loadingLabel="Saving…" />
            </form>
          </SectionCard>

          {/* Password form */}
          <SectionCard title="Change Password" icon="🔒" delay={0.2}>
            <form onSubmit={changePw} className="space-y-4" noValidate>

              <Field id="current-password" label="Current Password">
                <PasswordInput
                  id="current-password"
                  placeholder="Enter current password"
                  value={pw.currentPassword}
                  onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
                  required
                />
              </Field>

              <Field id="new-password" label="New Password">
                <PasswordInput
                  id="new-password"
                  placeholder="Enter new password"
                  value={pw.newPassword}
                  onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                  required
                />
              </Field>

              {/* Live strength meter */}
              <PasswordStrength password={pw.newPassword} />

              {/* Success flash */}
              <AnimatePresence>
                {pwSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3"
                    role="status"
                  >
                    <span aria-hidden="true">✓</span> Password updated successfully
                  </motion.div>
                )}
              </AnimatePresence>

              <SubmitButton loading={savingPw} label="Update Password" loadingLabel="Updating…" />
            </form>
          </SectionCard>

          {/* Danger zone */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 border border-red-500/20"
          >
            <h2 className="font-bold text-lg flex items-center gap-2 text-red-400 mb-2">
              <span aria-hidden="true">⚠️</span> Danger Zone
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              These actions are permanent and cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => toast.error('Contact support to delete your account.')}
              className="text-sm px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:outline-offset-2 min-h-[44px]"
            >
              Delete Account
            </button>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
