"use client";

import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import SiteStatusScreen, {type SiteStatus} from './site-status';

/** Decode the same URLs used by the workbench, so reveal never precedes its image. */
function prepareImage(src: string, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    const timeout = window.setTimeout(() => finish(new Error('Image timed out')), 20000);
    const abort = () => finish(new DOMException('Aborted', 'AbortError'));
    function finish(error?: Error) {
      window.clearTimeout(timeout);
      signal.removeEventListener('abort', abort);
      image.onload = null;
      image.onerror = null;
      if (error) reject(error); else resolve();
    }
    signal.addEventListener('abort', abort, {once: true});
    image.onload = () => image.decode().then(() => finish(), () => finish(new Error('Image decode failed')));
    image.onerror = () => finish(new Error('Image unavailable'));
    image.src = src;
  });
}

export default function SiteEntry({children}: {children: ReactNode}) {
  const [status, setStatus] = useState<SiteStatus | null>('loading');
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const ready = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(async () => {
    controller.current?.abort();
    if (exitTimer.current) clearTimeout(exitTimer.current);
    if (!navigator.onLine) { setStatus('offline'); return; }
    if (ready.current) { setStatus(null); return; }
    const attempt = new AbortController();
    const startedAt = performance.now();
    controller.current = attempt;
    setStatus('loading');
    setProgress(0);
    const font = (description: string) => {
      // Font failure falls back to system type; it must never block the portfolio.
      let timeout: ReturnType<typeof setTimeout>;
      return Promise.race([
        document.fonts.load(description).catch(() => []),
        new Promise(resolve => {timeout = setTimeout(resolve, 4000);}),
      ]).finally(() => clearTimeout(timeout));
    };
    const tasks = [
      prepareImage('/dossier/desk.webp', attempt.signal),
      prepareImage('/dossier/wallpaper.webp', attempt.signal),
      font('700 48px "Status Fredoka"'),
      font('400 16px Inter'),
      font('400 16px "Noto Sans SC"'),
    ];
    let completed = 0;
    try {
      await Promise.all(tasks.map(task => task.then(() => {
        if (!attempt.signal.aborted) setProgress(Math.round(++completed / tasks.length * 100));
      })));
      if (attempt.signal.aborted) return;
      ready.current = true;
      setMounted(true);
      setProgress(100);
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Keep the welcome readable even on a warm cache; never fake resource progress.
      exitTimer.current = setTimeout(() => {
        setStatus('leaving');
        exitTimer.current = setTimeout(() => setStatus(null), reduced ? 0 : 600);
      }, reduced ? 0 : Math.max(0, 2000 - (performance.now() - startedAt)));
    } catch {
      if (attempt.signal.aborted) return;
      attempt.abort();
      setStatus(navigator.onLine ? 'failed' : 'offline');
    }
  }, []);

  useEffect(() => {
    // Start after hydration; the server already renders the loading screen.
    const frame = requestAnimationFrame(() => {void start();});
    const offline = () => {
      controller.current?.abort();
      if (exitTimer.current) clearTimeout(exitTimer.current);
      setStatus('offline');
    };
    const online = () => {void start();};
    window.addEventListener('offline', offline);
    window.addEventListener('online', online);
    return () => {
      cancelAnimationFrame(frame);
      controller.current?.abort();
      if (exitTimer.current) clearTimeout(exitTimer.current);
      window.removeEventListener('offline', offline);
      window.removeEventListener('online', online);
    };
  }, [start]);

  useEffect(() => {
    if (!status) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {document.body.style.overflow = previous;};
  }, [status]);

  return <>{mounted && <div inert={status !== null}>{children}</div>}{status && <SiteStatusScreen status={status} progress={progress} onRetry={() => {void start();}}/>}</>;
}
