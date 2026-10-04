"use client";

import {useEffect,useRef,useState} from 'react';
import './ip-premiere.css';
import CurlingPoster from './curling-poster';

export default function IpPremiere({onComplete}:{onComplete:()=>void}){
 const [phase,setPhase]=useState<'wind'|'curl'|'flight'>('wind');
 const sheet=useRef<HTMLDivElement>(null);
 const finish=useRef(onComplete);
 finish.current=onComplete;
 useEffect(()=>{
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){const id=window.setTimeout(onComplete,600);return()=>window.clearTimeout(id)}
  const curl=window.setTimeout(()=>setPhase('curl'),900);
  const flight=window.setTimeout(()=>setPhase('flight'),1700);
  return()=>{window.clearTimeout(curl);window.clearTimeout(flight)};
 },[]);
 useEffect(()=>{
  if(phase!=='flight'||!sheet.current)return;
  const paper=sheet.current;
  const source=paper.parentElement!.querySelector('.ip-board-poster-4')!.getBoundingClientRect();
  const picture=paper.querySelector<SVGSVGElement>('svg')!;
  const width=source.width,height=source.height;
  const viewportWidth=window.innerWidth,viewportHeight=window.innerHeight;
  const finalScale=Math.max(viewportWidth/width,viewportHeight/height)*1.04;
  // Aim at the character's face/body, clamping the crop so every viewport edge is covered.
  const finalX=Math.min(0,Math.max(viewportWidth-width*finalScale,viewportWidth/2-width*finalScale*.51));
  const finalY=Math.min(0,Math.max(viewportHeight-height*finalScale,viewportHeight/2-height*finalScale*.65));
  // Rasterize at the final close-up size; animate down from it to avoid magnifying a thumbnail layer.
  Object.assign(paper.style,{width:`${width*finalScale}px`,height:`${height*finalScale}px`,left:'0px',top:'0px',right:'auto'});
  const duration=2250;
  const start=performance.now();
  let frame=0;
  const tick=(now:number)=>{
   const t=Math.min(1,(now-start)/duration);
   const travel=t*t*(3-2*t);
   const flutter=Math.sin(t*Math.PI*2.5)*Math.sin(Math.PI*t);
   const x=source.left+(finalX-source.left)*travel+viewportWidth*.035*flutter;
   const y=source.top+(finalY-source.top)*travel-viewportHeight*.13*Math.sin(Math.PI*t);
   const tilt=-10*Math.sin(Math.PI*t)+3*flutter;
   const turn=12*flutter;
   const scale=Math.exp(Math.log(finalScale)*travel);
   paper.style.transform=`translate3d(${x}px,${y}px,0) rotateZ(${tilt}deg) rotateY(${turn}deg) scale(${scale/finalScale})`;
   picture.style.transform=`skewY(${flutter*2}deg) scaleY(${1+flutter*.025})`;
   picture.style.borderRadius=`0 0 ${Math.abs(flutter)*9}% ${Math.abs(flutter)*5}%`;
   if(t<1)frame=requestAnimationFrame(tick);
   else hold=window.setTimeout(()=>finish.current(),650);
  };
  let hold=0;
  frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);window.clearTimeout(hold)};
 },[phase]);
 return <section className={`ip-premiere ip-phase-${phase}`} aria-label="湘味五侠海报过场动画">
  <div className="ip-board-grain" aria-hidden="true"/>
  <div className="ip-board-heading"><small>WANTED · CHARACTER FILE 02</small><h2>湘味五侠</h2><p>一阵风，吹开江湖的序章</p></div>
  <div className="ip-board-posters">{Array.from({length:5},(_,i)=><div className={`ip-board-poster ip-board-poster-${i}`} key={i}>
   {i===4?<CurlingPoster phase={phase}/>:<img src={`/dossier/poster-original-${i}.webp`} alt={`湘味五侠角色海报 ${i+1}`}/>}
   <i className="ip-thumbtack" aria-hidden="true"/>
  </div>)}</div>
  <div ref={sheet} className="ip-flying-sheet" aria-hidden="true">{phase==='flight'&&<CurlingPoster phase="flight"/>}</div>
  <div className="ip-board-bottom"><span>五张海报 · 一个关于湖湘风味的故事</span><button onClick={onComplete}>跳过动画 ↗</button></div>
 </section>;
}
