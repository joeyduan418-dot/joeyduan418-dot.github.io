"use client";
import {useEffect,useRef} from 'react';
export type PickupOrigin={left:number;top:number;width:number;height:number};
export default function ResumePickup({origin,onComplete,onCancel}:{origin:PickupOrigin;onComplete:()=>void;onCancel:()=>void}){
 const paper=useRef<HTMLImageElement>(null);
 useEffect(()=>{
  const el=paper.current;if(!el)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const width=Math.min(innerWidth*.64,380),height=width*1.414;
  const x=(innerWidth-width)/2,y=Math.max(70,(innerHeight-height)/2);
  const startWidth=origin.width*.48;
  const animation=el.animate([
   {transform:`translate(${origin.left+origin.width*.12}px,${origin.top-origin.height*.16}px) scale(${startWidth/width}) rotateX(63deg) rotateZ(-8deg)`,opacity:0,filter:'brightness(.65)'},
   {offset:.12,transform:`translate(${origin.left+origin.width*.12}px,${origin.top-origin.height*.16}px) scale(${startWidth/width}) rotateX(63deg) rotateZ(-8deg)`,opacity:1,filter:'brightness(.8)'},
   {offset:.52,transform:`translate(${x+35}px,${y-45}px) scale(.88) rotateX(14deg) rotateZ(-5deg)`,opacity:1,filter:'brightness(1)'},
   {transform:`translate(${x}px,${y}px) scale(1) rotateX(0deg) rotateZ(-2deg)`,opacity:1,filter:'brightness(1)'}
  ],{duration:reduced?0:1100,easing:'cubic-bezier(.22,.7,.24,1)',fill:'forwards'});
  animation.onfinish=onComplete;
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')onCancel()};window.addEventListener('keydown',escape);
  return()=>{animation.onfinish=null;animation.cancel();window.removeEventListener('keydown',escape)};
 },[origin,onComplete,onCancel]);
 return <div className="pickup-overlay" role="dialog" aria-modal="true" aria-label="正在拾取个人简历"><div className="pickup-shade"/><img ref={paper} className="pickup-paper" style={{width:'min(64vw,380px)'}} src="/assets/resume.png" alt="从工作台拾起的个人简历"/><div className="pickup-status" aria-live="polite"><small>ITEM FOUND / 01</small><p>拾起一份设计师的经历。</p></div><button autoFocus className="pickup-skip" onClick={onComplete}>直接查看 →</button><button className="pickup-cancel" onClick={onCancel}>取消 / ESC</button></div>
}
