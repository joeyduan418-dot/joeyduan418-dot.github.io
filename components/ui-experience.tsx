"use client";

import {useEffect,useRef,useState,type CSSProperties} from 'react';
import './ui-experience.css';

export default function UiExperience({onReturn}:{onReturn:()=>void}){
 const [reading,setReading]=useState(false),[entering,setEntering]=useState(false);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null),host=useRef<HTMLElement>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 useEffect(()=>{
  if(!reading)return;
  const el=host.current!;el.closest('.experience-dialog')?.scrollTo({top:0,behavior:'instant'});
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  el.classList.add('warm-observed');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{root:el.closest('.experience-dialog'),threshold:0,rootMargin:'0px 0px -40px 0px'});
  el.querySelectorAll('.warm-page').forEach(page=>observer.observe(page));
  return()=>observer.disconnect();
 },[reading]);
 const enter=()=>{
  if(entering)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){setReading(true);return}
  setEntering(true);timer.current=setTimeout(()=>setReading(true),1050);
 };
 return reading?<section ref={host} className="warm-reading">
  <header className="warm-reading-heading"><small>WARM STAR / UI DESIGN</small><img src="/dossier/warm-lettering.webp" alt="暖星驿站"/><p>让温暖，有一个抵达的地方。</p><span>项目全览 · 向下探索 ↓</span></header>
  <div className="warm-pages" aria-label="暖星驿站 UI 设计作品集">
   {Array.from({length:17},(_,i)=>i+53).map((n,i)=><section className="warm-page" key={n} aria-label={`暖星驿站作品第${i+1}部分`}>
    <div className="warm-page-rail"><span>暖星驿站 / UI DESIGN</span><b>{String(i+1).padStart(2,'0')} / 17</b></div>
    <a href={`/dossier/page-${n}.webp`} target="_blank" rel="noreferrer" aria-label={`查看原作品集第${n}页大图`}><img src={`/dossier/page-${n}.webp`} alt={`暖星驿站原作品集第${n}页`} loading={i<2?'eager':'lazy'} width="6400" height="3610"/></a>
   </section>)}
  </div><button className="warm-return" onClick={onReturn}>← 回到作品桌面</button>
 </section>:<section className={`warm-premiere ${entering?'is-entering':''}`} aria-label="暖星驿站开场">
  <div className="warm-depth" aria-hidden="true"><div className="warm-wall">{[0,1,2,3,4].map(i=><div className={`warm-lane warm-lane-${i}`} key={i}><div>{[0,1,2,0,1,2].map((n,j)=><img src={`/dossier/ui-screen-${n}.webp`} alt="" key={j}/>)}</div></div>)}</div></div>
  <div className="warm-veil"/>
  <header className="warm-copy"><small>WARM STAR / UI DESIGN</small><img src="/dossier/warm-lettering.webp" alt="暖星驿站"/><p className="warm-handwritten"><img src="/dossier/warm-handwritten-slogan-transparent.png" alt="我们互为驿站，世界便不再荒凉！" width="2081" height="193"/></p><span>点击手机，走进暖星驿站 ↗</span></header>
  <div className="warm-phone-position"><div className="warm-phone-arrival"><div className="warm-phone-float"><button className="warm-phone" aria-label="点击手机进入暖星驿站项目" disabled={entering} onClick={enter} onPointerMove={e=>{if(e.pointerType!=='mouse'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--rx',`${-(e.clientY-r.top-r.height/2)/r.height*6}deg`);e.currentTarget.style.setProperty('--ry',`${(e.clientX-r.left-r.width/2)/r.width*8}deg`)}} onPointerLeave={e=>{e.currentTarget.style.setProperty('--rx','0deg');e.currentTarget.style.setProperty('--ry','0deg')}} style={{'--rx':'0deg','--ry':'0deg'} as CSSProperties}><img src="/dossier/ui-home.webp" alt="暖星驿站 APP 首页" fetchPriority="high"/><span className="warm-screen-light" aria-hidden="true"/></button></div></div></div>
  <button className="warm-skip" onClick={()=>{if(timer.current)clearTimeout(timer.current);setReading(true)}}>直接浏览项目 ↓</button>
 </section>;
}



