import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─── Inject global keyframes ─────────────────────────────────────── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  :root {
    --neon: #00ffe7;
    --neon2: #ff3cac;
    --neon3: #ffd60a;
    --neon4: #7b2ff7;
    --glass-bg: rgba(10,10,30,0.65);
    --glass-border: rgba(0,255,231,0.13);
    --glow: 0 0 24px rgba(0,255,231,0.25), 0 0 60px rgba(123,47,247,0.15);
  }

  @keyframes aurora {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes float3d {
    0%,100% { transform: translateY(0px) rotateY(0deg) rotateX(5deg); }
    25%     { transform: translateY(-14px) rotateY(8deg) rotateX(2deg); }
    50%     { transform: translateY(-8px) rotateY(0deg) rotateX(8deg); }
    75%     { transform: translateY(-18px) rotateY(-8deg) rotateX(3deg); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(1.7); opacity: 0; }
  }
  @keyframes scanline {
    0%   { top: -10%; }
    100% { top: 110%; }
  }
  @keyframes glitch1 {
    0%,100% { clip-path: inset(0 0 95% 0); transform: translateX(0); }
    20%     { clip-path: inset(10% 0 80% 0); transform: translateX(-3px); }
    40%     { clip-path: inset(50% 0 30% 0); transform: translateX(3px); }
    60%     { clip-path: inset(80% 0 5%  0); transform: translateX(-2px); }
    80%     { clip-path: inset(30% 0 60% 0); transform: translateX(1px); }
  }
  @keyframes glitch2 {
    0%,100% { clip-path: inset(90% 0 0 0); transform: translateX(0); }
    20%     { clip-path: inset(70% 0 20% 0); transform: translateX(4px); }
    40%     { clip-path: inset(20% 0 70% 0); transform: translateX(-3px); }
    60%     { clip-path: inset(5%  0 85% 0); transform: translateX(2px); }
    80%     { clip-path: inset(45% 0 40% 0); transform: translateX(-1px); }
  }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(60px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
  }
  @keyframes orbit2 {
    from { transform: rotate(120deg) translateX(80px) rotate(-120deg); }
    to   { transform: rotate(480deg) translateX(80px) rotate(-480deg); }
  }
  @keyframes orbit3 {
    from { transform: rotate(240deg) translateX(50px) rotate(-240deg); }
    to   { transform: rotate(600deg) translateX(50px) rotate(-600deg); }
  }
  @keyframes neon-flicker {
    0%,19%,21%,23%,25%,54%,56%,100% { opacity: 1; text-shadow: 0 0 10px var(--neon), 0 0 30px var(--neon), 0 0 60px var(--neon); }
    20%,24%,55%                       { opacity: 0.6; text-shadow: none; }
  }
  @keyframes robot-blink {
    0%,90%,100% { transform: scaleY(1); }
    95%         { transform: scaleY(0.08); }
  }
  @keyframes robot-talk {
    0%,100% { height: 6px; }
    50%     { height: 14px; }
  }
  @keyframes badge-pop {
    0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
    70%  { transform: scale(1.15) rotate(3deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes holo-sweep {
    0%   { transform: translateX(-100%) skewX(-15deg); }
    100% { transform: translateX(300%) skewX(-15deg); }
  }
  @keyframes grid-move {
    0%   { background-position: 0 0; }
    100% { background-position: 50px 50px; }
  }
  @keyframes energy-fill {
    from { stroke-dashoffset: 350; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes counter-up {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }
  @keyframes wave-hand {
    0%,100% { transform: rotate(-5deg); }
    50%     { transform: rotate(25deg); }
  }

  .font-syne    { font-family: 'Syne', sans-serif; }
  .font-mono-sp { font-family: 'Space Mono', monospace; }

  .glass-panel {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    box-shadow: var(--glow);
  }

  .neon-text {
    color: var(--neon);
    text-shadow: 0 0 10px var(--neon), 0 0 30px var(--neon2);
    animation: neon-flicker 5s infinite;
  }

  .glitch-text {
    position: relative;
  }
  .glitch-text::before,
  .glitch-text::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
  }
  .glitch-text::before {
    color: var(--neon2);
    animation: glitch1 3s infinite;
  }
  .glitch-text::after {
    color: var(--neon);
    animation: glitch2 3s infinite;
  }

  .holo-card {
    position: relative;
    overflow: hidden;
  }
  .holo-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(0,255,231,0.08) 50%, transparent 60%);
    animation: holo-sweep 3s ease-in-out infinite;
    pointer-events: none;
    z-index: 1;
  }

  .grid-bg {
    background-image: linear-gradient(rgba(0,255,231,0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,255,231,0.04) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: grid-move 8s linear infinite;
  }

  .scanline-container {
    position: relative;
    overflow: hidden;
  }
  .scanline-container::after {
    content: '';
    position: absolute;
    left: 0; right: 0;
    height: 3px;
    background: linear-gradient(transparent, rgba(0,255,231,0.15), transparent);
    animation: scanline 4s linear infinite;
    pointer-events: none;
  }

  .energy-bar-track { stroke: rgba(0,255,231,0.1); }
  .energy-bar-fill  {
    stroke: var(--neon);
    stroke-dasharray: 350;
    stroke-dashoffset: 350;
    animation: energy-fill 1.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
    filter: drop-shadow(0 0 4px var(--neon));
  }

  .orbit-dot-1 { animation: orbit  6s linear infinite; }
  .orbit-dot-2 { animation: orbit2 9s linear infinite; }
  .orbit-dot-3 { animation: orbit3 4s linear infinite; }

  .robot-eye   { animation: robot-blink 4s ease-in-out infinite; }
  .robot-mouth { animation: robot-talk 0.4s ease-in-out infinite; }

  .toggle-track {
    width: 48px; height: 26px;
    border-radius: 13px;
    transition: background 0.3s;
    position: relative;
    cursor: pointer;
    border: 1px solid rgba(0,255,231,0.2);
  }
  .toggle-thumb {
    position: absolute;
    top: 3px; left: 3px;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .toggle-track.on  { background: linear-gradient(90deg, var(--neon4), var(--neon)); }
  .toggle-track.off { background: rgba(255,255,255,0.08); }
  .toggle-track.on .toggle-thumb  { transform: translateX(22px); background: var(--neon); box-shadow: 0 0 8px var(--neon); }

  .camera-ring {
    position: absolute; inset: -6px;
    border-radius: 50%;
    border: 2px dashed rgba(0,255,231,0.3);
    animation: spin-slow 12s linear infinite;
  }

  input.neon-input {
    background: rgba(0,255,231,0.04);
    border: 1px solid rgba(0,255,231,0.18);
    border-radius: 12px;
    color: #e0fff8;
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    padding: 12px 16px;
    width: 100%;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  input.neon-input:focus {
    border-color: var(--neon);
    box-shadow: 0 0 0 3px rgba(0,255,231,0.12), 0 0 20px rgba(0,255,231,0.1);
  }
  input.neon-input:disabled {
    opacity: 0.4; cursor: not-allowed;
  }

  .btn-neon {
    background: linear-gradient(135deg, var(--neon4), var(--neon));
    border: none;
    border-radius: 12px;
    color: #050514;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 14px;
    letter-spacing: 0.05em;
    padding: 14px 24px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    width: 100%;
    text-transform: uppercase;
  }
  .btn-neon:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,255,231,0.35); }
  .btn-neon:active { transform: translateY(0); }
  .btn-neon:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .btn-neon::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%);
    animation: holo-sweep 2.5s ease-in-out infinite;
  }

  .btn-ghost {
    background: transparent;
    border: 1px solid rgba(0,255,231,0.3);
    border-radius: 12px;
    color: var(--neon);
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 13px;
    padding: 10px 18px;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
  }
  .btn-ghost:hover {
    background: rgba(0,255,231,0.08);
    box-shadow: 0 0 20px rgba(0,255,231,0.15);
  }

  .tag-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
  }
  .tag-chip.active {
    background: rgba(0,255,231,0.12);
    border-color: var(--neon);
    color: var(--neon);
    box-shadow: 0 0 12px rgba(0,255,231,0.2);
  }
  .tag-chip.inactive {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.4);
  }
  .tag-chip.inactive:hover {
    border-color: rgba(0,255,231,0.3);
    color: rgba(0,255,231,0.6);
  }

  .badge-item {
    animation: badge-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  .wave { animation: wave-hand 0.6s ease-in-out 3; }

  .scroll-custom::-webkit-scrollbar { width: 4px; }
  .scroll-custom::-webkit-scrollbar-track { background: transparent; }
  .scroll-custom::-webkit-scrollbar-thumb { background: var(--neon); border-radius: 2px; }
`;

/* ─── Helpers ─────────────────────────────────────────────────────── */
function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

function useAnimatedCounter(target, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target || target === '—') { setVal(target); return; }
    const num = parseFloat(target);
    if (isNaN(num)) { setVal(target); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(prog * num));
      if (prog < 1) requestAnimationFrame(step);
      else setVal(num);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

/* ─── 3D Cartoon Robot Avatar ─────────────────────────────────────── */
function CartoonRobot({ photoUrl }) {
  const [talking, setTalking] = useState(false);

  useEffect(() => {
    const id = setInterval(() => { setTalking(true); setTimeout(() => setTalking(false), 1200); }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ animation: 'float3d 6s ease-in-out infinite', transformStyle: 'preserve-3d' }} className="relative w-32 h-32 mx-auto">
      {/* Orbit dots */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 0, height: 0 }}>
          <div className="orbit-dot-1" style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: 'var(--neon)', boxShadow: '0 0 8px var(--neon)', top: -5, left: -5 }} />
          <div className="orbit-dot-2" style={{ position: 'absolute', width: 7, height: 7, borderRadius: '50%', background: 'var(--neon2)', boxShadow: '0 0 8px var(--neon2)', top: -3.5, left: -3.5 }} />
          <div className="orbit-dot-3" style={{ position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: 'var(--neon3)', boxShadow: '0 0 8px var(--neon3)', top: -3, left: -3 }} />
        </div>
      </div>

      {photoUrl ? (
        /* Real photo mode */
        <div style={{ position: 'relative', zIndex: 2, width: 128, height: 128 }}>
          <div className="camera-ring" />
          <div style={{ width: 128, height: 128, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--neon)', boxShadow: '0 0 24px var(--neon), 0 0 60px rgba(0,255,231,0.3)' }}>
            <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {/* Scan overlay */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 45%, rgba(0,255,231,0.06) 50%, transparent 55%)', animation: 'scanline 3s linear infinite' }} />
          </div>
        </div>
      ) : (
        /* SVG Cartoon Robot */
        <svg viewBox="0 0 128 128" style={{ width: 128, height: 128, zIndex: 2, position: 'relative', filter: 'drop-shadow(0 0 16px rgba(0,255,231,0.5))' }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bodyGrad" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#1a2a3a" />
              <stop offset="100%" stopColor="#050514" />
            </radialGradient>
            <radialGradient id="faceGrad" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#1e3045" />
              <stop offset="100%" stopColor="#0a1525" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Neck */}
          <rect x="50" y="88" width="28" height="12" rx="4" fill="#0e1a2a" stroke="#00ffe7" strokeWidth="0.5" strokeOpacity="0.4" />

          {/* Body */}
          <rect x="28" y="98" width="72" height="24" rx="10" fill="url(#bodyGrad)" stroke="#00ffe7" strokeWidth="0.8" strokeOpacity="0.5" />
          <rect x="36" y="104" width="18" height="8" rx="3" fill="rgba(0,255,231,0.08)" stroke="#00ffe7" strokeWidth="0.5" strokeOpacity="0.4" />
          <rect x="58" y="104" width="12" height="8" rx="3" fill="rgba(255,60,172,0.12)" stroke="#ff3cac" strokeWidth="0.5" strokeOpacity="0.4" />
          <rect x="74" y="104" width="18" height="8" rx="3" fill="rgba(255,214,10,0.08)" stroke="#ffd60a" strokeWidth="0.5" strokeOpacity="0.4" />
          <circle cx="90" cy="106" r="2" fill="#ffd60a" opacity="0.8" filter="url(#glow)" />
          <circle cx="90" cy="116" r="2" fill="#00ffe7" opacity="0.6" filter="url(#glow)" />

          {/* Antenna */}
          <line x1="64" y1="12" x2="64" y2="25" stroke="#00ffe7" strokeWidth="2" strokeLinecap="round" />
          <circle cx="64" cy="10" r="5" fill="#00ffe7" filter="url(#glow)" />
          <circle cx="64" cy="10" r="3" fill="#050514" />
          <circle cx="64" cy="10" r="1.5" fill="#00ffe7" filter="url(#glow)" />

          {/* Head */}
          <rect x="20" y="25" width="88" height="65" rx="18" fill="url(#faceGrad)" stroke="#00ffe7" strokeWidth="1" strokeOpacity="0.5" />

          {/* Screen face */}
          <rect x="28" y="33" width="72" height="49" rx="12" fill="rgba(0,5,20,0.9)" stroke="#00ffe7" strokeWidth="0.5" strokeOpacity="0.3" />

          {/* Grid lines on face */}
          <line x1="28" y1="52" x2="100" y2="52" stroke="#00ffe7" strokeWidth="0.3" strokeOpacity="0.12" />
          <line x1="28" y1="62" x2="100" y2="62" strokeWidth="0.3" stroke="#00ffe7" strokeOpacity="0.12" />
          <line x1="55" y1="33" x2="55" y2="82" strokeWidth="0.3" stroke="#00ffe7" strokeOpacity="0.12" />
          <line x1="73" y1="33" x2="73" y2="82" strokeWidth="0.3" stroke="#00ffe7" strokeOpacity="0.12" />

          {/* Eyes */}
          <g filter="url(#glow)">
            <rect x="34" y="40" width="24" height="18" rx="6" fill="#001a15" className="robot-eye" style={{ transformOrigin: '46px 49px' }} />
            <rect x="36" y="42" width="20" height="14" rx="5" fill="#00ffe7" opacity="0.85" className="robot-eye" style={{ transformOrigin: '46px 49px' }} />
            <circle cx="46" cy="49" r="5" fill="#003d32" />
            <circle cx="46" cy="49" r="3" fill="#00ffe7" />
            <circle cx="44" cy="47" r="1.2" fill="white" opacity="0.9" />

            <rect x="70" y="40" width="24" height="18" rx="6" fill="#001a15" className="robot-eye" style={{ transformOrigin: '82px 49px' }} />
            <rect x="72" y="42" width="20" height="14" rx="5" fill="#00ffe7" opacity="0.85" className="robot-eye" style={{ transformOrigin: '82px 49px' }} />
            <circle cx="82" cy="49" r="5" fill="#003d32" />
            <circle cx="82" cy="49" r="3" fill="#00ffe7" />
            <circle cx="80" cy="47" r="1.2" fill="white" opacity="0.9" />
          </g>

          {/* Cheek indicators */}
          <circle cx="30" cy="62" r="5" fill="#ff3cac" opacity="0.5" filter="url(#glow)" />
          <circle cx="98" cy="62" r="5" fill="#ff3cac" opacity="0.5" filter="url(#glow)" />

          {/* Mouth */}
          <rect
            x="50" cy="72"
            y={talking ? "70" : "72"}
            width="28"
            height={talking ? "14" : "6"}
            rx="3"
            fill="#00ffe7"
            opacity="0.8"
            filter="url(#glow)"
            style={{ transition: 'all 0.15s', transformOrigin: '64px 75px' }}
          />

          {/* Ear bolts */}
          <circle cx="20" cy="58" r="6" fill="#0e1a2a" stroke="#00ffe7" strokeWidth="0.8" strokeOpacity="0.5" />
          <circle cx="20" cy="58" r="3" fill="#00ffe7" opacity="0.4" filter="url(#glow)" />
          <circle cx="108" cy="58" r="6" fill="#0e1a2a" stroke="#00ffe7" strokeWidth="0.8" strokeOpacity="0.5" />
          <circle cx="108" cy="58" r="3" fill="#00ffe7" opacity="0.4" filter="url(#glow)" />
        </svg>
      )}

      {/* Pulse rings */}
      <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', border: '2px solid rgba(0,255,231,0.3)', animation: 'pulse-ring 2s ease-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', border: '2px solid rgba(0,255,231,0.15)', animation: 'pulse-ring 2s ease-out 0.8s infinite', pointerEvents: 'none' }} />
    </div>
  );
}

/* ─── Holographic stat card ───────────────────────────────────────── */
function HoloStat({ icon, label, rawValue, color, delay }) {
  const val = useAnimatedCounter(rawValue);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className="glass-panel holo-card scanline-container p-4 text-center relative overflow-hidden"
    >
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <p className="font-syne" style={{ fontSize: 20, fontWeight: 800, color, textShadow: `0 0 12px ${color}` }}>
        {typeof val === 'number' ? val : val}
      </p>
      <p className="font-mono-sp" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
      {/* Corner hex */}
      <div style={{ position: 'absolute', top: 6, right: 8, width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
    </motion.div>
  );
}

/* ─── Achievement Badge ───────────────────────────────────────────── */
const BADGES = [
  { id: 1, icon: '🏆', label: 'First Session', unlocked: true, color: '#ffd60a' },
  { id: 2, icon: '🔥', label: '7-Day Streak', unlocked: true, color: '#ff6b35' },
  { id: 3, icon: '🎯', label: 'Perfect Score', unlocked: true, color: '#00ffe7' },
  { id: 4, icon: '⚡', label: 'Speed Demon', unlocked: true, color: '#7b2ff7' },
  { id: 5, icon: '🌟', label: 'Pro Tier', unlocked: true, color: '#ff3cac' },
  { id: 6, icon: '🤖', label: 'AI Whisperer', unlocked: false, color: '#888' },
  { id: 7, icon: '🧠', label: 'Mind Bender', unlocked: false, color: '#888' },
  { id: 8, icon: '💎', label: 'Diamond', unlocked: false, color: '#888' },
];

function BadgeGrid() {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {BADGES.map((b, i) => (
        <motion.div
          key={b.id}
          className="badge-item glass-panel holo-card"
          style={{ padding: '14px 8px', textAlign: 'center', cursor: 'pointer', animationDelay: `${i * 0.07}s`, position: 'relative', opacity: b.unlocked ? 1 : 0.4, filter: b.unlocked ? 'none' : 'grayscale(1)' }}
          whileHover={{ scale: 1.1, y: -4 }}
          onMouseEnter={() => setHovered(b.id)}
          onMouseLeave={() => setHovered(null)}
        >
          <div style={{ fontSize: 26 }}>{b.icon}</div>
          {b.unlocked && <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: b.color, boxShadow: `0 0 6px ${b.color}` }} />}
          <AnimatePresence>
            {hovered === b.id && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                style={{ position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)', background: '#050514', border: '1px solid var(--neon)', borderRadius: 8, padding: '4px 10px', whiteSpace: 'nowrap', zIndex: 50 }}
              >
                <span className="font-mono-sp" style={{ fontSize: 10, color: 'var(--neon)' }}>{b.label}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Activity heatmap (fake data) ───────────────────────────────── */
function ActivityHeatmap() {
  const weeks = 14;
  const days = 7;
  const cells = Array.from({ length: weeks * days }, (_, i) => ({
    id: i,
    intensity: Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 4) + 1,
  }));
  const colors = ['rgba(0,255,231,0.05)', 'rgba(0,255,231,0.2)', 'rgba(0,255,231,0.45)', 'rgba(0,255,231,0.7)', 'rgba(0,255,231,1)'];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginRight: 4, paddingTop: 2 }}>
          {dayLabels.map((d, i) => (
            <div key={i} className="font-mono-sp" style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', height: 14, lineHeight: '14px' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 14px)`, gridTemplateRows: `repeat(${days}, 14px)`, gap: 3 }}>
          {cells.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: c.id * 0.002 }}
              style={{ width: 14, height: 14, borderRadius: 3, background: colors[c.intensity], border: '1px solid rgba(0,255,231,0.06)', cursor: 'default' }}
              whileHover={{ scale: 1.4 }}
              title={`${c.intensity} sessions`}
            />
          ))}
        </div>
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="font-mono-sp" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Less</span>
        {colors.map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />)}
        <span className="font-mono-sp" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>More</span>
      </div>
    </div>
  );
}

