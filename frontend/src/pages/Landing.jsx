import { motion } from "framer-motion";
import { Shield, Video, Activity } from "lucide-react";

export default function Landing({ onLogin, onDemo }) {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">

      {/* Background */}
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[520px] bg-sky-500/20 blur-[220px] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute bottom-0 right-0 w-[720px] h-[420px] bg-emerald-500/20 blur-[200px] pointer-events-none"
      />
      <div className="absolute inset-0 bg-[#020617]" />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-10 py-6">
        <h1 className="text-2xl font-semibold text-sky-400">
          ⟁ AEGIS
        </h1>

        <button
          onClick={onLogin}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-white/5 border border-white/20 hover:bg-white/10 transition-all"
        >
          Sign In
        </button>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex items-center">
        <div className="max-w-4xl px-10">
          <h2 className="text-6xl font-semibold leading-tight text-white">
            AI Surveillance
            <br />
            <span className="text-sky-400">That Thinks in Real Time</span>
          </h2>

          <p className="text-slate-400 mt-6 text-xl max-w-2xl">
            Enterprise-grade AI surveillance platform for real-time
            threat detection, intelligent monitoring, and instant alerts.
          </p>

          {/* Buttons */}
          <div className="flex gap-6 mt-12">
            <button
              onClick={onLogin}
              className="px-10 py-4 rounded-2xl text-lg font-semibold text-white bg-white/5 border border-sky-400/50 shadow-lg shadow-sky-400/25 hover:bg-sky-400/10 hover:scale-[1.04] transition-all"
            >
              Get Started
            </button>

            <button
              onClick={onDemo}
              className="px-10 py-4 rounded-2xl text-lg font-medium text-slate-200 bg-white/5 border border-white/20 hover:bg-white/10 hover:scale-[1.03] transition-all"
            >
              View Live Demo
            </button>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="relative z-10 px-10 pb-16 grid grid-cols-3 gap-10 max-w-6xl mx-auto">
        <Feature
          icon={Shield}
          title="Threat Detection"
          desc="AI-driven identification of suspicious activity and breaches."
        />
        <Feature
          icon={Video}
          title="Live Intelligence"
          desc="Real-time analysis and tracking across camera feeds."
        />
        <Feature
          icon={Activity}
          title="Instant Alerts"
          desc="Immediate notifications for critical security events."
        />
      </section>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="glass px-8 py-7">
      <Icon className="text-sky-400 mb-4" size={28} />
      <h3 className="text-xl font-medium text-white">{title}</h3>
      <p className="text-sm text-slate-400 mt-2">{desc}</p>
    </div>
  );
}
