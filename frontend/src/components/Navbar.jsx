import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/setup', label: 'New Interview' },
    { to: '/history', label: 'History' },
    { to: '/profile', label: 'Profile' },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass mx-2 md:mx-4 mt-2 md:mt-4 px-4 md:px-6 py-3 flex items-center justify-between"
    >
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center font-bold">AI</div>
        <span className="font-bold text-lg gradient-text hidden sm:inline">InterviewAI</span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              location.pathname === l.to ? 'bg-accent/20 text-accent-light' : 'hover:bg-white/5'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-white/10 transition" title="Theme">
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
        <button onClick={handleLogout} className="hidden md:block btn-ghost text-sm">Logout</button>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>☰</button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 glass p-4 flex flex-col gap-2 md:hidden"
        >
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg hover:bg-white/5">
              {l.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="btn-ghost text-sm mt-2">Logout</button>
        </motion.div>
      )}
    </motion.nav>
  );
}