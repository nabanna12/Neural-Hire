/**
 * InterviewSetup.jsx — "The Boardroom Brief"
 * Classic-Professional + Modern 3D Depth theme
 * Senior Creative Web Design implementation
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

/* ─────────────────────────────────────────────────────────────────
   DESIGN TOKENS & GLOBAL STYLES
───────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --ink:            #0D0F14;
    --surface:        #13161E;
    --surface-raised: #1A1E28;
    --border:         #2A2E3D;
    --border-glow:    #4A5070;
    --gold:           #C9A84C;
    --gold-light:     #E8C96A;
    --gold-dim:       #7A6230;
    --gold-10:        rgba(201,168,76,0.10);
    --gold-18:        rgba(201,168,76,0.18);
    --gold-30:        rgba(201,168,76,0.30);
    --ivory:          #F2EDE4;
    --ivory-dim:      #9A9590;
    --ivory-ghost:    #3D3A35;
    --crimson:        #8B2635;
    --sage:           #3D6B5A;
    --amber-c:        #C47B25;
    --shadow-deep:    rgba(0,0,0,0.6);
    --shadow-gold:    rgba(201,168,76,0.25);
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
    .parallax-orb { display: none !important; }
  }

  /* ── Keyframes ── */
  @keyframes shimmer-sweep {
    0%   { transform: translateX(-120%) skewX(-15deg); }
    100% { transform: translateX(300%)  skewX(-15deg); }
  }
  @keyframes gold-pulse {
    0%, 100% { box-shadow: 0 0 0 0 var(--gold-30); }
    50%      { box-shadow: 0 0 0 8px rgba(201,168,76,0); }
  }
  @keyframes orb-drift-a {
    0%, 100% { transform: translate(0px, 0px) scale(1); }
    33%      { transform: translate(18px, -22px) scale(1.04); }
    66%      { transform: translate(-12px, 14px) scale(0.97); }
  }
  @keyframes orb-drift-b {
    0%, 100% { transform: translate(0px, 0px) scale(1); }
    33%      { transform: translate(-20px, 16px) scale(1.06); }
    66%      { transform: translate(14px, -18px) scale(0.95); }
  }
  @keyframes spin-cw {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes text-morph-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes check-draw {
    from { stroke-dashoffset: 30; opacity: 0; }
    to   { stroke-dashoffset: 0;  opacity: 1; }
  }
  @keyframes progress-fill {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes float-subtle {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-5px); }
  }
  @keyframes grain {
    0%, 100% { transform: translate(0,0); }
    10%      { transform: translate(-2%,-3%); }
    20%      { transform: translate(3%, 1%); }
    30%      { transform: translate(-1%, 4%); }
    40%      { transform: translate(2%,-1%); }
    50%      { transform: translate(-3%, 2%); }
    60%      { transform: translate(1%, 3%); }
    70%      { transform: translate(3%,-2%); }
    80%      { transform: translate(-2%, 1%); }
    90%      { transform: translate(1%,-3%); }
  }
  @keyframes border-trace {
    0%   { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  /* ── Base resets ── */
  .is-setup * { box-sizing: border-box; }

  /* ── Font utilities ── */
  .f-cormorant { font-family: 'Cormorant Garamond', Georgia, serif; }
  .f-mono      { font-family: 'DM Mono', 'Courier New', monospace; }
  .f-outfit    { font-family: 'Outfit', system-ui, sans-serif; }

  /* ── Custom slider ── */
  .gold-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    outline: none;
    cursor: pointer;
    background: linear-gradient(
      to right,
      var(--gold) 0%,
      var(--gold) var(--pct, 50%),
      var(--border) var(--pct, 50%),
      var(--border) 100%
    );
  }
  .gold-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px; height: 22px;
    border-radius: 50%;
    background: var(--gold);
    border: 3px solid var(--ink);
    box-shadow: 0 0 0 2px var(--gold), 0 4px 12px var(--shadow-gold);
    cursor: grab;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .gold-slider::-webkit-slider-thumb:hover,
  .gold-slider:active::-webkit-slider-thumb {
    transform: scale(1.2);
    box-shadow: 0 0 0 3px var(--gold), 0 0 20px var(--shadow-gold);
  }
  .gold-slider::-moz-range-thumb {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: var(--gold);
    border: 3px solid var(--ink);
    box-shadow: 0 0 0 2px var(--gold);
    cursor: grab;
  }
  .gold-slider:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 4px;
  }

  /* ── Scrollbar ── */
  .is-setup ::-webkit-scrollbar { width: 4px; }
  .is-setup ::-webkit-scrollbar-track { background: transparent; }
  .is-setup ::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 2px; }

  /* ── Focus ring ── */
  .is-setup *:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 3px;
    border-radius: 4px;
  }