/* ─── Skill Tags ──────────────────────────────────────────────────── */
const SKILL_TAGS = ['React', 'Node.js', 'Python', 'System Design', 'Algorithms', 'DSA', 'SQL', 'TypeScript', 'DevOps', 'ML/AI', 'Go', 'Rust', 'AWS', 'Docker'];

function SkillTags({ selected, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {SKILL_TAGS.map((t) => (
        <motion.button
          key={t}
          type="button"
          whileTap={{ scale: 0.92 }}
          className={`tag-chip ${selected.includes(t) ? 'active' : 'inactive'}`}
          onClick={() => onChange(selected.includes(t) ? selected.filter((s) => s !== t) : [...selected, t])}
        >
          {selected.includes(t) && <span style={{ fontSize: 8 }}>✦</span>}
          {t}
        </motion.button>
      ))}
    </div>
  );
}

/* ─── Social Links ────────────────────────────────────────────────── */
const SOCIAL_ICONS = {
  GitHub:   'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z',
  LinkedIn: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z',
  Twitter:  'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
  Portfolio:'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
};

function SocialLinks({ links, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Object.entries(SOCIAL_ICONS).map(([platform, path]) => (
        <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,255,231,0.06)', border: '1px solid rgba(0,255,231,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={path} />
            </svg>
          </div>
          <input
            className="neon-input"
            placeholder={`${platform} URL`}
            value={links[platform] || ''}
            onChange={(e) => onChange({ ...links, [platform]: e.target.value })}
            style={{ flex: 1 }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Notification toggles ────────────────────────────────────────── */
const NOTIF_OPTIONS = [
  { key: 'sessionReminders',  label: 'Session Reminders',   desc: 'Daily nudges to keep your streak' },
  { key: 'weeklyReport',      label: 'Weekly Report',       desc: 'Summary of your performance' },
  { key: 'newFeatures',       label: 'New Features',        desc: 'Product updates & releases' },
  { key: 'aiTips',            label: 'AI Coaching Tips',    desc: 'Personalized improvement hints' },
];

function Toggle({ on, onChange }) {
  return (
    <div className={`toggle-track ${on ? 'on' : 'off'}`} onClick={onChange} role="switch" aria-checked={on} tabIndex={0} onKeyDown={(e) => e.key === ' ' && onChange()}>
      <div className="toggle-thumb" />
    </div>
  );
}

function NotifToggles({ prefs, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {NOTIF_OPTIONS.map((opt) => (
        <div key={opt.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p className="font-syne" style={{ fontSize: 13, fontWeight: 700, color: '#e0fff8', marginBottom: 2 }}>{opt.label}</p>
            <p className="font-mono-sp" style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{opt.desc}</p>
          </div>
          <Toggle on={prefs[opt.key] ?? true} onChange={() => onChange({ ...prefs, [opt.key]: !prefs[opt.key] })} />
        </div>
      ))}
    </div>
  );
}

/* ─── Theme accent color picker ───────────────────────────────────── */
const ACCENT_COLORS = [
  { name: 'Cyber Teal',   value: '#00ffe7', glow: 'rgba(0,255,231,0.5)' },
  { name: 'Neon Pink',    value: '#ff3cac', glow: 'rgba(255,60,172,0.5)' },
  { name: 'Electric Yellow', value: '#ffd60a', glow: 'rgba(255,214,10,0.5)' },
  { name: 'Violet Storm', value: '#7b2ff7', glow: 'rgba(123,47,247,0.5)' },
  { name: 'Laser Green',  value: '#39ff14', glow: 'rgba(57,255,20,0.5)' },
  { name: 'Plasma Blue',  value: '#00b4ff', glow: 'rgba(0,180,255,0.5)' },
];

function ThemePicker({ active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {ACCENT_COLORS.map((c) => (
        <motion.button
          key={c.value}
          type="button"
          title={c.name}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(c.value)}
          style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: c.value,
            boxShadow: active === c.value ? `0 0 0 3px #050514, 0 0 0 5px ${c.value}, 0 0 20px ${c.glow}` : 'none',
            border: 'none', cursor: 'pointer',
            transition: 'box-shadow 0.3s',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Circular progress ring ──────────────────────────────────────── */
function ProgressRing({ value, max = 100, size = 90, label, color = 'var(--neon)' }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <div style={{ marginTop: -size/2 - 16, paddingBottom: 8 }}>
        <p className="font-syne" style={{ fontSize: 18, fontWeight: 800, color }}>{value}%</p>
        <p className="font-mono-sp" style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>{label}</p>
      </div>
    </div>
  );
}

/* ─── Photo Upload Panel ──────────────────────────────────────────── */
function PhotoUploader({ photoUrl, onPhoto }) {
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [mode, setMode] = useState(null); // null | 'camera'
  const [stream, setStream] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { toast.error('Please select a valid image'); return; }
    const url = URL.createObjectURL(file);
    onPhoto(url);
    toast.success('Photo updated! ✓');
  };

  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setStream(s);
      setMode('camera');
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 100);
    } catch { toast.error('Camera access denied'); }
  };

  const capture = () => {
    const v = videoRef.current; const c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    onPhoto(c.toDataURL('image/jpeg', 0.9));
    stopCamera(); toast.success('Photo captured! ✓');
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null); setMode(null);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <AnimatePresence>
        {mode === 'camera' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, backdropFilter: 'blur(10px)' }}
          >
            <div style={{ position: 'relative', border: '2px solid var(--neon)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 0 40px rgba(0,255,231,0.3)' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: 340, height: 260, display: 'block', objectFit: 'cover' }} />
              {/* Viewfinder corners */}
              {[['0 0 0 auto', '8px 0 0 8px'], ['0 0 auto 0', '8px 8px 0 0'], ['auto 0 0 0', '0 0 8px 8px'], ['auto auto 0 0', '0 8px 8px 0']].map(([pos, br], i) => {
                const [t,r,b,l] = pos.split(' ');
                return <div key={i} style={{ position: 'absolute', top: t !== 'auto' ? 10 : 'auto', right: r !== 'auto' ? 10 : 'auto', bottom: b !== 'auto' ? 10 : 'auto', left: l !== 'auto' ? 10 : 'auto', width: 24, height: 24, border: '2px solid var(--neon)', borderRadius: br }} />;
              })}
              <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--neon), transparent)', animation: 'scanline 2s linear infinite', opacity: 0.6 }} />
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-neon" style={{ width: 'auto', padding: '12px 28px' }} onClick={capture}>📸 Capture</button>
              <button className="btn-ghost" onClick={stopCamera}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        animate={{ borderColor: dragging ? 'var(--neon)' : 'rgba(0,255,231,0.18)', background: dragging ? 'rgba(0,255,231,0.06)' : 'transparent' }}
        style={{ border: '2px dashed rgba(0,255,231,0.18)', borderRadius: 14, padding: '20px 16px', textAlign: 'center', transition: 'all 0.3s' }}
      >
        <p className="font-mono-sp" style={{ fontSize: 11, color: 'rgba(0,255,231,0.5)', marginBottom: 12 }}>
          {dragging ? '⬇ DROP TO UPLOAD' : '🖼 DRAG & DROP · OR'}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-ghost" style={{ fontSize: 12, padding: '8px 16px' }} onClick={() => fileRef.current?.click()}>
            📁 Browse File
          </button>
          <button className="btn-ghost" style={{ fontSize: 12, padding: '8px 16px' }} onClick={openCamera}>
            📷 Use Camera
          </button>
          {photoUrl && (
            <button className="btn-ghost" style={{ fontSize: 12, padding: '8px 16px', borderColor: 'rgba(255,60,172,0.4)', color: '#ff3cac' }} onClick={() => onPhoto(null)}>
              🗑 Remove
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
      </motion.div>
    </div>
  );
}

/* ─── Section panel wrapper ───────────────────────────────────────── */
function Panel({ title, icon, delay = 0, children, accent = 'var(--neon)' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel holo-card scanline-container"
      style={{ padding: 24, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(${accent}22, transparent 70%)`, pointerEvents: 'none' }} />
      <h2 className="font-syne" style={{ fontSize: 15, fontWeight: 800, color: '#e0fff8', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span>{title}</span>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${accent}40, transparent)`, marginLeft: 8 }} />
      </h2>
      {children}
    </motion.div>
  );
}

/* ─── Field wrapper ───────────────────────────────────────────────── */
function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="font-syne" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(0,255,231,0.7)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</label>
      {children}
      {hint && <p className="font-mono-sp" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>{hint}</p>}
    </div>
  );
}

/* ─── Password strength ───────────────────────────────────────────── */
function PwStrength({ pw }) {
  const checks = [
    { l: '6+ chars',    ok: pw.length >= 6 },
    { l: 'Uppercase',   ok: /[A-Z]/.test(pw) },
    { l: 'Number',      ok: /[0-9]/.test(pw) },
    { l: 'Symbol',      ok: /[^A-Za-z0-9]/.test(pw) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['#ff3a3a', '#ff7700', '#ffd60a', '#00ffe7'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  if (!pw) return null;
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span className="font-mono-sp" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>STRENGTH</span>
        <span className="font-mono-sp" style={{ fontSize: 10, color: colors[score - 1] || '#555', fontWeight: 700 }}>{labels[score - 1] || '—'}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 8 }}>
        <motion.div
          style={{ height: '100%', borderRadius: 2, background: colors[score - 1] || '#333', boxShadow: `0 0 8px ${colors[score - 1] || '#333'}` }}
          initial={{ width: 0 }}
          animate={{ width: `${(score / 4) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {checks.map((c) => (
          <span key={c.l} className="font-mono-sp" style={{ fontSize: 9, color: c.ok ? '#00ffe7' : 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: c.ok ? '#00ffe7' : '#444' }}>{c.ok ? '✓' : '○'}</span> {c.l}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Password input ──────────────────────────────────────────────── */
function PwInput({ id, placeholder, value, onChange, autocomplete }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id} type={show ? 'text' : 'password'}
        className="neon-input" placeholder={placeholder}
        value={value} onChange={onChange} autoComplete={autocomplete}
        style={{ paddingRight: 44 }}
      />
      <button type="button" onClick={() => setShow((s) => !s)}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,255,231,0.5)', padding: 4 }}
        aria-label={show ? 'Hide' : 'Show'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {show
            ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
            : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
          }
        </svg>
      </button>
    </div>
  );
}

/* ─── Difficulty picker ───────────────────────────────────────────── */
function DiffPicker({ value, onChange }) {
  const opts = [
    { v: 'Easy',   color: '#39ff14', glow: 'rgba(57,255,20,0.3)' },
    { v: 'Medium', color: 'var(--neon)', glow: 'rgba(0,255,231,0.3)' },
    { v: 'Hard',   color: '#ff3cac', glow: 'rgba(255,60,172,0.3)' },
  ];
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {opts.map((o) => (
        <motion.button key={o.v} type="button" whileTap={{ scale: 0.93 }}
          onClick={() => onChange(o.v)}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 10, fontFamily: 'Syne, sans-serif',
            fontSize: 12, fontWeight: 800, cursor: 'pointer', border: `1px solid`,
            borderColor: value === o.v ? o.color : 'rgba(255,255,255,0.1)',
            background: value === o.v ? `rgba(${o.color === 'var(--neon)' ? '0,255,231' : o.color === '#39ff14' ? '57,255,20' : '255,60,172'},0.12)` : 'rgba(255,255,255,0.03)',
            color: value === o.v ? o.color : 'rgba(255,255,255,0.35)',
            boxShadow: value === o.v ? `0 0 14px ${o.glow}` : 'none',
            transition: 'all 0.25s',
          }}
        >{o.v}</motion.button>
      ))}
    </div>
  );
}

/* ─── Floating background particles ──────────────────────────────── */
function BgParticles() {
  const pts = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    dur: Math.random() * 10 + 8,
    delay: Math.random() * 6,
    color: ['#00ffe7', '#ff3cac', '#7b2ff7', '#ffd60a'][Math.floor(Math.random() * 4)],
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} aria-hidden>
      {pts.map((p) => (
        <motion.div key={p.id}
          style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: '50%', background: p.color, boxShadow: `0 0 4px ${p.color}` }}
          animate={{ y: [0, -40, 0], opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {/* Aurora bands */}
      <div style={{ position: 'absolute', top: '10%', left: '-20%', width: '60%', height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(123,47,247,0.08), transparent)', filter: 'blur(60px)', animation: 'aurora 12s ease infinite', backgroundSize: '300% 300%' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '-10%', width: '50%', height: 250, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,255,231,0.06), transparent)', filter: 'blur(50px)' }} />
    </div>
  );
}

/* ─── Timeline ────────────────────────────────────────────────────── */
const TIMELINE = [
  { time: '2h ago',   text: 'Completed System Design interview',  score: 92, icon: '🎯' },
  { time: '1d ago',   text: 'Practiced React hooks (Hard)',        score: 78, icon: '⚛️' },
  { time: '2d ago',   text: 'DSA session — Arrays & Trees',        score: 85, icon: '🌲' },
  { time: '4d ago',   text: 'Behavioral round mock',               score: 88, icon: '💬' },
  { time: '1w ago',   text: 'First session completed!',            score: 70, icon: '🚀' },
];

function Timeline() {
  return (
    <div style={{ position: 'relative', paddingLeft: 24 }}>
      {/* Track */}
      <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg, var(--neon), var(--neon4), transparent)' }} />
      {TIMELINE.map((item, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 * i }}
          style={{ position: 'relative', paddingLeft: 20, paddingBottom: 18, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}
        >
          {/* Dot */}
          <div style={{ position: 'absolute', left: -3, top: 4, width: 10, height: 10, borderRadius: '50%', background: 'var(--neon)', boxShadow: '0 0 8px var(--neon)', border: '2px solid #050514' }} />
          <div style={{ flex: 1 }}>
            <p className="font-syne" style={{ fontSize: 12, fontWeight: 700, color: '#e0fff8' }}>{item.icon} {item.text}</p>
            <p className="font-mono-sp" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{item.time}</p>
          </div>
          <div style={{ flexShrink: 0, padding: '3px 10px', borderRadius: 99, background: item.score >= 85 ? 'rgba(0,255,231,0.1)' : 'rgba(255,214,10,0.1)', border: `1px solid ${item.score >= 85 ? 'rgba(0,255,231,0.3)' : 'rgba(255,214,10,0.3)'}` }}>
            <span className="font-mono-sp" style={{ fontSize: 10, color: item.score >= 85 ? 'var(--neon)' : '#ffd60a', fontWeight: 700 }}>{item.score}%</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main Profile component ──────────────────────────────────────── */
export default function Profile() {
  const { user, updateUser } = useAuth();

  const [photoUrl, setPhotoUrl]       = useState(null);
  const [profile,  setProfile]        = useState({
    name:              user?.name || '',
    bio:               user?.bio  || '',
    defaultRole:       user?.preferences?.defaultRole       || 'Software Engineer',
    defaultDifficulty: user?.preferences?.defaultDifficulty || 'Medium',
    location:          user?.location  || '',
    skills:            user?.skills    || [],
    socialLinks:       user?.socialLinks || {},
    accentColor:       user?.accentColor || '#00ffe7',
    notifications:     user?.notifications || {},
  });
  const [pw,             setPw]            = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile,  setSavingProfile] = useState(false);
  const [savingPw,       setSavingPw]      = useState(false);
  const [pwSuccess,      setPwSuccess]     = useState(false);
  const [activeTab,      setActiveTab]     = useState('account');
  const [waving,         setWaving]        = useState(false);

  const stats = user?.stats || {};

  /* Apply accent color to CSS var */
  useEffect(() => {
    document.documentElement.style.setProperty('--neon', profile.accentColor);
  }, [profile.accentColor]);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error('Name cannot be empty'); return; }
    setSavingProfile(true);
    try {
      const { data } = await api.put('/user/profile', {
        name: profile.name.trim(),
        bio:  profile.bio,
        location: profile.location,
        skills: profile.skills,
        socialLinks: profile.socialLinks,
        accentColor: profile.accentColor,
        preferences: { defaultRole: profile.defaultRole, defaultDifficulty: profile.defaultDifficulty },
        notifications: profile.notifications,
      });
      updateUser({ ...user, ...data });
      toast.success('Profile synced ✓');
    } catch { toast.error('Sync failed'); }
    finally { setSavingProfile(false); }
  };

  const changePw = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    setSavingPw(true);
    try {
      await api.put('/user/password', pw);
      toast.success('Password updated ✓');
      setPw({ currentPassword: '', newPassword: '' });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSavingPw(false); }
  };

  const TABS = [
    { id: 'account',  label: 'ACCOUNT',  icon: '👤' },
    { id: 'skills',   label: 'SKILLS',   icon: '⚡' },
    { id: 'security', label: 'SECURITY', icon: '🔒' },
    { id: 'social',   label: 'SOCIAL',   icon: '🌐' },
    { id: 'notifs',   label: 'NOTIFS',   icon: '🔔' },
    { id: 'theme',    label: 'THEME',    icon: '🎨' },
  ];

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <BgParticles />

      <main className="grid-bg" style={{ minHeight: '100vh', padding: '32px 20px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Page Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <h1 className="font-syne glitch-text" data-text="NEURAL•PROFILE" style={{ fontSize: 'clamp(24px, 5vw, 42px)', fontWeight: 800, color: '#e0fff8', letterSpacing: '-0.02em', position: 'relative' }}>
              NEURAL<span style={{ color: 'var(--neon)', textShadow: '0 0 16px var(--neon)' }}>•</span>PROFILE
            </h1>
            <motion.span
              className={waving ? 'wave' : ''}
              style={{ fontSize: 28, cursor: 'pointer', display: 'inline-block' }}
              onClick={() => { setWaving(true); setTimeout(() => setWaving(false), 2000); }}
            >👋</motion.span>
          </div>
          <p className="font-mono-sp" style={{ fontSize: 11, color: 'rgba(0,255,231,0.5)', letterSpacing: '0.15em', marginTop: 6 }}>
            SYS://USER.SETTINGS.v2 &nbsp;·&nbsp; AUTHENTICATED &nbsp;·&nbsp; {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 300px) 1fr', gap: 20 }}>

          {/* ─────── LEFT COLUMN ─────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Avatar card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel holo-card scanline-container"
              style={{ padding: '28px 20px', textAlign: 'center', position: 'relative' }}
            >
              {/* Level badge top-right */}
              <div style={{ position: 'absolute', top: 14, right: 14, padding: '3px 10px', borderRadius: 99, background: 'rgba(123,47,247,0.2)', border: '1px solid rgba(123,47,247,0.4)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 10 }}>⚡</span>
                <span className="font-mono-sp" style={{ fontSize: 9, color: '#b59fff', fontWeight: 700 }}>PRO</span>
              </div>

              <CartoonRobot photoUrl={photoUrl} />

              <div style={{ marginTop: 20 }}>
                <h2 className="font-syne neon-text" style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                  {user?.name || 'Neural User'}
                </h2>
                <p className="font-mono-sp" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{user?.email}</p>
                {profile.bio && <p className="font-mono-sp" style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, padding: '0 4px' }}>{profile.bio}</p>}
                <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(0,255,231,0.05)', border: '1px solid rgba(0,255,231,0.15)' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#39ff14', boxShadow: '0 0 6px #39ff14' }} />
                  <span className="font-mono-sp" style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>ONLINE NOW</span>
                </div>
                {profile.location && (
                  <p className="font-mono-sp" style={{ fontSize: 10, color: 'rgba(0,255,231,0.4)', marginTop: 8 }}>📍 {profile.location}</p>
                )}
                {/* Member since */}
                <p className="font-mono-sp" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Member · {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Neural-Hire'}
                </p>
              </div>

              {/* Photo uploader */}
              <div style={{ marginTop: 16 }}>
                <PhotoUploader photoUrl={photoUrl} onPhoto={setPhotoUrl} />
              </div>
            </motion.div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <HoloStat icon="🎯" label="Sessions"  rawValue={stats.totalSessions ?? 0}  color="var(--neon)"  delay={0.1} />
              <HoloStat icon="📊" label="Avg Score" rawValue={stats.averageScore ?? 0}    color="#ff3cac"      delay={0.15} />
              <HoloStat icon="🏆" label="Best"      rawValue={stats.bestScore ?? 0}       color="#ffd60a"      delay={0.2} />
              <HoloStat icon="🔥" label="Streak"    rawValue={stats.streak ?? 0}          color="#ff6b35"      delay={0.25} />
            </div>

            {/* Progress rings */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="glass-panel"
              style={{ padding: '16px 12px' }}
            >
              <p className="font-syne" style={{ fontSize: 11, fontWeight: 800, color: 'rgba(0,255,231,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, textAlign: 'center' }}>Performance</p>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <ProgressRing value={stats.averageScore ?? 72} label="AVG"    color="var(--neon)"  />
                <ProgressRing value={stats.bestScore    ?? 94} label="BEST"   color="#ff3cac"      />
                <ProgressRing value={Math.min((stats.streak ?? 4) * 8, 100)} label="STREAK" color="#ffd60a" />
              </div>
            </motion.div>

            {/* Badges */}
            <Panel title="Achievements" icon="🏅" delay={0.35} accent="#ffd60a">
              <BadgeGrid />
            </Panel>
          </div>

          {/* ─────── RIGHT COLUMN ─────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Tab bar */}
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
              className="glass-panel"
              style={{ padding: '6px 8px', display: 'flex', gap: 4, flexWrap: 'wrap' }}
            >
              {TABS.map((t) => (
                <motion.button
                  key={t.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setActiveTab(t.id)}
                  className="font-syne"
                  style={{
                    flex: 1, minWidth: 80, padding: '9px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', transition: 'all 0.25s',
                    background: activeTab === t.id ? 'var(--neon)' : 'transparent',
                    color: activeTab === t.id ? '#050514' : 'rgba(255,255,255,0.4)',
                    boxShadow: activeTab === t.id ? '0 0 16px rgba(0,255,231,0.4)' : 'none',
                  }}
                >
                  {t.icon} {t.label}
                </motion.button>
              ))}
            </motion.div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >

                {/* ── ACCOUNT TAB ── */}
                {activeTab === 'account' && (
                  <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
                    <Panel title="Account Info" icon="👤" delay={0}>
                      <Field label="Full Name">
                        <input className="neon-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Your name" autoComplete="name" />
                      </Field>
                      <Field label="Email" hint="Email address is locked — contact support to change">
                        <input className="neon-input" value={user?.email || ''} disabled style={{ opacity: 0.4 }} />
                      </Field>
                      <Field label="Bio">
                        <textarea
                          className="neon-input"
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          placeholder="Tell the AI a bit about yourself..."
                          rows={3}
                          style={{ resize: 'vertical', fontFamily: 'Space Mono, monospace', fontSize: 13 }}
                        />
                      </Field>
                      <Field label="Location">
                        <input className="neon-input" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="e.g. San Francisco, CA" />
                      </Field>
                      <Field label="Default Interview Role" hint="Pre-fills when starting a new session">
                        <input className="neon-input" value={profile.defaultRole} onChange={(e) => setProfile({ ...profile, defaultRole: e.target.value })} placeholder="e.g. Software Engineer" />
                      </Field>
                      <Field label="Default Difficulty">
                        <DiffPicker value={profile.defaultDifficulty} onChange={(v) => setProfile({ ...profile, defaultDifficulty: v })} />
                      </Field>
                    </Panel>

                    <motion.button
                      type="submit" disabled={savingProfile}
                      className="btn-neon"
                      whileHover={{ scale: savingProfile ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {savingProfile ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#050514', borderRadius: '50%', display: 'inline-block', animation: 'spin-slow 0.8s linear infinite' }} />
                          SYNCING…
                        </span>
                      ) : '⬆ SYNC PROFILE'}
                    </motion.button>
                  </form>
                )}

                {/* ── SKILLS TAB ── */}
                {activeTab === 'skills' && (
                  <>
                    <Panel title="Skill Stack" icon="⚡" delay={0} accent="#7b2ff7">
                      <p className="font-mono-sp" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>Select all technologies you want to practice</p>
                      <SkillTags selected={profile.skills} onChange={(s) => setProfile({ ...profile, skills: s })} />
                    </Panel>
                    <Panel title="Activity Log" icon="📅" delay={0.1} accent="#ffd60a">
                      <ActivityHeatmap />
                    </Panel>
                    <Panel title="Recent Sessions" icon="🕐" delay={0.15} accent="#ff3cac">
                      <Timeline />
                    </Panel>
                    <motion.button className="btn-neon" onClick={() => { setProfile((p) => ({ ...p })); toast.success('Skills saved ✓'); }}>
                      ⬆ SAVE SKILLS
                    </motion.button>
                  </>
                )}

                {/* ── SECURITY TAB ── */}
                {activeTab === 'security' && (
                  <form onSubmit={changePw} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Panel title="Change Password" icon="🔒" delay={0} accent="#ff3cac">
                      <Field label="Current Password">
                        <PwInput id="cur-pw" placeholder="Enter current password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autocomplete="current-password" />
                      </Field>
                      <Field label="New Password">
                        <PwInput id="new-pw" placeholder="Choose new password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autocomplete="new-password" />
                      </Field>
                      <PwStrength pw={pw.newPassword} />

                      <AnimatePresence>
                        {pwSuccess && (
                          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(0,255,231,0.08)', border: '1px solid rgba(0,255,231,0.25)', color: 'var(--neon)' }}
                            className="font-mono-sp" role="status"
                          >✓ &nbsp;Password updated successfully</motion.div>
                        )}
                      </AnimatePresence>
                    </Panel>

                    <Panel title="Active Sessions" icon="🖥️" delay={0.1} accent="#7b2ff7">
                      {[{ device: 'MacBook Pro', loc: 'San Francisco', time: 'Now', active: true }, { device: 'iPhone 15', loc: 'San Jose', time: '3h ago', active: false }].map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.active ? '#39ff14' : 'rgba(255,255,255,0.2)', boxShadow: s.active ? '0 0 6px #39ff14' : 'none' }} />
                            <div>
                              <p className="font-syne" style={{ fontSize: 12, fontWeight: 700, color: '#e0fff8' }}>{s.device}</p>
                              <p className="font-mono-sp" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{s.loc} · {s.time}</p>
                            </div>
                          </div>
                          {!s.active && <button className="btn-ghost" style={{ padding: '4px 12px', fontSize: 10 }}>Revoke</button>}
                        </div>
                      ))}
                    </Panel>

                    <motion.button type="submit" disabled={savingPw} className="btn-neon" whileTap={{ scale: 0.98 }}>
                      {savingPw ? 'UPDATING…' : '🔐 UPDATE PASSWORD'}
                    </motion.button>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                      className="glass-panel" style={{ padding: 20, border: '1px solid rgba(255,60,172,0.25)' }}
                    >
                      <h3 className="font-syne" style={{ fontSize: 13, fontWeight: 800, color: '#ff3cac', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>⚠️ DANGER ZONE</h3>
                      <p className="font-mono-sp" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>These actions are irreversible and permanent.</p>
                      <button type="button" className="btn-ghost" style={{ borderColor: 'rgba(255,60,172,0.4)', color: '#ff3cac', fontSize: 12 }} onClick={() => toast.error('Contact support to delete your account')}>
                        🗑 DELETE ACCOUNT
                      </button>
                    </motion.div>
                  </form>
                )}

                {/* ── SOCIAL TAB ── */}
                {activeTab === 'social' && (
                  <>
                    <Panel title="Social Links" icon="🌐" delay={0} accent="#00b4ff">
                      <SocialLinks links={profile.socialLinks} onChange={(l) => setProfile({ ...profile, socialLinks: l })} />
                    </Panel>
                    <motion.button className="btn-neon" onClick={() => { toast.success('Social links saved ✓'); }}>⬆ SAVE LINKS</motion.button>
                  </>
                )}

                {/* ── NOTIFS TAB ── */}
                {activeTab === 'notifs' && (
                  <>
                    <Panel title="Notifications" icon="🔔" delay={0} accent="#ffd60a">
                      <NotifToggles prefs={profile.notifications} onChange={(n) => setProfile({ ...profile, notifications: n })} />
                    </Panel>
                    <motion.button className="btn-neon" onClick={() => toast.success('Preferences saved ✓')}>⬆ SAVE PREFERENCES</motion.button>
                  </>
                )}

                {/* ── THEME TAB ── */}
                {activeTab === 'theme' && (
                  <>
                    <Panel title="Accent Color" icon="🎨" delay={0} accent={profile.accentColor}>
                      <p className="font-mono-sp" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>Live-previews across the entire UI</p>
                      <ThemePicker active={profile.accentColor} onChange={(c) => setProfile({ ...profile, accentColor: c })} />
                    </Panel>
                    <Panel title="UI Preview" icon="🖥️" delay={0.1} accent={profile.accentColor}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${profile.accentColor}, transparent)`, boxShadow: `0 0 12px ${profile.accentColor}40` }} />
                        <div style={{ height: 8, borderRadius: 4, background: `linear-gradient(90deg, transparent, ${profile.accentColor}, transparent)` }} />
                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                          {[30, 60, 80, 45, 90, 55, 75].map((h, i) => (
                            <div key={i} style={{ flex: 1, height: h, borderRadius: 4, background: `${profile.accentColor}${Math.floor((i + 1) / 7 * 255).toString(16).padStart(2, '0')}`, boxShadow: `0 0 8px ${profile.accentColor}30`, transition: 'all 0.4s' }} />
                          ))}
                        </div>
                        <div style={{ padding: '10px 14px', borderRadius: 10, background: `${profile.accentColor}15`, border: `1px solid ${profile.accentColor}40`, color: profile.accentColor }} className="font-mono-sp" style2={{ fontSize: 11 }}>
                          <span style={{ fontSize: 11 }}>[SYS] Accent active: <strong>{profile.accentColor}</strong></span>
                        </div>
                      </div>
                    </Panel>
                    <motion.button className="btn-neon" style={{ background: `linear-gradient(135deg, ${profile.accentColor}, #7b2ff7)` }} onClick={() => toast.success('Theme applied ✓')}>
                      🎨 APPLY THEME
                    </motion.button>
                  </>
                )}

              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </main>
    </>
  );
}
