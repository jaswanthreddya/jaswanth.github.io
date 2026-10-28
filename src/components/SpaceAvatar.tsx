import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Volume2, VolumeX, X, Play, Square, ChevronRight, Send } from 'lucide-react';
import avatarImg from '@/assets/avatar-guide.png';

/* ================================================================== */
/* 1. Deep-space background: parallax stars, shooting stars, planets,  */
/*    and tech words drifting through space. Tinted by current mood.   */
/* ================================================================== */
const TECH = ['C#', '.NET', 'Angular', 'React', 'TypeScript', 'Sass', 'HTML5', 'Azure', 'AWS', 'SQL', 'WCAG', 'CI/CD', 'GitHub', 'API'];

export function SpaceBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, raf = 0;
    const mouse = { x: 0, y: 0 };

    type Star = { x: number; y: number; z: number; tw: number };
    type Shoot = { x: number; y: number; vx: number; vy: number; life: number };
    type Word = { x: number; y: number; z: number; text: string; vx: number; vy: number; rot: number };
    let stars: Star[] = [];
    let words: Word[] = [];
    const shoots: Shoot[] = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      stars = Array.from({ length: Math.min(420, Math.floor((w * h) / 4500)) }, () => ({
        x: Math.random() * w, y: Math.random() * h, z: Math.random() * 0.9 + 0.1, tw: Math.random() * Math.PI * 2,
      }));
      words = TECH.map((text) => ({
        x: Math.random() * w, y: Math.random() * h, z: Math.random() * 0.6 + 0.3, text,
        vx: (Math.random() - 0.5) * 0.25, vy: -(Math.random() * 0.25 + 0.08), rot: (Math.random() - 0.5) * 0.4,
      }));
    };
    resize();

    const moodHue = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      return v.split(' ')[0] || '270';
    };

    const planet = (x: number, y: number, r: number, hue: string, ring: boolean) => {
      const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
      g.addColorStop(0, `hsla(${hue},70%,70%,0.9)`);
      g.addColorStop(1, `hsla(${hue},60%,20%,0.9)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      if (ring) {
        ctx.strokeStyle = `hsla(${hue},70%,75%,0.45)`;
        ctx.lineWidth = r * 0.12;
        ctx.beginPath(); ctx.ellipse(x, y, r * 1.8, r * 0.45, -0.35, 0, Math.PI * 2); ctx.stroke();
      }
    };

    let t = 0;
    const frame = () => {
      t += 1;
      const hue = moodHue();
      const scroll = window.scrollY;
      // deep space gradient
      const bg = ctx.createRadialGradient(w * 0.7, h * 0.2, 0, w * 0.5, h * 0.5, Math.max(w, h));
      bg.addColorStop(0, `hsl(${hue},45%,12%)`);
      bg.addColorStop(0.5, 'hsl(235,45%,5%)');
      bg.addColorStop(1, 'hsl(240,50%,2%)');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      // nebula clouds
      for (let i = 0; i < 2; i++) {
        const nx = w * (0.25 + i * 0.5) + Math.sin(t / 900 + i) * 60;
        const ny = h * (0.65 - i * 0.3) + Math.cos(t / 1100 + i) * 40;
        const n = ctx.createRadialGradient(nx, ny, 0, nx, ny, w * 0.35);
        n.addColorStop(0, `hsla(${Number(hue) + i * 60},80%,55%,0.14)`);
        n.addColorStop(1, 'transparent');
        ctx.fillStyle = n; ctx.fillRect(0, 0, w, h);
      }

      // planets (parallax with scroll + mouse)
      const px = (mouse.x - w / 2) * 0.02, py = (mouse.y - h / 2) * 0.02;
      planet(w * 0.85 + px, h * 0.25 - scroll * 0.15 % (h * 2) + py, Math.min(w, h) * 0.07, hue, true);
      planet(w * 0.1 - px, h * 0.8 - scroll * 0.08 + py, Math.min(w, h) * 0.035, String(Number(hue) + 140), false);

      // stars
      for (const s of stars) {
        const sx = (s.x + (mouse.x - w / 2) * s.z * 0.03 + w) % w;
        const sy = ((s.y - scroll * s.z * 0.3) % h + h) % h;
        const a = 0.4 + 0.6 * Math.abs(Math.sin(s.tw + t * 0.02 * s.z));
        ctx.fillStyle = `rgba(255,255,255,${a * s.z})`;
        ctx.fillRect(sx, sy, s.z * 2, s.z * 2);
      }

      // floating tech words
      ctx.textAlign = 'center';
      for (const wd of words) {
        if (!reduce) { wd.x += wd.vx; wd.y += wd.vy; }
        if (wd.y < -40) { wd.y = h + 40; wd.x = Math.random() * w; }
        if (wd.x < -60) wd.x = w + 60; if (wd.x > w + 60) wd.x = -60;
        ctx.save();
        ctx.translate(wd.x, wd.y);
        ctx.rotate(wd.rot + Math.sin(t / 200 + wd.x) * 0.05);
        ctx.font = `600 ${Math.round(12 + wd.z * 18)}px "Space Grotesk", sans-serif`;
        ctx.fillStyle = `hsla(${hue},80%,80%,${0.12 + wd.z * 0.2})`;
        ctx.fillText(wd.text, 0, 0);
        ctx.restore();
      }

      // shooting stars
      if (!reduce && Math.random() < 0.012) {
        shoots.push({ x: Math.random() * w, y: Math.random() * h * 0.5, vx: 9 + Math.random() * 6, vy: 4 + Math.random() * 3, life: 1 });
      }
      for (let i = shoots.length - 1; i >= 0; i--) {
        const s = shoots[i];
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 10, s.y - s.vy * 10);
        g.addColorStop(0, `rgba(255,255,255,${s.life})`);
        g.addColorStop(1, 'transparent');
        ctx.strokeStyle = g; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 10, s.y - s.vy * 10); ctx.stroke();
        s.x += s.vx; s.y += s.vy; s.life -= 0.015;
        if (s.life <= 0) shoots.splice(i, 1);
      }

      raf = requestAnimationFrame(frame);
    };
    frame();

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMove); };
  }, []);

  return <canvas ref={ref} aria-hidden className="fixed inset-0 -z-10 pointer-events-none" />;
}

/* ================================================================== */
/* 2. Avatar guide: speaks, gives a guided tour, answers questions    */
/* ================================================================== */
const TOUR = [
  { id: 'hero', text: "Hi! I'm Jaswanth's avatar. Jaswanth is a full stack developer with C# and .NET on the back end, and Angular and React on the front end. Let me show you around." },
  { id: 'about', text: 'Here you can learn about Jaswanth: over five years building enterprise and government applications, with a Master’s in Computer Science.' },
  { id: 'skills', text: 'This is the skills area. Click each tab to see .NET, front-end, accessibility, design systems, Azure DevOps, and SQL Server work. You can even try the accessibility controls live.' },
  { id: 'resume', text: 'This is the career journey. Today Jaswanth supports payment systems at the Florida Department of Revenue. Before that he built Angular apps at Capgemini and .NET applications.' },
  { id: 'projects', text: 'These are featured projects, including computer vision and drone work. Click any card for the details and demo videos.' },
  { id: 'certifications', text: 'Here are certifications and training.' },
  { id: 'contact', text: 'And finally, get in touch here. Also, try the sparkle button at the bottom left. It lets you control this site with hand gestures and changes the theme to match your mood!' },
];

const QA: { keys: string[]; q: string; a: string }[] = [
  { keys: ['who', 'about', 'yourself', 'jaswanth'], q: 'Who is Jaswanth?', a: 'Jaswanth Reddy is a full stack developer focused on C# and .NET plus modern front-end work in Angular and React, building accessible interfaces for enterprise and government systems.' },
  { keys: ['.net', 'c#', 'dotnet', 'backend', 'back end', 'api'], q: 'What .NET experience does he have?', a: 'He has built RESTful APIs with ASP.NET Core, moved systems to microservices, and tuned SQL Server queries to run about forty percent faster.' },
  { keys: ['front', 'angular', 'react', 'html', 'css', 'sass', 'javascript', 'ui'], q: 'What front-end skills?', a: 'HTML5, CSS, Sass, JavaScript and TypeScript, with Angular at Capgemini for a GE client, and React. This site itself is React and TypeScript.' },
  { keys: ['access', 'wcag', '508', 'a11y'], q: 'Does he know accessibility?', a: 'Yes. He builds to WCAG 2.1 AA with semantic HTML, ARIA, keyboard support and visible focus states. Try the accessibility controls in the skills section.' },
  { keys: ['azure', 'devops', 'ci', 'cd', 'pipeline', 'aws', 'cloud', 'github'], q: 'DevOps and cloud?', a: 'He works with Azure DevOps and CI/CD pipelines, GitHub, Azure and AWS, and supports production releases and post-deployment checks.' },
  { keys: ['government', 'gov', 'florida', 'revenue', 'sensitive', 'healthcare'], q: 'Government experience?', a: 'He currently supports enterprise payment systems at the Florida Department of Revenue, working with sensitive financial data under audit and compliance rules.' },
  { keys: ['modern', 'legacy', 'existing', 'migrat'], q: 'Has he modernized apps?', a: 'Yes. Much of his work is improving existing systems: breaking up monoliths into services, automating regression tests to cut QA time about in half, and making older interfaces responsive.' },
  { keys: ['education', 'degree', 'master', 'study', 'university'], q: 'Education?', a: 'A Master of Science in Computer Science from Governors State University, and a Bachelor of Technology in Computer Science from Lovely Professional University.' },
  { keys: ['gesture', 'hand', 'mood', 'camera', 'feature', 'site'], q: 'What is special about this site?', a: 'Click the sparkle button at the bottom left. You can move the cursor with your hand, pinch to click, and the theme changes with your facial expression. Everything runs in your browser.' },
  { keys: ['contact', 'hire', 'email', 'reach'], q: 'How do I contact him?', a: 'Scroll to the contact section at the bottom, or use the chat button in the corner to message him directly.' },
];

function answer(input: string) {
  const s = input.toLowerCase();
  let best = QA[0], score = 0;
  for (const item of QA) {
    const n = item.keys.filter((k) => s.includes(k)).length;
    if (n > score) { score = n; best = item; }
  }
  return score ? best.a : "Good question! I don't have that one yet. Try asking about his .NET work, front-end skills, accessibility, cloud, or government experience.";
}

type Msg = { from: 'bot' | 'you'; text: string };

export function AvatarGuide() {
  const [open, setOpen] = useState(false);
  const [voice, setVoice] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [touring, setTouring] = useState(false);
  const [step, setStep] = useState(0);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'bot', text: "Hi! I'm Jaswanth's 3D guide. Want a quick tour, or ask me anything about him." }]);
  const [input, setInput] = useState('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const tourRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) =>
      setTilt({ x: (e.clientY / window.innerHeight - 0.5) * -14, y: (e.clientX / window.innerWidth - 0.5) * 18 });
    window.addEventListener('mousemove', onMove);
    const t = setTimeout(() => setOpen(true), 4000);
    return () => { window.removeEventListener('mousemove', onMove); clearTimeout(t); window.speechSynthesis?.cancel(); };
  }, []);

  useEffect(() => { listRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }); }, [msgs]);

  const say = (text: string, onEnd?: () => void) => {
    setMsgs((m) => [...m, { from: 'bot', text }]);
    const synth = window.speechSynthesis;
    if (!voice || !synth) { setTimeout(() => onEnd?.(), 3500 + text.length * 25); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = synth.getVoices().find((x) => /en-(US|GB|IN)/.test(x.lang) && /male|david|daniel|google/i.test(x.name)) || synth.getVoices().find((x) => x.lang.startsWith('en'));
    if (v) u.voice = v;
    u.rate = 1.02; u.pitch = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => { setSpeaking(false); onEnd?.(); };
    u.onerror = () => { setSpeaking(false); onEnd?.(); };
    synth.speak(u);
  };

  const goStep = (i: number) => {
    if (!tourRef.current || i >= TOUR.length) { stopTour(); return; }
    setStep(i);
    document.getElementById(TOUR[i].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    say(TOUR[i].text, () => tourRef.current && setTimeout(() => goStep(i + 1), 900));
  };

  const startTour = () => { tourRef.current = true; setTouring(true); setOpen(true); goStep(0); };
  const stopTour = () => { tourRef.current = false; setTouring(false); setSpeaking(false); window.speechSynthesis?.cancel(); };

  const ask = (q: string) => {
    if (!q.trim()) return;
    stopTour();
    setMsgs((m) => [...m, { from: 'you', text: q }]);
    setInput('');
    setTimeout(() => say(answer(q)), 300);
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto glass w-[340px] max-w-[calc(100vw-2rem)] rounded-3xl overflow-hidden mood-glow"
            role="dialog"
            aria-label="Avatar guide"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <p className="font-semibold text-sm">Jaswanth's guide</p>
                <p className="text-xs text-muted-foreground">{touring ? `Tour · ${step + 1}/${TOUR.length}` : 'Ask me anything'}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setVoice(!voice); window.speechSynthesis?.cancel(); }} aria-label={voice ? 'Mute voice' : 'Turn voice on'} className="p-2 rounded-full hover:bg-muted">
                  {voice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button onClick={() => { stopTour(); setOpen(false); }} aria-label="Close guide" className="p-2 rounded-full hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div ref={listRef} className="max-h-60 overflow-y-auto p-4 space-y-3" aria-live="polite">
              {msgs.map((m, i) => (
                <div key={i} className={`text-sm leading-relaxed px-3 py-2 rounded-2xl max-w-[90%] ${m.from === 'bot' ? 'bg-muted' : 'ml-auto mood-gradient text-white'}`}>
                  {m.text}
                </div>
              ))}
            </div>

            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {touring ? (
                <>
                  <button onClick={stopTour} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-muted hover:bg-muted/70"><Square className="w-3 h-3" /> Stop tour</button>
                  <button onClick={() => { window.speechSynthesis?.cancel(); goStep(step + 1); }} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-muted hover:bg-muted/70">Next <ChevronRight className="w-3 h-3" /></button>
                </>
              ) : (
                <button onClick={startTour} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs mood-gradient text-white"><Play className="w-3 h-3" /> Start guided tour</button>
              )}
              {QA.slice(0, 4).map((x) => (
                <button key={x.q} onClick={() => ask(x.q)} className="px-3 py-1.5 rounded-full text-xs border border-border hover:bg-muted">{x.q}</button>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2 p-3 border-t border-border">
              <label htmlFor="avatar-q" className="sr-only">Ask a question</label>
              <input id="avatar-q" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about skills, experience…" className="flex-1 bg-transparent text-sm px-3 py-2 rounded-full border border-border outline-none focus:ring-2 focus:ring-primary" />
              <button type="submit" aria-label="Send question" className="p-2 rounded-full mood-gradient text-white"><Send className="w-4 h-4" /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The 3D avatar */}
      <motion.button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Hide guide' : 'Open guide'}
        className="pointer-events-auto relative w-28 h-28 md:w-32 md:h-32"
        style={{ perspective: 600 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="absolute inset-2 rounded-full mood-gradient blur-xl opacity-60" />
        {speaking && (
          <motion.span className="absolute inset-0 rounded-full border-2 border-primary" animate={{ scale: [1, 1.25], opacity: [0.8, 0] }} transition={{ duration: 1, repeat: Infinity }} />
        )}
        <motion.div
          className="relative w-full h-full rounded-full overflow-hidden glass border-2 border-primary/50"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateX: tilt.x, rotateY: tilt.y, scale: speaking ? [1, 1.03, 1] : 1 }}
          transition={speaking ? { scale: { duration: 0.35, repeat: Infinity } } : { type: 'spring', stiffness: 80, damping: 12 }}
        >
          <img src={avatarImg} alt="" width={128} height={128} className="w-full h-full object-cover object-top scale-110 translate-y-2" />
        </motion.div>
        {speaking ? (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-4 px-2 py-0.5 rounded-full glass">
            {[0, 1, 2, 3].map((i) => (
              <motion.span key={i} className="w-1 rounded-full mood-gradient" animate={{ height: [4, 12, 4] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} />
            ))}
          </span>
        ) : (
          !open && <span className="absolute -top-1 -left-1 p-1.5 rounded-full mood-gradient"><MessageCircle className="w-4 h-4 text-white" /></span>
        )}
      </motion.button>
    </div>
  );
}
