import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const features = [
  { icon: '🎯', title: 'Role-Specific Questions', desc: 'AI tailors questions to 15+ roles like SWE, PM, Data Scientist.' },
  { icon: '🎙️', title: 'Voice & Text Mode', desc: 'Practice speaking with real-time speech recognition.' },
  { icon: '📊', title: 'Detailed Feedback', desc: 'Score breakdown across clarity, structure, confidence & more.' },
  { icon: '⚡', title: 'Instant Reports', desc: 'Get strengths, improvements & ideal answers in seconds.' },
  { icon: '📈', title: 'Track Progress', desc: 'Visualize your growth with charts & skill radar.' },
  { icon: '🤖', title: 'GPT-4o Powered', desc: 'Advanced AI for human-like evaluation & follow-ups.' },
];

const steps = [
  { n: 1, title: 'Pick Your Role', desc: 'Select target role, type & difficulty.' },
  { n: 2, title: 'Answer Questions', desc: 'Speak or type your responses.' },
  { n: 3, title: 'Get Feedback', desc: 'Receive structured AI feedback instantly.' },
  { n: 4, title: 'Improve & Repeat', desc: 'Track progress & ace your real interview.' },
];

const Counter = ({ to, suffix = '' }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    let s = 0; const step = to / 60;
    const i = setInterval(() => {
      s += step;
      if (s >= to) { setN(to); clearInterval(i); } else setN(Math.floor(s));
    }, 20);
    return () => clearInterval(i);
  }, [to]);
  return <span>{n.toLocaleString()}{suffix}</span>;
};

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center font-bold">AI</div>
          <span className="font-bold text-xl gradient-text">InterviewAI</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-ghost text-sm">Login</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-12 pb-24 max-w-6xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-block px-4 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent-light text-sm mb-6">
            ✨ Powered by GPT-4o
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            Ace Your Next Interview <br /> with <span className="gradient-text">AI Coaching</span>
          </h1>
          <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Realistic interview simulations with instant AI feedback. Practice behavioral, technical & HR rounds — and watch your scores climb.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="btn-primary">Start Practicing Free</Link>
            <Link to="/login" className="btn-ghost">I have an account</Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-12 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { n: 25000, s: '+', l: 'Interviews Run' },
            { n: 15, s: '+', l: 'Job Roles' },
            { n: 92, s: '%', l: 'Success Rate' },
            { n: 4, s: '.9', l: 'User Rating' },
          ].map((x, i) => (
            <motion.div
              key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass p-6 text-center glass-hover"
            >
              <div className="text-3xl md:text-4xl font-extrabold gradient-text">
                <Counter to={x.n} suffix={x.s} />
              </div>
              <div className="text-sm text-gray-400 mt-2">{x.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 pb-24 max-w-6xl mx-auto">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-center mb-4">
          Why <span className="gradient-text">InterviewAI?</span>
        </motion.h2>
        <p className="text-gray-400 text-center mb-12">Everything you need to crush your next interview.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass p-6 glass-hover"
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="px-6 md:px-12 pb-24 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">How It <span className="gradient-text">Works</span></h2>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="glass p-6 text-center relative"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-dark mx-auto flex items-center justify-center font-bold mb-4 animate-pulse-glow">
                {s.n}
              </div>
              <h3 className="font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 pb-24 max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="glass p-12 animate-pulse-glow">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to <span className="gradient-text">level up</span>?</h2>
          <p className="text-gray-400 mb-8">Join thousands acing real interviews. 100% free to start.</p>
          <Link to="/register" className="btn-primary text-lg">Start Now →</Link>
        </motion.div>
      </section>

      <footer className="px-6 py-8 text-center text-gray-500 text-sm border-t border-white/5">
        © {new Date().getFullYear()} InterviewAI. Built with GPT-4o.
      </footer>
    </div>
  );
}