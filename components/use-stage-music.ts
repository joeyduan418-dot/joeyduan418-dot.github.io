"use client";
import {useEffect, useRef} from 'react';

const tracks: Record<string,string> = {
  '丝路逐梦': 'silk-road',
  '梨园汇': 'opera-garden',
  '乡村振兴': 'rural-fireflies',
  '白蛇传': 'white-snake',
};

/** One track per production; changing a lighting scene never restarts the music. */
export default function useStageMusic(title: string, muted: boolean, paused: boolean) {
  const player=useRef<HTMLAudioElement|null>(null);
  const preference=useRef({muted,paused});
  const src=tracks[title];
  useEffect(()=>{
    if(!src)return;
    const audio=new Audio(`/audio/stages/${src}.mp3`);
    audio.loop=true;audio.preload='auto';audio.volume=.32;
    player.current=audio;
    const sync=()=>{
      if(!preference.current.muted&&!preference.current.paused&&!document.hidden)void audio.play().catch(()=>{});
      else audio.pause();
    };
    sync();
    window.addEventListener('pointerdown',sync);
    window.addEventListener('keydown',sync);
    document.addEventListener('visibilitychange',sync);
    return()=>{
      window.removeEventListener('pointerdown',sync);
      window.removeEventListener('keydown',sync);
      document.removeEventListener('visibilitychange',sync);
      audio.pause();audio.removeAttribute('src');audio.load();player.current=null;
    };
  },[src]);
  useEffect(()=>{
    preference.current={muted,paused};
    const audio=player.current;
    if(!audio)return;
    if(!muted&&!paused&&!document.hidden)void audio.play().catch(()=>{});
    else audio.pause();
  },[muted,paused]);
}
