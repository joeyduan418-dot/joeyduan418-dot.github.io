"use client";
import {createContext, useCallback, useContext, useEffect, useRef} from 'react';

export const soundNames = ['page-turn', 'page-riffle', 'paper-slide', 'ticket-tear', 'mouse-click', 'tv-button', 'lamp-switch', 'handset', 'cup', 'photo', 'ribbon'] as const;
export type InteractionSound = typeof soundNames[number];
type PlaySound = (name: InteractionSound) => void;
export const InteractionSoundContext = createContext<PlaySound>(() => {});
export const useInteractionSound = () => useContext(InteractionSoundContext);

export function useInteractionAudio(muted: boolean): PlaySound {
  const players = useRef(new Map<InteractionSound, HTMLAudioElement>());
  const silent = useRef(muted);
  useEffect(() => {
    const bank = players.current;
    soundNames.forEach(name => {
      const audio = new Audio(`/audio/interactions/${name === 'page-turn' ? 'page-turn-real' : name}.wav`);
      audio.preload = 'auto';
      audio.volume = name === 'ticket-tear' ? .48 : name === 'page-turn' || name === 'page-riffle' ? .3 : .4;
      bank.set(name, audio);
    });
    const stop = () => bank.forEach(audio => { audio.pause(); audio.currentTime = 0; });
    const visibility = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      stop();
      bank.forEach(audio => { audio.removeAttribute('src'); audio.load(); });
      bank.clear();
    };
  }, []);
  useEffect(() => {
    silent.current = muted;
    if (muted) players.current.forEach(audio => { audio.pause(); audio.currentTime = 0; });
  }, [muted]);
  return useCallback((name: InteractionSound) => {
    if (silent.current || document.hidden) return;
    const audio = players.current.get(name);
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }, []);
}