`;

/* ─────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────── */
const ROLES = [
  { id: 'swe',    label: 'Software Engineer',       icon: '⌨' },
  { id: 'fe',     label: 'Frontend Developer',       icon: '◨' },
  { id: 'be',     label: 'Backend Developer',        icon: '◫' },
  { id: 'fs',     label: 'Full Stack Developer',     icon: '◧' },
  { id: 'ds',     label: 'Data Scientist',           icon: '∑' },
  { id: 'da',     label: 'Data Analyst',             icon: '≋' },
  { id: 'ml',     label: 'ML Engineer',              icon: '⬡' },
  { id: 'devops', label: 'DevOps Engineer',          icon: '⟳' },
  { id: 'cloud',  label: 'Cloud Engineer',           icon: '⌁' },
  { id: 'pm',     label: 'Product Manager',          icon: '◈' },
  { id: 'proj',   label: 'Project Manager',          icon: '⊞' },
  { id: 'ux',     label: 'UX/UI Designer',           icon: '✦' },
  { id: 'qa',     label: 'QA Engineer',              icon: '◎' },
  { id: 'sec',    label: 'Cybersecurity Analyst',    icon: '⊕' },
  { id: 'mob',    label: 'Mobile Developer',         icon: '▣' },
  { id: 'ba',     label: 'Business Analyst',         icon: '≡' },
];

const INTERVIEW_TYPES = [
  { v: 'Behavioral', desc: 'Situational & soft skills', icon: '◑' },
  { v: 'Technical',  desc: 'Coding & system design',    icon: '◐' },
  { v: 'HR',         desc: 'Culture & expectations',    icon: '◒' },
  { v: 'Mixed',      desc: 'Comprehensive session',     icon: '◉' },
];

const DIFFICULTIES = [
  { v: 'Easy',   color: '#3D6B5A', glow: 'rgba(61,107,90,0.4)',   label: 'Entry' },
  { v: 'Medium', color: '#C47B25', glow: 'rgba(196,123,37,0.4)',  label: 'Senior' },
  { v: 'Hard',   color: '#8B2635', glow: 'rgba(139,38,53,0.4)',   label: 'Principal' },
];

const STEPS = ['Role', 'Type', 'Difficulty', 'Questions', 'Mode'];

/* ─────────────────────────────────────────────────────────────────
   CUSTOM HOOK: 3D Tilt
───────────────────────────────────────────────────────────────── */
function use3DTilt({ maxAngle = 8, scale = 1.035, perspective = 900, speed = 120, disabled = false } = {}) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, hovered: false });

  const onMouseMove = useCallback((e) => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -maxAngle;
    const ry = ((e.clientX - cx) / (rect.width  / 2)) *  maxAngle;
    setTilt({ rx, ry, hovered: true });
  }, [disabled, maxAngle]);

  const onMouseLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0, hovered: false });
  }, []);

  const style = {
    transform: `perspective(${perspective}px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) ${tilt.hovered ? `scale(${scale})` : 'scale(1)'}`,
    transition: `transform ${speed}ms ease-out`,
    transformStyle: 'preserve-3d',
  };

  return { ref, style, tilt, onMouseMove, onMouseLeave };
}

/* ─────────────────────────────────────────────────────────────────
   PARALLAX ORBS BACKGROUND
───────────────────────────────────────────────────────────────── */
function ParallaxBackground() {
  const containerRef = useRef(null);
  const orbARef = useRef(null);
  const orbBRef = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const nx = (e.clientX / w - 0.5) * 2; // -1 to 1
      const ny = (e.clientY / h - 0.5) * 2;
      if (orbARef.current) {
        orbARef.current.style.transform = `translate(${nx * 18}px, ${ny * 12}px)`;
      }
      if (orbBRef.current) {
        orbBRef.current.style.transform = `translate(${nx * -28}px, ${ny * -18}px)`;
      }
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div ref={containerRef} aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {/* Primary gold orb */}
      <div
        ref={orbARef}
        className="parallax-orb"
        style={{
          position: 'absolute', top: '8%', right: '12%',
          width: 420, height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 40%, rgba(201,168,76,0.09), rgba(201,168,76,0.03) 50%, transparent 75%)',
          filter: 'blur(40px)',
          animation: 'orb-drift-a 18s ease-in-out infinite',
          transition: 'transform 0.08s ease-out',
        }}
      />
      {/* Deep navy-blue orb */}
      <div
        ref={orbBRef}
        className="parallax-orb"
        style={{
          position: 'absolute', bottom: '10%', left: '5%',
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 60% 60%, rgba(26,45,90,0.35), rgba(13,15,20,0.1) 55%, transparent 80%)',
          filter: 'blur(60px)',
          animation: 'orb-drift-b 22s ease-in-out infinite',
          transition: 'transform 0.06s ease-out',
        }}
      />
      {/* Subtle grain texture overlay */}
      <div style={{
        position: 'absolute', inset: '-200%',
        opacity: 0.025,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '180px 180px',
        animation: 'grain 0.8s steps(1) infinite',
        pointerEvents: 'none',
      }} />
      {/* Horizontal light lines — architectural depth */}
      {[15, 45, 72, 90].map((pct, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, right: 0,
          top: `${pct}%`, height: 1,
          background: `linear-gradient(90deg, transparent, rgba(201,168,76,${0.015 + i * 0.008}), transparent)`,
        }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STEP PROGRESS INDICATOR
───────────────────────────────────────────────────────────────── */
function StepIndicator({ current, total, labels }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${current + 1} of ${total}: ${labels[current]}`}
    >
      {labels.map((label, i) => {
        const isDone    = i < current;
        const isActive  = i === current;
        const isFuture  = i > current;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Node */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div
                animate={{
                  background:  isDone ? 'var(--gold)' : isActive ? 'var(--surface)' : 'var(--surface)',
                  borderColor: isDone ? 'var(--gold)' : isActive ? 'var(--gold)' : 'var(--border)',
                  boxShadow:   isActive ? '0 0 0 4px var(--gold-10), 0 0 16px var(--shadow-gold)' : 'none',
                }}
                transition={{ duration: 0.35 }}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '2px solid',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                  animation: isActive ? 'gold-pulse 2s ease-in-out infinite' : 'none',
                }}
              >
                {isDone ? (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ strokeDasharray: 30, strokeDashoffset: 0, animation: 'check-draw 0.3s ease-out' }} />
                  </svg>
                ) : (
                  <span className="f-mono" style={{ fontSize: 10, color: isActive ? 'var(--gold)' : 'var(--ivory-ghost)', fontWeight: 500 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                )}
              </motion.div>

              {/* Label below node */}
              <span className="f-mono" style={{
                position: 'absolute', top: 36,
                fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: isActive ? 'var(--gold)' : isDone ? 'var(--gold-dim)' : 'var(--ivory-ghost)',
                whiteSpace: 'nowrap',
                transition: 'color 0.3s',
              }}>
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < labels.length - 1 && (
              <div style={{ width: 48, height: 2, margin: '0 4px', background: 'var(--border)', position: 'relative', overflow: 'hidden' }}>
                <motion.div
                  animate={{ scaleX: isDone ? 1 : 0 }}
                  initial={{ scaleX: 0 }}
                  style={{ position: 'absolute', inset: 0, background: 'var(--gold)', transformOrigin: 'left' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ROLE CARD — 3D Tilt + Shimmer
───────────────────────────────────────────────────────────────── */
function RoleCard({ role, selected, onSelect }) {
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const { ref, style: tiltStyle, tilt, onMouseMove, onMouseLeave } = use3DTilt({
    maxAngle: 7, scale: 1.04, perspective: 800, speed: 110, disabled: isMobile || selected,
  });

  return (
    <motion.button
      ref={ref}
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(role.label)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      style={{
        ...tiltStyle,
        position: 'relative',
        width: '100%',
        padding: '16px 14px',
        background: selected ? 'var(--gold-10)' : 'var(--surface)',
        border: `1px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
        borderRadius: 10,
        cursor: 'pointer',
        textAlign: 'left',
        overflow: 'hidden',
        boxShadow: selected
          ? `0 0 0 1px var(--gold-30), 0 8px 32px var(--shadow-gold), inset 0 1px 0 var(--gold-18)`
          : `0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)`,
        animation: selected ? 'gold-pulse 2.5s ease-in-out infinite' : 'none',
        transition: `border-color 0.25s, background 0.25s, box-shadow 0.25s`,
      }}
    >
      {/* 3D depth plane — floats above surface */}
      <div style={{ transform: 'translateZ(8px)', transformStyle: 'preserve-3d' }}>
        {/* Icon */}
        <div style={{
          fontSize: 18, marginBottom: 8,
          color: selected ? 'var(--gold)' : 'var(--ivory-dim)',
          transition: 'color 0.25s',
          display: 'block',
        }}>
          {role.icon}
        </div>

        {/* Role label */}
        <p className="f-outfit" style={{
          fontSize: 12, fontWeight: selected ? 600 : 400, lineHeight: 1.35,
          color: selected ? 'var(--ivory)' : 'var(--ivory-dim)',
          transition: 'color 0.25s, font-weight 0.1s',
          margin: 0,
        }}>
          {role.label}
        </p>
      </div>

      {/* Selected check — top right */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 18, height: 18, borderRadius: '50%',
              background: 'var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="9" height="8" viewBox="0 0 9 8" fill="none">
              <path d="M1 4L3.5 6.5L8 1" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shimmer sweep on hover/select */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 10, pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: '50%',
          background: 'linear-gradient(105deg, transparent 40%, rgba(201,168,76,0.08) 55%, transparent 70%)',
          animation: selected ? 'shimmer-sweep 2.5s ease-in-out infinite' : tilt.hovered ? 'shimmer-sweep 1s ease-out' : 'none',
        }} />
      </div>

      {/* Bottom accent bar — selected only */}
      <motion.div
        animate={{ scaleX: selected ? 1 : 0 }}
        initial={{ scaleX: 0 }}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
          transformOrigin: 'center',
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION DIVIDER
───────────────────────────────────────────────────────────────── */
function SectionDivider({ label, step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
      <span className="f-mono" style={{ fontSize: 9, color: 'var(--gold-dim)', letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {String(step).padStart(2, '0')} · {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--gold-30), transparent)' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TYPE CARD
───────────────────────────────────────────────────────────────── */
function TypeCard({ item, selected, onSelect }) {
  const { ref, style: tiltStyle, tilt, onMouseMove, onMouseLeave } = use3DTilt({ maxAngle: 5, scale: 1.03, perspective: 700, speed: 100 });

  return (
    <motion.button
      ref={ref}
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(item.v)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileTap={{ scale: 0.97 }}
      style={{
        ...tiltStyle,
        padding: '18px 16px',
        background: selected ? 'var(--gold-10)' : 'var(--surface)',
        border: `1px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
        borderRadius: 10,
        cursor: 'pointer',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: selected ? `0 6px 24px var(--shadow-gold), inset 0 1px 0 var(--gold-18)` : `0 2px 8px rgba(0,0,0,0.3)`,
        transition: 'border-color 0.25s, background 0.25s, box-shadow 0.25s',
      }}
    >
      <div style={{ fontSize: 20, color: selected ? 'var(--gold)' : 'var(--ivory-dim)', marginBottom: 8, transition: 'color 0.25s' }}>
        {item.icon}
      </div>
      <p className="f-outfit" style={{ fontSize: 13, fontWeight: selected ? 600 : 500, color: selected ? 'var(--ivory)' : 'var(--ivory-dim)', margin: 0, transition: 'color 0.25s' }}>
        {item.v}
      </p>
      <p className="f-mono" style={{ fontSize: 9, color: 'var(--ivory-ghost)', marginTop: 5, letterSpacing: '0.06em' }}>
        {item.desc}
      </p>

      {/* Hover shimmer */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 10, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', inset: 0, width: '50%',
          background: 'linear-gradient(105deg, transparent 40%, rgba(201,168,76,0.07) 55%, transparent 70%)',
          animation: tilt.hovered || selected ? 'shimmer-sweep 2s ease-in-out infinite' : 'none',
        }} />
      </div>

      {/* Selected accent line */}
      <motion.div
        animate={{ scaleX: selected ? 1 : 0 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', transformOrigin: 'center' }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   DIFFICULTY SELECTOR — 3-segment raised control
───────────────────────────────────────────────────────────────── */
function DifficultySelector({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Interview difficulty"
      style={{
        display: 'flex',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Sliding active pill */}
      {DIFFICULTIES.map((d, i) => {
        const isActive = value === d.v;
        const idx = DIFFICULTIES.findIndex((x) => x.v === value);
        return (
          <motion.button
            key={d.v}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(d.v)}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1, padding: '14px 12px', cursor: 'pointer', border: 'none',
              background: 'transparent',
              borderRight: i < DIFFICULTIES.length - 1 ? '1px solid var(--border)' : 'none',
              position: 'relative', overflow: 'hidden',
              transition: 'background 0.25s',
            }}
          >
            {/* Active bg fill */}
            <motion.div
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'absolute', inset: 0,
                background: `${d.color}18`,
                borderRight: isActive && i < DIFFICULTIES.length - 1 ? `1px solid ${d.color}40` : 'none',
                borderLeft:  isActive && i > 0 ? `1px solid ${d.color}40` : 'none',
              }}
            />

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {/* Colored indicator bar */}
              <motion.div
                animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                style={{
                  position: 'absolute', bottom: -14, left: 0, right: 0, height: 2,
                  background: d.color, boxShadow: `0 0 8px ${d.glow}`,
                  transformOrigin: 'center',
                }}
                transition={{ duration: 0.25 }}
              />
              <span className="f-cormorant" style={{ fontSize: 17, fontWeight: 600, color: isActive ? d.color : 'var(--ivory-ghost)', transition: 'color 0.25s' }}>
                {d.v}
              </span>
              <span className="f-mono" style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: isActive ? `${d.color}bb` : 'var(--ivory-ghost)', transition: 'color 0.25s' }}>
                {d.label}
              </span>

              {/* Shimmer on active */}
              {isActive && (
                <div style={{ position: 'absolute', inset: '-20px', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', inset: 0, width: '40%',
                    background: `linear-gradient(105deg, transparent, ${d.color}15, transparent)`,
                    animation: 'shimmer-sweep 2.5s ease-in-out infinite',
                  }} />
                </div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   QUESTION SLIDER
───────────────────────────────────────────────────────────────── */
function QuestionSlider({ value, onChange }) {
  const min = 3, max = 10;
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      {/* Value display */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="f-cormorant" style={{ fontSize: 48, fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>
            {value}
          </span>
          <span className="f-mono" style={{ fontSize: 10, color: 'var(--ivory-ghost)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            questions
          </span>
        </div>
        <span className="f-mono" style={{ fontSize: 9, color: 'var(--ivory-ghost)' }}>
          ~{value * 3}–{value * 5} min
        </span>
      </div>

      {/* Track + Tick marks */}
      <div style={{ position: 'relative', paddingBottom: 24 }}>
        <input
          type="range" min={min} max={max} value={value}
          onChange={(e) => onChange(+e.target.value)}
          className="gold-slider"
          style={{ '--pct': `${pct}%` } }
          aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}
          aria-label="Number of interview questions"
        />
        {/* Tick marks */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
            <button
              key={n} type="button"
              onClick={() => onChange(n)}
              style={{ background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
            >
              <div style={{ width: 1, height: n === value ? 10 : 5, background: n <= value ? 'var(--gold)' : 'var(--border)', transition: 'height 0.2s, background 0.2s' }} />
              <span className="f-mono" style={{ fontSize: 8, color: n === value ? 'var(--gold)' : 'var(--ivory-ghost)', transition: 'color 0.2s' }}>
                {n}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ANSWER MODE SELECTOR
───────────────────────────────────────────────────────────────── */
function AnswerModeSelector({ value, onChange }) {
  const modes = [
    { v: 'text',  label: 'Text Input',   desc: 'Type your responses at your own pace', symbol: '⌨' },
    { v: 'voice', label: 'Voice Input',  desc: 'Speak naturally, AI transcribes live',  symbol: '⏺' },
  ];

  return (
    <div role="radiogroup" aria-label="Answer input mode" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {modes.map((mode) => {
        const active = value === mode.v;
        const { ref, style: tiltStyle, tilt, onMouseMove, onMouseLeave } = use3DTilt({ maxAngle: 4, scale: 1.025 });
        return (
          <motion.button
            key={mode.v}
            ref={ref}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(mode.v)}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            whileTap={{ scale: 0.97 }}
            style={{
              ...tiltStyle,
              padding: '22px 20px',
              background: active ? 'var(--gold-10)' : 'var(--surface)',
              border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
              borderRadius: 12,
              cursor: 'pointer',
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: active ? `0 8px 32px var(--shadow-gold)` : '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'border-color 0.25s, background 0.25s, box-shadow 0.25s',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 12, color: active ? 'var(--gold)' : 'var(--ivory-dim)', transition: 'color 0.25s' }}>
              {mode.symbol}
            </div>
            <p className="f-outfit" style={{ fontSize: 14, fontWeight: 600, color: active ? 'var(--ivory)' : 'var(--ivory-dim)', margin: '0 0 6px', transition: 'color 0.25s' }}>
              {mode.label}
            </p>
            <p className="f-outfit" style={{ fontSize: 11, color: 'var(--ivory-ghost)', margin: 0, lineHeight: 1.5 }}>
              {mode.desc}
            </p>

            {/* Shimmer */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              <div style={{
                position: 'absolute', inset: 0, width: '40%',
                background: 'linear-gradient(105deg, transparent, rgba(201,168,76,0.07), transparent)',
                animation: (active || tilt.hovered) ? 'shimmer-sweep 2s ease-in-out infinite' : 'none',
              }} />
            </div>

            {/* Right-edge bar */}
            <motion.div
              animate={{ scaleY: active ? 1 : 0 }}
              style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg, transparent, var(--gold), transparent)', transformOrigin: 'center' }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   LAUNCH BUTTON — 3D Press + Shimmer + Spinner
───────────────────────────────────────────────────────────────── */
function LaunchButton({ loading, onClick }) {
  const [pressed, setPressed] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      animate={{
        y: pressed && !loading ? 3 : 0,
        boxShadow: pressed
          ? '0 2px 8px rgba(0,0,0,0.4)'
          : loading
          ? '0 4px 16px rgba(0,0,0,0.3)'
          : '0 6px 24px var(--shadow-gold), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}
      transition={{ duration: 0.08 }}
      style={{
        width: '100%',
        padding: '18px 32px',
        background: loading ? 'var(--gold-dim)' : 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 50%, var(--gold) 100%)',
        backgroundSize: '200% 100%',
        border: 'none',
        borderRadius: 10,
        cursor: loading ? 'not-allowed' : 'pointer',
        color: 'var(--ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
        animation: loading ? 'none' : 'border-trace 2s linear infinite',
      }}
      whileHover={!loading ? { backgroundPosition: '100% 0' } : {}}
      aria-busy={loading}
      aria-label={loading ? 'Generating your interview session' : 'Launch interview session'}
    >
      {/* Shimmer sweep (resting state) */}
      {!loading && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)',
          animation: 'shimmer-sweep 2.4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {loading ? (
        <>
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            border: '2.5px solid rgba(13,15,20,0.25)',
            borderTopColor: 'var(--ink)',
            animation: 'spin-cw 0.7s linear infinite',
            flexShrink: 0,
          }} />
          <span className="f-outfit" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.05em' }}>
            Generating questions…
          </span>
        </>
      ) : (
        <>
          <span className="f-cormorant" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Launch Session
          </span>
          <span style={{ fontSize: 16, opacity: 0.75 }}>→</span>
        </>
      )}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SESSION SUMMARY SIDEBAR — floats above card
───────────────────────────────────────────────────────────────── */
function SessionSummary({ config }) {
  const diff = DIFFICULTIES.find((d) => d.v === config.difficulty);
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '20px 16px',
        animation: 'float-subtle 6s ease-in-out infinite',
      }}
    >
      <p className="f-mono" style={{ fontSize: 9, color: 'var(--gold-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
        Session Brief
      </p>
      {[
        { label: 'Role',       value: config.role, },
        { label: 'Type',       value: config.type, },
        { label: 'Difficulty', value: config.difficulty, color: diff?.color },
        { label: 'Questions',  value: `${config.questionCount} items` },
        { label: 'Input',      value: config.answerMode === 'text' ? '⌨ Text' : '⏺ Voice' },
      ].map((row) => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, gap: 8 }}>
          <span className="f-mono" style={{ fontSize: 9, color: 'var(--ivory-ghost)', letterSpacing: '0.08em', flexShrink: 0 }}>{row.label}</span>
          <div style={{ flex: 1, borderBottom: '1px dashed var(--border)', margin: '0 6px', marginBottom: 2 }} />
          <span className="f-outfit" style={{ fontSize: 11, fontWeight: 500, color: row.color || 'var(--ivory)', textAlign: 'right', maxWidth: 120, lineHeight: 1.3 }}>
            {row.value}
          </span>
        </div>
      ))}
      {/* Estimated time */}
      <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--gold-10)', border: '1px solid var(--gold-30)', borderRadius: 8 }}>
        <p className="f-mono" style={{ fontSize: 9, color: 'var(--gold-dim)', letterSpacing: '0.1em', marginBottom: 4 }}>EST. DURATION</p>
        <p className="f-cormorant" style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold)', margin: 0 }}>
          {config.questionCount * 3}–{config.questionCount * 5} <span style={{ fontSize: 13, fontWeight: 400 }}>min</span>
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
export default function InterviewSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [config, setConfig] = useState({
    role:          'Software Engineer',
    type:          'Mixed',
    difficulty:    'Medium',
    questionCount: 5,
    answerMode:    'text',
  });

  const start = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/interview/start', config);
      sessionStorage.setItem(`questions_${data.sessionId}`, JSON.stringify(data.questions));
      sessionStorage.setItem(`config_${data.sessionId}`, JSON.stringify(config));
      navigate(`/interview/${data.sessionId}`);
    } catch {
      toast.error('Failed to start interview');
      setLoading(false);
    }
  };

  /* Advance step tracking based on config changes */
  useEffect(() => {
    if (config.role !== 'Software Engineer' && activeStep < 1) setActiveStep(1);
  }, [config.role]);
  useEffect(() => {
    if (activeStep < 2) setActiveStep(2);
  }, [config.type]);
  useEffect(() => {
    if (activeStep < 3) setActiveStep(3);
  }, [config.difficulty]);
  useEffect(() => {
    if (activeStep < 4) setActiveStep(4);
  }, [config.questionCount]);

  /* Staggered section animation */
  const sectionVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  return (
    <>
      <style>{STYLES}</style>

      <div className="is-setup" style={{ minHeight: '100vh', background: 'var(--ink)', position: 'relative' }}>
        <ParallaxBackground />

        <main id="main-content" style={{ position: 'relative', zIndex: 1, padding: '40px 20px 80px', maxWidth: 980, margin: '0 auto' }}>

          {/* ── Page Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: 48, maxWidth: 600 }}
          >
            <p className="f-mono" style={{ fontSize: 10, color: 'var(--gold-dim)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
              Neural-Hire · Session Configuration
            </p>
            <h1 className="f-cormorant" style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 300, color: 'var(--ivory)', letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0 }}>
              Configure Your
              <span style={{ display: 'block', fontWeight: 700, fontStyle: 'italic', color: 'var(--gold)', textShadow: '0 0 40px rgba(201,168,76,0.3)' }}>
                Interview Session
              </span>
            </h1>
            <p className="f-outfit" style={{ fontSize: 14, color: 'var(--ivory-dim)', marginTop: 14, lineHeight: 1.6, maxWidth: 460 }}>
              Every parameter shapes your practice. Choose deliberately — your AI interviewer adapts to each selection in real time.
            </p>
          </motion.div>

          {/* ── Step Indicator ── */}
          <StepIndicator current={activeStep} total={STEPS.length} labels={STEPS} />

          {/* ── Two-column layout ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 260px', gap: 24, alignItems: 'start' }}>

            {/* ── LEFT: Configuration form ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

              {/* ─ SECTION 1: Role ─ */}
              <motion.section
                custom={0} variants={sectionVariants} initial="hidden" animate="visible"
                aria-labelledby="section-role"
              >
                <SectionDivider label="Job Role" step={1} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}
                  role="radiogroup" aria-labelledby="section-role"
                >
                  {ROLES.map((role, i) => (
                    <motion.div key={role.id} custom={i} variants={sectionVariants} initial="hidden" animate="visible">
                      <RoleCard
                        role={role}
                        selected={config.role === role.label}
                        onSelect={(v) => setConfig({ ...config, role: v })}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Gold rule */}
              <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />

              {/* ─ SECTION 2: Interview Type ─ */}
              <motion.section
                custom={1} variants={sectionVariants} initial="hidden" animate="visible"
                aria-labelledby="section-type"
              >
                <SectionDivider label="Interview Type" step={2} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}
                  role="radiogroup" aria-label="Interview type"
                >
                  {INTERVIEW_TYPES.map((t) => (
                    <TypeCard key={t.v} item={t} selected={config.type === t.v} onSelect={(v) => setConfig({ ...config, type: v })} />
                  ))}
                </div>
              </motion.section>

              <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />

              {/* ─ SECTION 3: Difficulty ─ */}
              <motion.section custom={2} variants={sectionVariants} initial="hidden" animate="visible">
                <SectionDivider label="Difficulty" step={3} />
                <DifficultySelector value={config.difficulty} onChange={(v) => setConfig({ ...config, difficulty: v })} />
              </motion.section>

              <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />

              {/* ─ SECTION 4: Question Count ─ */}
              <motion.section custom={3} variants={sectionVariants} initial="hidden" animate="visible">
                <SectionDivider label="Number of Questions" step={4} />
                <QuestionSlider value={config.questionCount} onChange={(v) => setConfig({ ...config, questionCount: v })} />
              </motion.section>

              <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />

              {/* ─ SECTION 5: Answer Mode ─ */}
              <motion.section custom={4} variants={sectionVariants} initial="hidden" animate="visible">
                <SectionDivider label="Answer Mode" step={5} />
                <AnswerModeSelector value={config.answerMode} onChange={(v) => setConfig({ ...config, answerMode: v })} />
              </motion.section>

              {/* ─ LAUNCH ─ */}
              <motion.div
                custom={5} variants={sectionVariants} initial="hidden" animate="visible"
                style={{ marginTop: 8 }}
              >
                {/* Readiness indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', background: 'var(--gold-10)', border: '1px solid var(--gold-30)', borderRadius: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 8px var(--shadow-gold)', animation: 'gold-pulse 2s ease-in-out infinite', flexShrink: 0 }} />
                  <p className="f-mono" style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.1em', margin: 0 }}>
                    SESSION CONFIGURED · READY TO LAUNCH
                  </p>
                </div>
                <LaunchButton loading={loading} onClick={start} />
              </motion.div>
            </div>

            {/* ── RIGHT: Session summary ── */}
            <div style={{ position: 'sticky', top: 24 }}>
              <SessionSummary config={config} />

              {/* Tip card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{ marginTop: 16, padding: '16px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}
              >
                <p className="f-mono" style={{ fontSize: 9, color: 'var(--gold-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Pro Tip
                </p>
                <p className="f-outfit" style={{ fontSize: 12, color: 'var(--ivory-dim)', lineHeight: 1.6, margin: 0 }}>
                  Start with <strong style={{ color: 'var(--ivory)' }}>Mixed</strong> type and <strong style={{ color: 'var(--ivory)' }}>Medium</strong> difficulty to get a balanced baseline score before specializing.
                </p>
              </motion.div>

              {/* Keyboard shortcut hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{ marginTop: 12, textAlign: 'center' }}
              >
                <p className="f-mono" style={{ fontSize: 9, color: 'var(--ivory-ghost)', letterSpacing: '0.08em' }}>
                  Press <kbd style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', fontSize: 9, color: 'var(--ivory-dim)' }}>Enter</kbd> to launch
                </p>
              </motion.div>
            </div>
          </div>

          {/* ── Responsive: hide sidebar on mobile, show summary inline ── */}
          <style>{`
            @media (max-width: 700px) {
              .is-setup [style*="sticky"] { display: none !important; }
              .is-setup [style*="grid-template-columns: minmax(0,1fr) 260px"] {
                grid-template-columns: 1fr !important;
              }
              .is-setup [style*="minmax(130px, 1fr)"] {
                grid-template-columns: repeat(2, 1fr) !important;
              }
              .is-setup [style*="repeat(2, 1fr)"] {
                grid-template-columns: 1fr 1fr !important;
              }
            }
            @media (min-width: 701px) and (max-width: 900px) {
              .is-setup [style*="minmax(130px, 1fr)"] {
                grid-template-columns: repeat(3, 1fr) !important;
              }
            }
          `}</style>

        </main>
      </div>
    </>
  );
}
