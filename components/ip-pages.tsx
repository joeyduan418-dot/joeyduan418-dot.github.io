"use client";

import {useEffect,useRef} from 'react';
import './ip-pages.css';

const page=(n:number)=>`/dossier/page-${String(n).padStart(2,'0')}.webp`;

export default function IpPages(){
 const container=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const host=container.current;
  if(!host)return;
  if(!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches){host.querySelectorAll('.ip-story-page').forEach(el=>el.classList.add('is-visible'));return}
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{root:host.closest('.experience-dialog'),rootMargin:'0px 0px -8% 0px',threshold:.08});
  host.querySelectorAll('.ip-story-page').forEach(el=>observer.observe(el));
  return()=>observer.disconnect();
 },[]);
 return <div ref={container} className="ip-story-pages" aria-label="湘味五侠项目详情">
  {Array.from({length:17},(_,i)=>i+35).map((n,i)=><section className="ip-story-page" key={n} aria-label={`湘味五侠项目第${i+1}部分`}>
   <div className="ip-story-rail"><span>湘味五侠 · 江湖档案</span><b>{String(i+1).padStart(2,'0')} / 17</b></div>
   <a href={page(n)} target="_blank" rel="noreferrer" aria-label={`查看原作品集第${n}页大图`}><img src={page(n)} alt={`湘味五侠原作品集第${n}页`} loading={i<2?'eager':'lazy'}/></a>
  </section>)}
 </div>;
}
