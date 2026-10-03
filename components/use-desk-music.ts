"use client";

import {useEffect, useRef} from 'react';

/** Keep one player alive while inspecting desk objects; pause without rewinding. */
export default function useDeskMusic(enabled: boolean, paused: boolean) {
  const player = useRef<HTMLAudioElement | null>(null);
  const preference = useRef({enabled, paused});

  useEffect(() => {
    const audio = new Audio('/audio/quiet-desk.wav');
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = .38;
    player.current = audio;
    const synchronize = () => {
      if (preference.current.enabled && !preference.current.paused && !document.hidden) {
        void audio.play().catch(() => { /* Retry on the first permitted gesture. */ });
      } else audio.pause();
    };
    synchronize();
    window.addEventListener('pointerdown', synchronize);
    window.addEventListener('keydown', synchronize);
    document.addEventListener('visibilitychange', synchronize);
    return () => {
      window.removeEventListener('pointerdown', synchronize);
      window.removeEventListener('keydown', synchronize);
      document.removeEventListener('visibilitychange', synchronize);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      player.current = null;
    };
  }, []);

  useEffect(() => {
    preference.current = {enabled, paused};
    const audio = player.current;
    if (!audio) return;
    if (enabled && !paused && !document.hidden) void audio.play().catch(() => {});
    else audio.pause();
  }, [enabled, paused]);
}
