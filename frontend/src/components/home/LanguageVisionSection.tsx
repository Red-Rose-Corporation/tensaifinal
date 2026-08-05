'use client';

export default function LanguageVisionSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-24 px-4 overflow-hidden">
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/98 to-[#0d1117] pointer-events-none" />

      {/* Animated orbs for language/world theme */}
      <div className="absolute top-[10%] left-[5%] w-[700px] h-[700px] bg-blue-600/6 rounded-full blur-[220px] pointer-events-none animate-pulse" style={{ animation: 'pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
      <div className="absolute bottom-0 right-[10%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[200px] pointer-events-none animate-pulse" style={{ animation: 'pulse 14s cubic-bezier(0.4, 0, 0.6, 1) infinite 2s' }} />
      <div className="absolute top-[50%] left-[50%] w-[500px] h-[500px] bg-violet-600/3 rounded-full blur-[160px] pointer-events-none" style={{ transform: 'translate(-50%, -50%)' }} />

      {/* Subtle animated grid */}
      <div
        className="absolute inset-0 opacity-[0.006] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto w-full">

        {/* Opening accent */}
        <div className="text-center mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" aria-hidden="true" />
            THE POWER OF LANGUAGE
          </div>
        </div>

        {/* Main Bengali quote - LARGE & PROMINENT */}
        <div className="text-center mb-12">
          <p className="text-[3.5rem] sm:text-[4.5rem] md:text-6xl font-black leading-[1.05] text-white mb-8 tracking-tight">
            যে ভাষা শেখে,
          </p>
          <p className="text-[3rem] sm:text-[4rem] md:text-5xl font-bold leading-[1.1] text-white/90 mb-6">
            সে বিশ্ব দেখে।
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto mb-10" />
        </div>

        {/* English translation with context */}
        <div className="bg-gradient-to-br from-blue-500/8 to-cyan-500/5 border border-blue-500/15 rounded-3xl p-8 sm:p-10 md:p-12 backdrop-blur-sm mb-14">
          <p className="text-center text-white/75 text-lg sm:text-xl leading-relaxed font-light">
            <span className="text-blue-400 font-semibold">"Whoever learns a language sees the world."</span>
          </p>
          <p className="text-center text-white/50 text-sm sm:text-base mt-6 leading-relaxed max-w-2xl mx-auto">
            Language is the key that unlocks doors to new cultures, perspectives, and opportunities. Every word learned is a window into a different world. Every conversation connects you to millions of new possibilities.
          </p>
        </div>

        {/* Why this matters - Grid of insights */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {[
            {
              emoji: '🌍',
              title: 'Global Perspective',
              desc: 'Language learning opens your mind to diverse cultures and ways of thinking beyond your borders.',
            },
            {
              emoji: '🚪',
              title: 'Doors of Opportunity',
              desc: 'Speaking new languages means access to better education, careers, and connections worldwide.',
            },
            {
              emoji: '💪',
              title: 'Personal Growth',
              desc: 'Every new language mastered builds confidence and expands your cognitive abilities.',
            },
            {
              emoji: '🤝',
              title: 'Bridge Builder',
              desc: 'Language connects you with people, creates understanding, and breaks down barriers.',
            },
            {
              emoji: '✨',
              title: 'New Possibilities',
              desc: 'With language skills, the world becomes your playground—study, work, and live anywhere.',
            },
            {
              emoji: '📚',
              title: 'Lifelong Learning',
              desc: 'Language learning never stops—there\'s always more to discover, more worlds to see.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.04] hover:border-blue-500/20 transition-all duration-300 group"
            >
              <div className="text-3xl mb-3 group-hover:scale-125 transition-transform">{item.emoji}</div>
              <h3 className="font-bold text-white text-sm mb-2">{item.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Call to action - Dual CTA */}
        <div className="text-center">
          <p className="text-white/40 text-sm mb-8 font-light">
            Ready to expand your world? Start your global journey today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
            <button className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm hover:from-blue-500 hover:to-blue-400 transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
              <span>Explore Your Path</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] hover:border-blue-500/30 text-white font-semibold text-sm transition-all duration-300">
              <span>Learn More About Tensai</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="flex items-center justify-center mt-16">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/20" />
          <span className="mx-4 text-white/20 text-xs">✦</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/20" />
        </div>

      </div>
    </section>
  );
}
