import React from 'react';
import { Link } from 'react-router-dom';
import '../css/LandingPage.css';

function HeroSection() {
  return (
    <div className="landing-page relative z-10">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-24 lg:pt-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-dark/80 to-background-dark" />
          <div
            className="w-full h-full bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] text-[#d7acffff]">
              The Future of Gym <br /> Management
            </h1>
            <p className="text-lg md:text-xl text-slate-200/80 max-w-xl leading-relaxed">
              Stop guessing. Start knowing. OnSight uses non-invasive sensors to track your facility and optimize your floor space.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/waitlist"
                className="glass px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/5 transition-all"
              >
                Book a Demo
              </Link>
              <Link
                to="/roi"
                className="glass px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/5 transition-all"
              >
                View ROI Report
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex justify-center">
            <img
              src="/Copy of Logo Draft 7.5 (1).svg"
              alt="OnSight logo"
              className="w-full max-w-lg h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 bg-background-dark relative" id="problem">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <p className="text-primary font-bold tracking-widest uppercase text-sm"> </p>
            <h3 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Gym management shouldn&apos;t be a guessing game.
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Maintenance Blindspots',
                copy: "Reactive repairs lead to costly downtime and member frustration. You don't know a machine is broken until it's too late.",
                icon: 'build_circle',
                color: 'text-red-500',
                bg: 'bg-red-500/10',
              },
              {
                title: 'Dead Capital',
                copy: 'Underutilized equipment takes up valuable real estate without ROI. Identify what is collecting dust and reclaim your floor space.',
                icon: 'money_off',
                color: 'text-amber-500',
                bg: 'bg-amber-500/10',
              },
              {
                title: 'Customer Friction',
                copy: 'Broken machines and crowded floors drive member churn. Keep your facility running smoothly to keep members happy.',
                icon: 'group_remove',
                color: 'text-primary',
                bg: 'bg-primary/10',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="group p-8 rounded-3xl glass bg-primary/10 border border-white/5 hover:border-primary/40 transition-all duration-500"
              >
                <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <span className={`material-symbols-outlined ${card.color} text-3xl`}>{card.icon}</span>
                </div>
                <h4 className="text-xl font-bold mb-3 text-white">{card.title}</h4>
                <p className="text-slate-400 leading-relaxed">{card.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative overflow-hidden" id="how-it-works">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="rounded-3xl overflow-hidden border border-white/10">
              <img
                className="w-full h-[480px] object-cover grayscale hover:grayscale-0 transition-all duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-fF7vGr9VTAdSgQfYYnsMZWwRLUcZYaJHrmtvYCmwAAu5s0Vaaz85yGgqDd6xBxL8-htMFh6OoUIMRJYGRQTr99hMK4Z4nWx0SB05UZzSV0AAGtgKfH3mv5Q75oM7QNifI3na_vNBzaUBCghszZWo6e59Wer1wY7X3w-Nt9jpxIqBK2CZFCEE9JI-tX1hqNIZHC8clCpWXiI2_8bkYGrMr6ERbtA1_9Qix-RWSjWlHThIg_-jPcxNWkBotZ7SWPIo-fzML_zBzgZZ"
                alt="Gym equipment with an OnSight sensor"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 glass p-6 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="bg-primary rounded-full p-2 animate-pulse">
                    <span className="material-symbols-outlined text-white text-sm">sensors</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary uppercase">Sensor Active</p>
                    <p className="text-sm text-white">Treadmill #04 - Real-time tracking engaged</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-10">
            <div className="space-y-4">
              <p className="text-primary font-bold tracking-widest uppercase text-sm">The Solution</p>
              <h3 className="text-4xl md:text-5xl font-extrabold text-white">Non-Invasive Technology</h3>
              <p className="text-slate-400 text-lg">
                Our wall-mounted sensors track your entire floor. No battery charging, no hassle, just instant data.
              </p>
            </div>
            <div className="space-y-6">
              {[
                {
                  title: 'Install & Activate',
                  copy: 'Wall mounted sensors track treadmills, cable machines, and even free weights.',
                },
                {
                  title: 'Instant Sync',
                  copy: 'Data is transmitted via encrypted gateway to our cloud-based back-end immediately.',
                },
                {
                  title: 'Optimize Floor',
                  copy: 'Access real-time usage heatmaps and predictive maintenance schedules from any device.',
                },
              ].map((step, idx) => (
                <div key={step.title} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                    <p className="text-slate-400">{step.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo + Features */}
      <section className="py-24 bg-card-dark/30" id="features">
        <div className="max-w-7xl mx-auto px-6 mb-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <div className="space-y-4 mb-8">
              <p className="text-primary font-bold tracking-widest uppercase text-sm">Live Demo</p>
              <h3 className="text-4xl font-extrabold text-white">See OnSight in Action</h3>
            </div>
            <div className="glass rounded-3xl p-4 border border-white/10 shadow-xl">
              <video
                className="w-full h-full rounded-2xl border border-white/5 object-cover"
                src="/newdemovid.mp4"
                controls
                muted
                playsInline
              />
            </div>
          </div>

          <div className="glass rounded-[2rem] p-8 border border-white/10 space-y-6 lg:self-center">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-4xl">query_stats</span>
              <div>
                <p className="text-sm uppercase tracking-widest text-slate-400 font-bold">Core Metrics</p>
                <h4 className="text-2xl font-bold text-white">Machine Usage Tracking</h4>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Heatmaps and live utilization show which stations carry the load. Rotate assets before they break, or swap floor plans to balance wear.
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-3xl font-black text-primary">84%</p>
                <p className="text-xs uppercase tracking-widest text-slate-400">Peak Utilization</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-3xl font-black text-white">7-9p</p>
                <p className="text-xs uppercase tracking-widest text-slate-400">Rush Window</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-3xl font-black text-white">250 hrs</p>
                <p className="text-xs uppercase tracking-widest text-slate-400">Ready for Service</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <div className="space-y-4">
              <p className="text-primary font-bold tracking-widest uppercase text-sm">Capabilities</p>
              <h3 className="text-4xl font-extrabold text-white">Built for High Performance</h3>
            </div>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: 'query_stats',
                title: 'Machine Usage Tracking',
                copy: 'See exactly which machines are favorites and which are ignored. Use heatmaps to optimize floor layout and equipment rotation.',
                badge: 'Peak Usage',
                badgeValue: '7:00 PM - 9:00 PM',
              },
              {
                icon: 'precision_manufacturing',
                title: 'Preventative Maintenance',
                copy: 'Avoid unexpected breakdowns. Our algorithm schedules maintenance based on actual usage hours rather than arbitrary calendar dates.',
                status: [
                  { label: 'Leg Press #02: Service Required', color: 'bg-amber-500' },
                  { label: 'Cardio Deck: All Optimal', color: 'bg-green-500' },
                  { label: 'Cable Chest Fly: Possible Breakdown Reported', color: 'bg-red-500' }
                ],
              },
              {
                icon: 'psychology',
                title: 'Operations Insight',
                copy: 'Get actionable intelligence on member behavior. Optimize staffing levels and class schedules based on real-world traffic data.',
              },
            ].map((feature, idx) => (
              <div key={feature.title} className="glass p-10 rounded-[2rem] border border-white/10 h-full">
                <span className="material-symbols-outlined text-primary text-5xl mb-6 block">{feature.icon}</span>
                <h4 className="text-2xl font-bold mb-4 text-white">{feature.title}</h4>
                <p className="text-slate-400 mb-8 leading-relaxed">{feature.copy}</p>

                {idx === 0 && (
                  <div className="bg-[#0c0a12] rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-white">Hourly Machine Usage</p>
                        <p className="text-xs text-slate-400">Precor Treadmill 1</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white">
                        <span className="w-4 h-2 border-2 border-primary inline-block rounded-sm" aria-hidden="true" />
                        Usage (min)
                      </div>
                    </div>
                    <div className="bg-[#0e0c16] rounded-xl border border-white/5 overflow-hidden">
                      <svg viewBox="0 0 600 260" className="w-full h-auto">
                        <defs>
                          <linearGradient id="usageArea" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.08" />
                          </linearGradient>
                        </defs>
                        {/* Y grid lines */}
                        {[50, 40, 30, 20, 10].map((y) => (
                          <line key={y} x1="50" x2="570" y1={210 - y * 3} y2={210 - y * 3} stroke="#1f1b2b" strokeWidth="1" />
                        ))}
                        {/* Area + line */}
                        <path
                          d="M50 210 L100 210 L150 210 L200 210 L250 210 L300 210 L350 210 L400 190 L450 60 L500 110 L550 140 L600 100 L600 260 L50 260 Z"
                          fill="url(#usageArea)"
                        />
                        <path
                          d="M50 210 L100 210 L150 210 L200 210 L250 210 L300 210 L350 210 L400 190 L450 60 L500 110 L550 140 L600 100"
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                        {/* Points */}
                        {[
                          { x: 50, y: 210 },
                          { x: 100, y: 210 },
                          { x: 150, y: 210 },
                          { x: 200, y: 210 },
                          { x: 250, y: 210 },
                          { x: 300, y: 210 },
                          { x: 350, y: 210 },
                          { x: 400, y: 190 },
                          { x: 450, y: 60 },
                          { x: 500, y: 110 },
                          { x: 550, y: 140 },
                          { x: 600, y: 100 },
                        ].map((pt, i) => (
                          <g key={i}>
                            <circle cx={pt.x} cy={pt.y} r="6" fill="#0e0c16" stroke="#a855f7" strokeWidth="3" />
                            <circle cx={pt.x} cy={pt.y} r="3" fill="#a855f7" />
                          </g>
                        ))}
                        {/* X labels */}
                        {[
                          '11PM',
                          '12AM',
                          '1AM',
                          '2AM',
                          '3AM',
                          '4AM',
                          '5AM',
                          '6AM',
                          '7AM',
                          '8AM',
                          '9AM',
                          '10AM',
                        ].map((label, i) => (
                          <text
                            key={label}
                            x={50 + i * 50}
                            y="240"
                            textAnchor="middle"
                            fontSize="11"
                            fill="#cbd5f5"
                          >
                            {label}
                          </text>
                        ))}
                        {/* Y labels */}
                        {[0, 10, 20, 30, 40, 50].map((label) => (
                          <text
                            key={label}
                            x="30"
                            y={210 - label * 3 + 4}
                            textAnchor="end"
                            fontSize="11"
                            fill="#cbd5f5"
                          >
                            {label}
                          </text>
                        ))}
                      </svg>
                    </div>
                  </div>
                )}

                {idx === 1 && (
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                    {feature.status?.map((s) => (
                      <div key={s.label} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${s.color} ${s.color === 'bg-amber-500' ? 'animate-pulse' : ''}`} />
                        <span className="text-sm text-white font-medium">{s.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {idx === 2 && (
                  <div className="flex gap-2">
                    <div className="flex-1 aspect-square bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">monitoring</span>
                    </div>
                    <div className="flex-1 aspect-square bg-slate-800/50 rounded-xl border border-white/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-500">timeline</span>
                    </div>
                    <div className="flex-1 aspect-square bg-slate-800/50 rounded-xl border border-white/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-500">bar_chart</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI */}
      <section className="py-24 relative overflow-hidden" id="roi">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-right" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h3 className="text-4xl md:text-5xl font-black text-white leading-tight">Data that pays for itself.</h3>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl lg:max-w-xl">
              Partners see an impact within the first week of deployment. Stop wasting capital and start optimizing your most valuable assets.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: '10+', label: 'Real-time Statistics', highlight: true },
              { value: '15%', label: 'Maintenance Savings', highlight: false, offset: true },
              { value: '+2 Years', label: 'Equipment Lifespan', highlight: false },
              { value: '$10k+', label: 'Avg. Annual ROI', highlight: true, offset: true },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass p-8 rounded-3xl text-center space-y-2"
              >
                <div className={`text-5xl font-black ${stat.highlight ? 'text-primary' : 'text-white'}`}>{stat.value}</div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto glass p-12 md:p-20 rounded-[3rem] text-center space-y-10 relative overflow-hidden border border-white/10">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" aria-hidden="true" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" aria-hidden="true" />
          <h2 className="text-4xl md:text-6xl font-black max-w-4xl mx-auto leading-tight" style={{ color: '#d7acff' }}>
            Ready to see your gym in a new light?
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Learn how OnSight can revolutionize you facility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/waitlist"
              className="bg-primary text-white px-10 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] text-center"
            >
              Book Your Live Demo
            </Link>
            <a
              href="mailto:accounts@onsight-tech.com"
              className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all text-center"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HeroSection;
