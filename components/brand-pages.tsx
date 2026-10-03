"use client";

import {useEffect,useRef} from 'react';

const page=(n:number)=>`/dossier/page-${String(n).padStart(2,'0')}.webp`;

export default function BrandPages(){
 const container=useRef<HTMLDivElement>(null);

 useEffect(()=>{
  const host=container.current;
  if(!host||!('IntersectionObserver' in window))return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced)return;
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(entry.isIntersecting){
     entry.target.classList.add('is-visible');
     observer.unobserve(entry.target);
    }
   }
  },{root:host.closest('.experience-dialog'),rootMargin:'0px 0px 80px 0px',threshold:.06});
  host.querySelectorAll('.brand-page').forEach(element=>observer.observe(element));
  return()=>observer.disconnect();
 },[]);

 return <div ref={container} className="brand-web-pages" aria-label="张家界酒品牌重塑项目内容">
  {Array.from({length:27},(_,index)=>index+7).map((n,index)=><section className="brand-page" key={n} aria-label={`项目内容第${index+1}部分`}>
   <div className="brand-page-rail" aria-hidden="true"><span>ZHANG JIA JIE JIU / BRAND DESIGN</span><b>{String(index+1).padStart(2,'0')} / 27</b></div>
   <a href={page(n)} target="_blank" rel="noreferrer" aria-label={`查看原作品集第${n}页大图`}>
    <img src={page(n)} loading={index<2?'eager':'lazy'} alt={`张家界酒原作品集第${n}页`}/>
   </a>
  </section>)}
 </div>;
}
