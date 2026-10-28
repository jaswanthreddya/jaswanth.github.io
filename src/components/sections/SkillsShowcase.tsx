import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Hand, Smile, Sparkles, X, Code2, Layout, Accessibility, Cloud, Database,
  ShieldCheck, RefreshCw, Palette, GitBranch, Type, Contrast, PauseCircle, MousePointerClick,
  CheckCircle2, ArrowRight,
} from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';

/* ------------------------------------------------------------------ */
/* 1. AI feature spotlight: welcome card + pulsing hint for AI mode    */
/* ------------------------------------------------------------------ */
const SPOTLIGHT_KEY = 'jr-ai-spotlight-seen';

export function AIFeatureSpotlight() {
  const { isAIModeActive, toggleAIMode } = useMood();
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(SPOTLIGHT_KEY)) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isAIModeActive) setShowHint(false);
  }, [isAIModeActive]);

  const close = () => {
    localStorage.setItem(SPOTLIGHT_KEY, '1');
    setOpen(false);
  };

  const start = () => {
    close();
    if (!isAIModeActive) toggleAIMode();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="spotlight-title"
            onKeyDown={(e) => e.key === 'Escape' && close()}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass relative max-w-lg w-full rounded-3xl p-8 mood-glow"
            >
              <button
                onClick={close}
                aria-label="Close welcome message"
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary outline-none"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-14 h-14 mood-gradient rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 id="spotlight-title" className="text-3xl font-bold mb-3">
                This portfolio <span className="mood-text-gradient">reacts to you</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Turn on AI mode to browse hands-free and let the layout adapt to your mood, all in your browser.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-3"><Hand className="w-5 h-5 text-primary shrink-0" /> Move the cursor with your hand, pinch to click</li>
                <li className="flex gap-3"><Smile className="w-5 h-5 text-primary shrink-0" /> Colors, music and layout change with your expression</li>
                <li className="flex gap-3"><ShieldCheck className="w-5 h-5 text-primary shrink-0" /> The camera feed stays on your device and is never uploaded</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={start}
                  autoFocus
                  className="flex-1 px-6 py-3 mood-gradient rounded-full font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary outline-none"
                >
                  Try AI mode
                </button>
                <button
                  onClick={close}
                  className="flex-1 px-6 py-3 glass rounded-full font-semibold focus-visible:ring-2 focus-visible:ring-primary outline-none"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing hint next to the existing AI button (bottom-left) */}
      <AnimatePresence>
        {showHint && !open && !isAIModeActive && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            onClick={start}
            className="fixed bottom-8 left-24 z-50 hidden sm:flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium mood-glow"
          >
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full mood-gradient opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full mood-gradient" />
            </span>
            Try hand gestures &amp; mood mode
            <span
              role="button"
              aria-label="Hide hint"
              onClick={(e) => { e.stopPropagation(); setShowHint(false); }}
              className="ml-1 p-0.5 rounded-full hover:bg-muted"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Accessibility toolbar (live WCAG 2.1 AA demo)                    */
/* ------------------------------------------------------------------ */
function useA11yPrefs() {
  const [fontScale, setFontScale] = useState(100);
  const [contrast, setContrast] = useState(false);
  const [noMotion, setNoMotion] = useState(false);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`;
  }, [fontScale]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('a11y-contrast', contrast);
    root.classList.toggle('a11y-no-motion', noMotion);
    root.classList.toggle('a11y-focus', focus);
  }, [contrast, noMotion, focus]);

  return { fontScale, setFontScale, contrast, setContrast, noMotion, setNoMotion, focus, setFocus };
}

const A11Y_CSS = `
.a11y-contrast { filter: contrast(1.35); }
.a11y-contrast body { background: #000 !important; }
.a11y-no-motion *, .a11y-no-motion *::before, .a11y-no-motion *::after {
  animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important;
}
.a11y-focus a:focus, .a11y-focus button:focus, .a11y-focus input:focus, .a11y-focus textarea:focus, .a11y-focus [tabindex]:focus {
  outline: 3px solid #facc15 !important; outline-offset: 3px !important;
}
.skip-link { position: absolute; left: 1rem; top: -4rem; z-index: 100; padding: .75rem 1rem; border-radius: .75rem; background: #111; color: #fff; transition: top .2s; }
.skip-link:focus { top: 1rem; }
`;

export function SkipLink() {
  return (
    <>
      <style>{A11Y_CSS}</style>
      <a href="#skills" className="skip-link">Skip to skills</a>
    </>
  );
}

function A11yToolbar() {
  const p = useA11yPrefs();
  const toggles = [
    { label: 'High contrast', icon: Contrast, on: p.contrast, set: p.setContrast },
    { label: 'Reduce motion', icon: PauseCircle, on: p.noMotion, set: p.setNoMotion },
    { label: 'Strong focus rings', icon: MousePointerClick, on: p.focus, set: p.setFocus },
  ];
  return (
    <div className="glass rounded-2xl p-6" role="region" aria-label="Accessibility controls">
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <Accessibility className="w-5 h-5 text-primary" /> Try it: accessibility controls
      </h4>
      <div className="flex items-center gap-3 mb-4">
        <Type className="w-4 h-4" aria-hidden />
        <label htmlFor="font-scale" className="text-sm w-24">Text size</label>
        <input
          id="font-scale"
          type="range"
          min={90}
          max={150}
          step={10}
          value={p.fontScale}
          onChange={(e) => p.setFontScale(Number(e.target.value))}
          aria-valuetext={`${p.fontScale} percent`}
          className="flex-1 accent-primary"
        />
        <span className="text-sm w-12 text-right" aria-hidden>{p.fontScale}%</span>
      </div>
      <div className="grid sm:grid-cols-3 gap-2">
        {toggles.map((t) => (
          <button
            key={t.label}
            role="switch"
            aria-checked={t.on}
            onClick={() => t.set(!t.on)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none ${
              t.on ? 'mood-gradient text-white border-transparent' : 'border-border hover:bg-muted'
            }`}
          >
            <t.icon className="w-4 h-4" aria-hidden /> {t.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Built with semantic HTML, ARIA roles, keyboard support, a skip link (press Tab on page load) and visible focus states, following WCAG 2.1 AA.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Skills matrix                                                    */
/* ------------------------------------------------------------------ */
const skillGroups = [
  {
    title: '.NET & C# Back End',
    icon: Code2,
    skills: ['C#', 'ASP.NET Core', '.NET Web API', 'Entity Framework', 'LINQ', 'Microservices', 'Java / Spring Boot'],
    proof: 'Built REST APIs with ASP.NET Core and a microservices setup that made enterprise apps easier to scale.',
  },
  {
    title: 'Front-End Engineering',
    icon: Layout,
    skills: ['HTML5', 'CSS3', 'Sass / SCSS', 'JavaScript (ES2022)', 'TypeScript', 'Angular', 'React', 'Tailwind CSS'],
    proof: 'Built Angular UIs for a GE client at Capgemini and React interfaces in .NET full-stack work; this site runs on React + TypeScript.',
  },
  {
    title: 'UX / UI & Design Thinking',
    icon: Palette,
    skills: ['Design thinking', 'Usability principles', 'Responsive design', 'Design-to-code', 'Prototyping', 'User research'],
    proof: 'Turned stakeholder requirements and process flows into working interfaces; this site adapts its layout to each visitor.',
  },
  {
    title: 'Accessibility (WCAG 2.1 AA)',
    icon: Accessibility,
    skills: ['WCAG 2.1 AA', 'Section 508', 'ARIA', 'Keyboard navigation', 'axe DevTools', 'WAVE', 'Lighthouse', 'NVDA screen reader'],
    proof: 'Codes and tests interfaces to accessibility standards; try the live controls below.',
  },
  {
    title: 'Enterprise Design Systems',
    icon: Palette,
    skills: ['Design tokens', 'Component libraries', 'shadcn/ui', 'Angular Material', 'Theming', 'Storybook-style docs'],
    proof: 'Every theme on this site comes from one set of design tokens; the mood engine switches them live.',
  },
  {
    title: 'DevOps & Cloud',
    icon: Cloud,
    skills: ['Azure DevOps', 'CI/CD pipelines', 'GitHub & GitHub Actions', 'Azure', 'AWS (EC2, S3, Lambda)', 'Docker'],
    proof: 'Supported production releases and post-deployment checks; this site deploys automatically to GitHub Pages.',
  },
  {
    title: 'Data, APIs & Middleware',
    icon: Database,
    skills: ['SQL Server', 'T-SQL', 'MySQL', 'REST APIs', 'Middleware integration', 'Redis', 'SAP / Salesforce integration'],
    proof: 'Made database queries about 40% faster and connected enterprise systems through REST and middleware.',
  },
  {
    title: 'Government & Sensitive Data',
    icon: ShieldCheck,
    skills: ['State government systems', 'Financial / payment data', 'Audit & compliance', 'Production support', 'Role-based access'],
    proof: 'Supports Florida Department of Revenue payment systems: investigating production issues, testing, and audit compliance.',
  },
];

function SkillsMatrix() {
  const [active, setActive] = useState(0);
  const g = skillGroups[active];
  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      <div role="tablist" aria-label="Skill areas" className="flex lg:flex-col gap-2 overflow-x-auto pb-2">
        {skillGroups.map((s, i) => (
          <button
            key={s.title}
            role="tab"
            id={`skill-tab-${i}`}
            aria-selected={active === i}
            aria-controls="skill-panel"
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowRight') setActive((active + 1) % skillGroups.length);
              if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') setActive((active - 1 + skillGroups.length) % skillGroups.length);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-primary outline-none ${
              active === i ? 'mood-gradient text-white mood-glow' : 'glass hover:bg-muted'
            }`}
          >
            <s.icon className="w-5 h-5 shrink-0" aria-hidden />
            <span className="text-sm font-medium">{s.title}</span>
          </button>
        ))}
      </div>
      <motion.div
        key={active}
        id="skill-panel"
        role="tabpanel"
        aria-labelledby={`skill-tab-${active}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8"
      >
        <h3 className="text-2xl font-bold mb-2">{g.title}</h3>
        <p className="text-muted-foreground mb-6">{g.proof}</p>
        <div className="flex flex-wrap gap-2">
          {g.skills.map((s) => (
            <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden /> {s}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Live design-system tokens                                        */
/* ------------------------------------------------------------------ */
function DesignTokens() {
  const { getMoodConfig } = useMood();
  const mood = getMoodConfig();
  const tokens = ['--primary', '--secondary', '--accent', '--muted', '--background', '--foreground'];
  return (
    <div className="glass rounded-2xl p-6">
      <h4 className="font-semibold mb-1 flex items-center gap-2">
        <Palette className="w-5 h-5 text-primary" /> Live design tokens
      </h4>
      <p className="text-sm text-muted-foreground mb-4">
        Current theme: {mood.emoji} {mood.name}. Change mood in AI mode and watch the tokens update.
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {tokens.map((t) => (
          <div key={t} className="text-center">
            <div className="h-14 rounded-xl border border-border transition-colors duration-500" style={{ background: `hsl(var(${t}))` }} />
            <code className="text-[10px] text-muted-foreground">{t}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Modernization case study + delivery pipeline                     */
/* ------------------------------------------------------------------ */
const pipeline = [
  { step: 'Commit', detail: 'GitHub / Azure Repos' },
  { step: 'Build', detail: 'Azure DevOps pipeline' },
  { step: 'Test', detail: 'Unit, regression, accessibility' },
  { step: 'Review', detail: 'Code review + UAT' },
  { step: 'Release', detail: 'Azure / AWS / Pages' },
];

function Modernization() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="glass rounded-2xl p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" /> Updating existing apps, not starting from scratch
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground mb-2">Before</p>
            <ul className="space-y-1.5">
              <li>Monolithic services</li>
              <li>Manual regression testing</li>
              <li>Fixed-width, mouse-only UI</li>
              <li>Slow SQL queries</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mood-text-gradient mb-2">After</p>
            <ul className="space-y-1.5">
              <li>.NET Core microservices + REST</li>
              <li>Automated tests (~50% less QA time)</li>
              <li>Responsive, accessible Angular/React</li>
              <li>Tuned queries (~40% faster)</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="glass rounded-2xl p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" /> CI/CD delivery flow
        </h4>
        <ol className="flex flex-wrap items-center gap-2">
          {pipeline.map((p, i) => (
            <li key={p.step} className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="px-3 py-2 rounded-xl bg-muted text-center"
              >
                <p className="text-sm font-semibold">{p.step}</p>
                <p className="text-[11px] text-muted-foreground">{p.detail}</p>
              </motion.div>
              {i < pipeline.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground" aria-hidden />}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section wrapper                                                     */
/* ------------------------------------------------------------------ */
export function SkillsShowcase() {
  return (
    <section id="skills" className="py-20 section-transition" aria-labelledby="skills-title">
      <div className="container mx-auto px-4 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 id="skills-title" className="text-4xl md:text-5xl font-bold mb-4">
            Skills &amp; <span className="mood-text-gradient">Capabilities</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Full-stack .NET and front-end engineering with a focus on accessible, user-centered interfaces for enterprise and government systems.
          </p>
        </motion.div>
        <SkillsMatrix />
        <div className="grid lg:grid-cols-2 gap-6">
          <A11yToolbar />
          <DesignTokens />
        </div>
        <Modernization />
      </div>
    </section>
  );
}
