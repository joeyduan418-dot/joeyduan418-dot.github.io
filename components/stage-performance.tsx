"use client";

import {useCallback,useEffect,useRef,useState,useSyncExternalStore} from 'react';
import StageLivingPoster from './stage-living-poster';
import './stage-performance.css';

type StageProject={title:string;gallery:string[]};
const SCENE_DURATION=8000;
const CROSSFADE_DURATION=1100;
const subscribeVisibility=(notify:()=>void)=>{document.addEventListener('visibilitychange',notify);return()=>document.removeEventListener('visibilitychange',notify)};
const subscribeMotion=(notify:()=>void)=>{const media=matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',notify);return()=>media.removeEventListener('change',notify)};

export default function StagePerformance({project,onBack}:{project:StageProject;onBack:()=>void}){
 const [scene,setScene]=useState(0);
 const [incoming,setIncoming]=useState<number|null>(null);
 const [paused,setPaused]=useState(false);
 const [readySrc,setReadySrc]=useState<string|null>(null);
 const hidden=useSyncExternalStore(subscribeVisibility,()=>document.hidden,()=>false);
 const reduced=useSyncExternalStore(subscribeMotion,()=>matchMedia('(prefers-reduced-motion: reduce)').matches,()=>false);
 const playing=!paused && !hidden && !reduced;
 const lock=useRef(false),request=useRef(0);
 const fadeElapsed=useRef(0),stage=useRef<HTMLElement>(null);
 const elapsed=useRef(0),progress=useRef<HTMLSpanElement>(null);
 const current=project.gallery[scene];

 useEffect(()=>()=>{
  request.current++;
 },[]);

 useEffect(()=>{
  const image=new Image();image.src=project.gallery[(scene+1)%project.gallery.length];
  void image.decode().catch(()=>{});
 },[project.gallery,scene]);

 const go=useCallback(async(target:number)=>{
  if(lock.current || target===scene)return;
  lock.current=true;
  const id=++request.current;
  const image=new Image();image.src=project.gallery[target];
  try{await image.decode()}catch{lock.current=false;elapsed.current=0;return;}
  if(id!==request.current)return;
  const finish=()=>{
   setScene(target);setReadySrc(project.gallery[target]);setIncoming(null);
   elapsed.current=0;lock.current=false;
  };
  if(reduced || !playing){finish();return;}
  fadeElapsed.current=0;
  stage.current?.style.setProperty('--stage-fade','0');
  setIncoming(target);
 },[project.gallery,scene,reduced,playing]);

 useEffect(()=>{
  if(!playing || readySrc!==current || project.gallery.length<2)return;
  let frame=0,previous=0;
  const tick=(now:number)=>{
   const delta=previous?Math.min(now-previous,100):0;
   previous=now;
   if(incoming!==null){
    fadeElapsed.current+=delta;
    stage.current?.style.setProperty('--stage-fade',String(Math.min(1,fadeElapsed.current/CROSSFADE_DURATION)));
    if(fadeElapsed.current>=CROSSFADE_DURATION){
     setScene(incoming);setReadySrc(project.gallery[incoming]);setIncoming(null);
     elapsed.current=0;lock.current=false;
     return;
    }
    frame=requestAnimationFrame(tick);return;
   }
   elapsed.current+=delta;
   progress.current?.style.setProperty('--scene-progress',String(Math.min(1,elapsed.current/SCENE_DURATION)));
   if(elapsed.current>=SCENE_DURATION && !lock.current)void go((scene+1)%project.gallery.length);
   frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>cancelAnimationFrame(frame);
 },[playing,incoming,readySrc,current,project.gallery,scene,go]);

 return <div className={`stage-performance ${playing?'is-playing':'is-paused'} ${incoming!==null?'is-crossfading':''}`}>
  <div className="stage-performance-top">
   <button className="stage-performance-back" onClick={onBack}>← 返回票卷</button>
   <div className="stage-performance-heading"><small>SCENOGRAPHY · 舞台布景设计</small><h2>{project.title}</h2></div>
   <div className="stage-performance-status"><span className="stage-performance-count">{String(scene+1).padStart(2,'0')} / {String(project.gallery.length).padStart(2,'0')}</span><small><i aria-hidden="true"/>{reduced?'静态查看':paused?'已暂停':'自动循环'}</small></div>
  </div>

  <div className="stage-performance-room">
   <div className="stage-performance-ambient" style={{backgroundImage:`url("${current}")`}} aria-hidden="true"/>
   <figure ref={stage} className="stage-performance-stage" aria-label={`${project.title}动态舞台海报`}>
    {[scene,...(incoming!==null?[incoming]:[])].map(index=><div key={project.gallery[index]} className={`stage-performance-layer ${index===incoming?'is-incoming':''}`} aria-hidden={incoming!==null && index===scene}>
     <StageLivingPoster src={project.gallery[index]} alt={`${project.title}舞台设计，第 ${index+1} 幕`} paused={!playing} onReady={()=>{if(index===scene)setReadySrc(project.gallery[index])}}/>
    </div>)}
   </figure>
  </div>

  <div className="stage-performance-bottom">
   {!reduced && <button className="stage-performance-pause" onClick={()=>setPaused(v=>!v)} aria-label={paused?'继续播放舞台动态海报':'暂停舞台动态海报'}><span aria-hidden="true">{paused?'▷':'Ⅱ'}</span> {paused?'继续播放':'暂停'}</button>}
   <div className="stage-performance-progress" aria-label={`第 ${scene+1} 幕，共 ${project.gallery.length} 幕`}>
    {project.gallery.map((src,i)=><button key={src} className={i===scene?'is-current':i<scene?'is-past':''} onClick={()=>void go(i)} disabled={incoming!==null} aria-label={`查看第 ${i+1} 幕`} aria-current={i===scene?'step':undefined}><span ref={i===scene?progress:undefined}/></button>)}
   </div>
   <a href={current} target="_blank" rel="noreferrer" className="stage-performance-original" aria-label={`查看${project.title}第 ${scene+1} 幕原图`}>查看原图 ↗</a>
  </div>
 </div>;
}
