export const BLOG_POSTS = [
  {
    slug: 'capital-intensity-of-telematics-scaling',
    title: 'The Capital Intensity of Telematics Scaling',
    category: 'Research',
    tags: ['Research', 'Operations', 'Scaling'],
    author: 'OnSight Team',
    publishedAt: '2026-02-20',
    readTime: '6 min read',
    summary:
      'Hardware-heavy tracking stacks can delay operational insight. Here is how modern facilities can scale visibility with less friction.',
    heroStyle: {
      background:
        'linear-gradient(130deg, rgba(34,197,94,0.3) 0%, rgba(59,130,246,0.26) 55%, rgba(14,116,144,0.34) 100%)',
    },
    content: [
      'Legacy telemetry often scales linearly with installation complexity. Each new machine can add setup overhead before data becomes usable.',
      'A stronger approach separates collection from insight. Deploy instrumentation that is easy to maintain, then optimize event quality.',
      'Teams should track deployment friction as a KPI. If one added machine causes days of manual ops, growth will stall.',
    ],
  },
  {
    slug: 'infrastructure-cost-of-hardware-fleet-systems',
    title: 'The Infrastructure Cost of Hardware-Based Fleet Systems',
    category: 'Post',
    tags: ['Post', 'Hardware', 'Cost'],
    author: 'OnSight Team',
    publishedAt: '2026-02-16',
    readTime: '5 min read',
    summary:
      'A practical breakdown of hidden installation and support costs in hardware-centric tracking systems.',
    heroStyle: {
      background:
        'linear-gradient(125deg, rgba(249,115,22,0.3) 0%, rgba(239,68,68,0.24) 55%, rgba(127,29,29,0.36) 100%)',
    },
    content: [
      'Hardware-first systems can look cheap at purchase time, then become expensive in maintenance and replacement cycles.',
      'Model ownership cost over 24 months, including downtime, support burden, and retraining overhead.',
      'In many facilities, lower operational drag beats maximum device count and produces cleaner analytics.',
    ],
  },
  {
    slug: 'satellite-dependent-telematics-are-going-extinct',
    title: 'Why Satellite-Dependent Telematics Are Going Extinct',
    category: 'Announcement',
    tags: ['Announcement', 'Visibility', 'Future'],
    author: 'OnSight Team',
    publishedAt: '2026-02-12',
    readTime: '4 min read',
    summary:
      'Visibility is moving toward resilient hybrid telemetry models that stay reliable in complex indoor environments.',
    heroStyle: {
      background:
        'linear-gradient(130deg, rgba(59,130,246,0.28) 0%, rgba(56,189,248,0.24) 48%, rgba(13,148,136,0.35) 100%)',
    },
    content: [
      'Satellite-first assumptions break in indoor zones and dense facilities, where operators still need reliable coverage.',
      'Hybrid telemetry stacks combine edge signals and local context, so operations remain visible through gaps.',
      'Reliability should come before precision. That ordering creates stronger long-term alerting and planning.',
    ],
  },
  {
    slug: 'fleet-tracking-without-cellular-dependency',
    title: 'Fleet Tracking Without Cellular Dependency',
    category: 'Research',
    tags: ['Research', 'Reliability', 'Connectivity'],
    author: 'OnSight Team',
    publishedAt: '2026-02-09',
    readTime: '7 min read',
    summary:
      'How to keep telemetry useful when connectivity quality varies across rooms, floors, and facilities.',
    heroStyle: {
      background:
        'linear-gradient(130deg, rgba(71,85,105,0.45) 0%, rgba(30,41,59,0.42) 50%, rgba(2,6,23,0.55) 100%)',
    },
    content: [
      'Intermittent connectivity should not erase context. Systems need buffering, recovery, and freshness metadata.',
      'Dashboards must distinguish no usage from no signal. Conflating these states creates false alerts.',
      'Operational trust grows when uncertain data is clearly labeled instead of silently converted.',
    ],
  },
  {
    slug: 'asset-tracking-without-infrastructure',
    title: 'Asset Tracking Without Infrastructure: Alternative to GPS & RTLS',
    category: 'Post',
    tags: ['Post', 'Tracking', 'Asset'],
    author: 'OnSight Team',
    publishedAt: '2026-02-05',
    readTime: '6 min read',
    summary:
      'A lightweight playbook for positioning and usage visibility without costly full-facility infrastructure.',
    heroStyle: {
      background:
        'linear-gradient(130deg, rgba(99,102,241,0.3) 0%, rgba(14,165,233,0.24) 50%, rgba(3,105,161,0.36) 100%)',
    },
    content: [
      'Many teams can skip heavy RTLS deployments and still answer high-value operational questions.',
      'When planning starts with decisions, not coordinates, implementation gets faster and cheaper.',
      'Choose the smallest data architecture that can reliably support staffing, maintenance, and layout decisions.',
    ],
  },
  {
    slug: 'top-benefits-of-usage-intelligence-for-facilities',
    title: 'Top Benefits of Usage Intelligence for Facilities',
    category: 'Post',
    tags: ['Post', 'Analytics', 'Facility'],
    author: 'OnSight Team',
    publishedAt: '2026-02-01',
    readTime: '5 min read',
    summary:
      'Usage analytics helps operators improve uptime, staffing, and member experience with fewer blind spots.',
    heroStyle: {
      background:
        'linear-gradient(130deg, rgba(16,185,129,0.3) 0%, rgba(132,204,22,0.24) 50%, rgba(63,98,18,0.36) 100%)',
    },
    content: [
      'Usage intelligence reduces guesswork in purchases, maintenance planning, and schedule design.',
      'The largest gains come from combining machine-level data with zone-level peak behavior.',
      'Alert rules become effective only when upstream usage data quality is stable and interpretable.',
    ],
  },
];

export const BLOG_CATEGORIES = ['All', 'Post', 'Research', 'Announcement'];
