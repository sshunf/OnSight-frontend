import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import '../css/StatsShowcase.css';

Chart.register(...registerables);

const costCards = [
  {
    title: '$1 → $5 Savings',
    body: 'Every $1 spent on preventive maintenance saves $5 in repair costs.',
    source: 'Source: UpKeep / Itefy',
  },
  {
    title: '10× More Expensive',
    body: 'Running to failure costs up to 10x more than proactive maintenance.',
    source: 'Source: UpKeep / Itefy',
  },
  {
    title: 'Up to 40% Cheaper',
    body: 'Predictive maintenance saves up to 40% vs. reactive maintenance.',
    source: 'Source: UpKeep / DOE',
  },
];

const longevityStats = [
  '78% of companies using CMMS report improved equipment lifespan. (UpKeep)',
  'Preventive maintenance adds 2–3 years of life to high-use assets. (TrueFitness / Itefy)',
  'Proper O&M reduces energy costs by 5–20%. (DOE / Precor)',
];

const retentionStats = [
  '+5% retention = +25–95% profit (HBR)',
  'Gyms using analytics see 35% more renewals (PromotionVault / FITC)',
  'Well-maintained equipment ranks #2 factor for members (PMC, 2024)',
  '+3 months member stay = +$132K/year revenue (Leisure-net × Precor / HCMmag)',
];

const downtimeStats = [
  'Average repair time: 2.8 days (Market Growth Reports)',
  '22% of calls are emergencies (Market Growth Reports)',
  'Unplanned downtime cuts 5–20% of productive capacity (UpKeep)',
  '24,000 treadmill injuries over 10 years (Itefy / Allianz)',
];

const marketStats = [
  'Market growth: $901M → $1.69B (2024–2033), +7.2% CAGR (Market Growth Reports)',
  'Preventive contracts: 24% → 31% (2021–2023) (Market Growth Reports)',
  '3.2M repair jobs annually, 1.6 per unit (Market Growth Reports)',
];

const funnelSteps = [
  { label: 'Uptime', icon: '⚡' },
  { label: 'Satisfaction', icon: '🙂' },
  { label: 'Retention', icon: '♻️' },
  { label: 'Revenue', icon: '💰' },
];

