"use client";

import {useEffect, useRef, useState, type CSSProperties} from 'react';
import './desk-atmosphere.css';

// Coordinates follow the original 1672 × 941 desk photograph, excluding window frames.
const panes = [
  [[0,0],[34,0],[35,64],[0,88]],
  [[68,0],[170,0],[173,47],[72,74]],
  [[193,0],[242,0],[246,28],[195,43]],
  [[0,111],[37,101],[43,323],[0,346]],
  [[73,98],[174,73],[178,293],[77,329]],
  [[196,67],[248,47],[256,278],[201,300]],
];

export default function DeskAtmosphere({lampOn, active}: {lampOn: boolean; active: boolean}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [bounds, setBounds] = useState<CSSProperties>({visibility: 'hidden'});


  useEffect(() => {
    const image = document.querySelector<HTMLImageElement>('.desk-backdrop');
    if (!image) return;
    function measure() {
      if (!image?.parentElement) return;
      const rect = image.getBoundingClientRect(), parent = image.parentElement.getBoundingClientRect();
      setBounds({left: rect.left - parent.left, top: rect.top - parent.top, width: rect.width, height: rect.height});
    }
    const observer = new ResizeObserver(measure);
    observer.observe(image); observer.observe(image.parentElement!);
    image.addEventListener('load', measure); window.addEventListener('resize', measure); measure();
    return () => { observer.disconnect(); image.removeEventListener('load', measure); window.removeEventListener('resize', measure); };
  }, []);

  useEffect(() => {
    const el = canvas.current, ctx = el?.getContext('2d');
    if (!el || !ctx || !active) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, last = 0, previous = 0;
    const drops = Array.from({length: 105}, (_, i) => ({x: Math.random() * 258, y: Math.random() * 350, speed: 55 + Math.random() * 60, length: 9 + Math.random() * 16, alpha: .24 + Math.random() * .32, depth: i % 3}));
    const glassDrops = Array.from({length: 9}, () => ({x: 15 + Math.random() * 230, y: Math.random() * 330, speed: 7 + Math.random() * 9}));
    function draw(time: number) {
      if (!el || !ctx) return;
      if (document.hidden) { last = 0; frame = requestAnimationFrame(draw); return; }
      if (time - previous < 33) { frame = requestAnimationFrame(draw); return; }
      previous = time;
      const dt = last ? Math.min((time - last) / 1000, .1) : 0; last = time;
      const scale = Math.min(window.devicePixelRatio || 1, 2), w = el.clientWidth, h = el.clientHeight;
      if (el.width !== Math.round(w * scale) || el.height !== Math.round(h * scale)) { el.width = Math.round(w * scale); el.height = Math.round(h * scale); }
      ctx.setTransform(el.width / 1672, 0, 0, el.height / 941, 0, 0); ctx.clearRect(0,0,1672,941);
      ctx.save(); ctx.beginPath();
      panes.forEach(points => { ctx.moveTo(points[0][0], points[0][1]); points.slice(1).forEach(([x,y]) => ctx.lineTo(x,y)); ctx.closePath(); });
      ctx.clip();
      for (const drop of drops) {
        if (!motion.matches) drop.y += drop.speed * dt;
        if (drop.y > 352) { drop.y = -12; drop.x = Math.random() * 258; }
        ctx.strokeStyle = `rgba(185,212,255,${drop.alpha})`; ctx.lineWidth = drop.depth === 0 ? 1.15 : .75;
        ctx.beginPath(); ctx.moveTo(drop.x,drop.y); ctx.lineTo(drop.x - 2,drop.y + drop.length); ctx.stroke();
      }
      // A few slower rivulets on the glass distinguish the foreground from rain outside.
      for (const drop of glassDrops) {
        if (!motion.matches) drop.y += drop.speed * dt;
        if (drop.y > 345) { drop.y = -20; drop.x = 15 + Math.random() * 230; }
        const trail = ctx.createLinearGradient(drop.x, drop.y - 18, drop.x, drop.y + 2);
        trail.addColorStop(0, 'rgba(176,207,255,0)'); trail.addColorStop(1, 'rgba(195,221,255,.48)');
        ctx.strokeStyle = trail; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(drop.x+.8,drop.y-18); ctx.quadraticCurveTo(drop.x-1,drop.y-8,drop.x,drop.y); ctx.stroke();
        ctx.fillStyle = 'rgba(216,231,255,.65)'; ctx.beginPath(); ctx.ellipse(drop.x,drop.y,1,1.7,0,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
      if (!motion.matches) frame = requestAnimationFrame(draw);
    }
    const restart = () => { cancelAnimationFrame(frame); last = 0; frame = requestAnimationFrame(draw); };
    motion.addEventListener('change', restart); restart();
    return () => { cancelAnimationFrame(frame); motion.removeEventListener('change', restart); ctx.clearRect(0,0,el.width,el.height); };
  }, [active]);

  return <div className={`desk-atmosphere ${lampOn ? '' : 'lamp-is-off'} ${active ? '' : 'atmosphere-paused'}`} style={bounds} aria-hidden="true">
    <canvas ref={canvas} className="desk-window-rain"/>
    <svg className="desk-plant-motion" viewBox="0 0 1672 941">
      <defs>
        <clipPath id="desk-leaves-clip"><path d="M194 210 211 192 245 188 260 153 300 142 301 105 318 90 347 92 369 117 394 116 431 132 451 144 474 170 469 191 438 186 410 164 397 186 375 183 359 217 381 240 382 265 363 286 345 288 347 267 324 247 304 275 277 302 256 316 238 290 238 263 214 247Z"/></clipPath>
        <clipPath id="desk-shelf-leaves-clip"><path d="M1420 0H1597L1583 42 1544 37 1524 69 1532 102 1511 134 1487 148 1471 122 1471 96 1454 88 1434 53Z"/></clipPath>
        <clipPath id="desk-leaf-tip-clip"><path d="M304 141 306 108 319 91 341 93 355 109 344 129 325 143Z"/></clipPath>
        <clipPath id="desk-leaf-gold-clip"><path d="M236 265 244 250 268 246 287 256 280 281 256 314 243 292Z"/></clipPath>
      </defs>
      <g className="desk-leaves-front"><image href="/dossier/desk.webp" width="1672" height="941" clipPath="url(#desk-leaves-clip)"/></g>
      <g className="desk-leaves-shelf"><image href="/dossier/desk.webp" width="1672" height="941" clipPath="url(#desk-shelf-leaves-clip)"/></g>
      <g className="desk-leaf-tip"><image href="/dossier/desk.webp" width="1672" height="941" clipPath="url(#desk-leaf-tip-clip)"/></g>
      <g className="desk-leaf-gold"><image href="/dossier/desk.webp" width="1672" height="941" clipPath="url(#desk-leaf-gold-clip)"/></g>
    </svg>
    <svg className="desk-lamp-dark" viewBox="0 0 1672 941">
      <defs><radialGradient id="desk-lamp-dim"><stop stopColor="#0c1427" stopOpacity=".6"/><stop offset="1" stopColor="#0c1427" stopOpacity="0"/></radialGradient></defs>
      <ellipse cx="1259" cy="175" rx="82" ry="16" transform="rotate(17 1259 175)" fill="#162036" fillOpacity=".96"/>
      <ellipse cx="1265" cy="240" rx="210" ry="155" fill="url(#desk-lamp-dim)"/>
      <ellipse cx="1190" cy="530" rx="420" ry="185" fill="url(#desk-lamp-dim)"/>
    </svg>
    <svg className="desk-monitor-light" viewBox="0 0 1672 941">
      <defs>
        <clipPath id="desk-monitor-screen"><path d="M670 137 Q815 124 959 129 Q977 128 978 146 L976 325 Q975 340 961 343 L677 363 Q659 366 657 351 L653 158 Q652 142 670 137Z"/></clipPath>
        <radialGradient id="desk-monitor-glow"><stop stopColor="#6a99ff" stopOpacity=".12"/><stop offset="1" stopColor="#6a99ff" stopOpacity="0"/></radialGradient>
        <radialGradient id="desk-monitor-bounce-falloff">
          <stop stopColor="white"/><stop offset=".4" stopColor="white" stopOpacity=".8"/>
          <stop offset=".75" stopColor="white" stopOpacity=".3"/><stop offset="1" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <mask id="desk-monitor-bounce-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1672" height="941">
          {/* Reflected light follows nearby surfaces; it is strongest at the screen and keyboard. */}
          <ellipse cx="816" cy="275" rx="245" ry="180" fill="url(#desk-monitor-bounce-falloff)" opacity=".85"/>
          <ellipse cx="844" cy="462" rx="235" ry="83" fill="url(#desk-monitor-bounce-falloff)" opacity=".95"/>
          <ellipse cx="835" cy="556" rx="320" ry="142" fill="url(#desk-monitor-bounce-falloff)" opacity=".65"/>
          <ellipse cx="1092" cy="454" rx="123" ry="71" fill="url(#desk-monitor-bounce-falloff)" opacity=".55"/>
          <ellipse cx="546" cy="423" rx="79" ry="107" fill="url(#desk-monitor-bounce-falloff)" opacity=".35"/>
        </mask>
        <filter id="desk-monitor-cool-reflection" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values=".78 0 0 0 0  0 1.05 0 0 0  0 0 1.35 0 0  0 0 0 1 0"/>
        </filter>
      </defs>
      <g className="desk-monitor-spill">
        {/* Relight the original surface textures, preserving the keys, paper and object contours. */}
        <image href="/dossier/desk.webp" width="1672" height="941" mask="url(#desk-monitor-bounce-mask)" filter="url(#desk-monitor-cool-reflection)"/>
        <ellipse cx="815" cy="330" rx="265" ry="210" fill="url(#desk-monitor-glow)"/>
      </g>
      {/* The powered screen retains its original luminance independently of the desk lamp. */}
      <image href="/dossier/desk.webp" width="1672" height="941" clipPath="url(#desk-monitor-screen)"/>
    </svg>
  </div>;
}
