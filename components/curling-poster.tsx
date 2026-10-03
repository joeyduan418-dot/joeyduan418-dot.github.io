"use client";

import {useEffect,useId,useRef} from 'react';

// Curved front silhouette and paper reverse share one moving seam.
export default function CurlingPoster({phase}:{phase:'wind'|'curl'|'flight'}){
 const id=useId().replace(/:/g,''),svg=useRef<SVGSVGElement>(null);
 useEffect(()=>{
  const root=svg.current!;
  const front=root.querySelector('[data-front]')!,back=root.querySelector('[data-back]')!,crease=root.querySelector('[data-crease]')!;
  let frame=0;const start=performance.now();
  const tick=(now:number)=>{
   const seconds=(now-start)/1000,p=Math.min(1,seconds/(phase==='flight'?1.15:.8));
   const ease=p*p*(3-2*p);
   const amount=phase==='wind'?.035+.018*Math.sin(seconds*3):phase==='curl'?.035+.965*ease:1-ease;
   const size=260*amount;
   const x=640-size,y=950-size*1.25;
   const seam=`M ${x} 950 Q ${640-size*.32} ${950-size*.45} 640 ${y}`;
   front.setAttribute('d',`M 0 0 H 640 V ${y} Q ${640-size*.32} ${950-size*.45} ${x} 950 H 0 Z`);
   // The lifted tip retreats into the sheet, with a rounded roll instead of a flat triangle.
   back.setAttribute('d',`${seam} C ${640-size*.08} ${y+size*.36} ${640-size*.55} ${y+size*.18} ${640-size*.70} ${y+size*.30} C ${x+size*.12} ${950-size*.37} ${x+size*.25} ${950-size*.10} ${x} 950 Z`);
   crease.setAttribute('d',seam);
   root.style.setProperty('--curl-opacity',String(Math.min(1,amount*12)));
   if(phase==='wind'||p<1)frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>cancelAnimationFrame(frame);
 },[phase]);
 return <svg ref={svg} className="ip-paper-surface" viewBox="0 0 640 950" preserveAspectRatio="none" role="img" aria-label="湘味五侠角色海报 5">
  <defs>
   <clipPath id={`${id}-front`}><path data-front d="M0 0H640V950H0Z"/></clipPath>
   <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8b704b"/><stop offset=".24" stopColor="#d2b989"/><stop offset=".53" stopColor="#f8e7be"/><stop offset=".78" stopColor="#e5cfa0"/><stop offset="1" stopColor="#b79a6b"/></linearGradient>
   <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="-6" dy="-8" stdDeviation="7" floodColor="#100b06" floodOpacity=".42"/></filter>
  </defs>
  <image href="/dossier/poster-original-4.png" width="640" height="950" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id}-front)`}/>
  <g style={{opacity:'var(--curl-opacity,0)'}}>
   <path data-back fill={`url(#${id}-paper)`} filter={`url(#${id}-shadow)`}/>
   <path data-crease fill="none" stroke="#fff1ce" strokeWidth="1.3" opacity=".55"/>
  </g>
 </svg>;
}