function StatsShowcase() {
  const savingsChartRef = useRef(null);
  const marketChartRef = useRef(null);

  useEffect(() => {
    const charts = [];

    if (savingsChartRef.current) {
      const ctx = savingsChartRef.current.getContext('2d');
      charts.push(new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Reactive', 'Predictive', 'Preventative'],
          datasets: [
            {
              label: 'Relative cost',
              data: [100, 50, 60],
              backgroundColor: ['#4338ca', '#a855f7', '#22c55e'],
              borderRadius: 10,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Cost to maintain vs. fail', color: '#e5e7eb' },
          },
          scales: {
            x: {
              ticks: { color: '#cbd5e1' },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              ticks: { color: '#cbd5e1' },
              grid: { color: 'rgba(255,255,255,0.08)' },
            },
          },
        },
      }));
    }

    if (marketChartRef.current) {
      const ctx = marketChartRef.current.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 320);
      gradient.addColorStop(0, 'rgba(168, 139, 250, 0.4)');
      gradient.addColorStop(1, 'rgba(168, 139, 250, 0)');

      charts.push(new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['2024', '2026', '2028', '2030', '2033'],
          datasets: [
            {
              label: 'Market size ($B)',
              data: [0.9, 1.05, 1.18, 1.42, 1.69],
              borderColor: '#a855f7',
              backgroundColor: gradient,
              fill: true,
              tension: 0.35,
              pointRadius: 4,
              pointBackgroundColor: '#fff',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#e5e7eb' } },
            title: { display: true, text: 'Smart maintenance market projection', color: '#e5e7eb' },
          },
          scales: {
            x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' } },
            y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(255,255,255,0.08)' } },
          },
        },
      }));
    }

    return () => charts.forEach((c) => c?.destroy());
  }, []);

  return (
    <div className="stats-shell">
      <div className="glow glow-one" />
      <div className="glow glow-two" />

      <section className="stats-hero">
        <div className="hero-copy">
          <p className="eyebrow">ROI stats</p>
          <h1>Turn Equipment Data into Real ROI.</h1>
          <p className="lede">
            Smart maintenance, smarter purchases, and satisfied members—all backed by data.
          </p>
          <div className="hero-actions">
            <a className="primary" href="/roi-calculator">Calculate My ROI</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="ring">
            <div className="ring-inner">
              <img
                src="/Copy of Copy of Logo Draft 7.5.png"
                alt="OnSight logo"
                className="ring-logo"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="retention-section">
        <div className="section-head">
          <p className="eyebrow">Member retention ROI</p>
          <h2>Better Equipment = Happier Members = Higher Revenue</h2>
          <p className="lede">
            Even a 1% increase in retention offsets thousands in repair and acquisition costs.
          </p>
        </div>
        <div className="funnel-icons">
          {funnelSteps.map((step, idx) => (
            <React.Fragment key={step.label}>
              <div className="funnel-node">
                <div className="icon-circle">{step.icon}</div>
                <p className="icon-label">{step.label}</p>
              </div>
              {idx < funnelSteps.length - 1 && <div className="funnel-connector"><span /></div>}
            </React.Fragment>
          ))}
        </div>
        <div className="stat-grid">
          {retentionStats.map((item) => (
            <article key={item} className="card">
              <p className="card-body">{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cost-section">
        <div className="section-head">
          <p className="eyebrow">Cost savings</p>
          <h2>Preventive Maintenance Pays for Itself</h2>
        </div>
        <div className="cost-grid">
          {costCards.map((card) => (
            <article key={card.title} className="card">
              <p className="card-title">{card.title}</p>
              <p className="card-body">{card.body}</p>
              <p className="card-source">{card.source}</p>
            </article>
          ))}
          <article className="card chart-card">
            <div className="chart-header">
              <p className="card-title">Savings growth</p>
              <span className="chip ghost">Demo</span>
            </div>
            <div className="chart-body">
              <canvas ref={savingsChartRef} />
            </div>
            <div className="coin-stack">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </article>
        </div>
      </section>

      <section className="longevity-section">
        <div className="section-head">
          <p className="eyebrow">Equipment longevity</p>
          <h2>Extend the Life of Every Machine</h2>
        </div>
        <div className="timeline">
          <div className="timeline-track">
            <div className="timeline-marker left">
              <div className="marker-bubble">
                <p>Run to failure</p>
                <strong>Replacement @ 5 yrs</strong>
              </div>
            </div>
            <div className="timeline-marker right">
              <div className="marker-bubble">
                <p>Planned program</p>
                <strong>Replacement @ 8 yrs</strong>
              </div>
            </div>
          </div>
          <div className="stat-list">
            {longevityStats.map((item) => (
              <div key={item} className="stat-chip">
                <span className="dot purple" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="downtime-section">
        <div className="section-head">
          <p className="eyebrow">Downtime & Safety</p>
          <h2>Every Hour of Downtime Costs</h2>
        </div>
        <div className="timeline vertical">
          {downtimeStats.map((item, idx) => (
            <div key={item} className="timeline-row">
              <div className="timeline-dot" />
              <div className="timeline-card">
                <p className="card-body">{item}</p>
                {idx === 0 && <p className="card-source">Animated downtime gauge shows how IoT lowers unplanned events.</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="market-section">
        <div className="section-head">
          <p className="eyebrow">Market Validation</p>
          <h2>The Market Is Moving to Smart Maintenance</h2>
          <p className="lede">Don't let your gym fall behind.</p>
        </div>
        <div className="market-grid">
          <article className="card chart-card">
            <div className="chart-header">
              <p className="card-title">Growth curve</p>
              <span className="chip">+7.2% CAGR</span>
            </div>
            <div className="chart-body tall">
              <canvas ref={marketChartRef} />
            </div>
          </article>
          <div className="stat-list vertical">
            {marketStats.map((item) => (
              <div key={item} className="stat-chip">
                <span className="dot purple" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-footer">
        <div>
          <p className="eyebrow">Ready to act</p>
          <h3>Your data is already in the gym—it’s time to use it.</h3>
          <p className="lede">
            Start saving on maintenance, extending equipment life, and keeping members coming back.
          </p>
        </div>
        <a className="primary" href="/roi-calculator">Calculate My ROI</a>
      </section>
    </div>
  );
}

export default StatsShowcase;
