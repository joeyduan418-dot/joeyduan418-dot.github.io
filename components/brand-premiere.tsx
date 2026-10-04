"use client";
import {useEffect,useRef,useState,type ReactNode} from 'react';
import './brand-premiere.css';

// User-requested preview of the enhanced artwork; the original asset is retained.
const brandArtwork='/dossier/brand-premiere-enhanced.webp';

export default function BrandPremiere({children}:{children:ReactNode}){
 const canvas=useRef<HTMLCanvasElement>(null),reading=useRef<HTMLDivElement>(null),finish=useRef(false);
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[run,setRun]=useState(0);
 useEffect(()=>{
  let active=true,frame=0,resize:ResizeObserver|undefined;const image=new Image();finish.current=false;setReady(false);setFailed(false);
  image.onload=()=>{if(!active)return;const el=canvas.current!,ctx=el.getContext('2d')!;const start=performance.now();let lastTime=start;
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   const ease=(x:number)=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
   // Keep the established shot sequence, but finish the camera move in 4.7 seconds.
   const draw=(now:number,redraw=false)=>{if(!active)return;lastTime=now;const t=finish.current||reduced?10:((now-start)/1000)*(9.2/4.7);
    // Supersample ordinary screens and retain native pixels on high-density displays.
    const w=el.clientWidth,h=el.clientHeight,dpr=Math.max(window.devicePixelRatio||1,2);if(el.width!==Math.round(w*dpr)||el.height!==Math.round(h*dpr)){el.width=Math.round(w*dpr);el.height=Math.round(h*dpr)}ctx.setTransform(el.width/w,0,0,el.height/h,0,0);ctx.fillStyle='#030504';ctx.fillRect(0,0,w,h);
    // Keep the established camera crops unchanged when switching artwork.
    let crop:number[],alpha=1,brightness=1;
    if(t<3){const p=ease(t/3);crop=[.543+p*.012,.165+p*.012,.125,.245];brightness=.16+.84*ease(t/2);alpha=Math.min(1,t/.35,Math.max(0,(3-t)/.3))}
    else if(t<5.7){const p=ease((t-3)/2.7);crop=[.713+p*.012,.425+p*.035,.18,.37];alpha=Math.min(1,(t-3)/.35,(5.7-t)/.25);brightness=.8}
    else{const p=ease((t-5.7)/3.4);crop=[.51+(.40-.51)*p,.38+(.065-.38)*p,.19+(.585-.19)*p,.46+(.92-.46)*p];alpha=Math.min(1,(t-5.7)/.35);brightness=.6+.4*p}
    const [x,y,cw,ch]=crop;const final=ease((t-7)/2.1),mobile=w<700;const targetW=mobile?w:w*(1-.36*final),targetX=mobile?0:w*.36*final;
    const ratio=cw*image.width/(ch*image.height),dw=Math.min(targetW,h*ratio),dh=dw/ratio,dx=targetX+(targetW-dw)/2,dy=(h-dh)/2;
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.globalAlpha=Math.max(0,alpha);ctx.filter=`brightness(${brightness})`;ctx.drawImage(image,x*image.width,y*image.height,cw*image.width,ch*image.height,dx,dy,dw,dh);ctx.filter='none';ctx.globalAlpha=1;
    const shade=ctx.createLinearGradient(dx,0,dx+dw,0);shade.addColorStop(0,'#030504');shade.addColorStop(.09,'#03050400');shade.addColorStop(.9,'#03050400');shade.addColorStop(1,'#030504');ctx.fillStyle=shade;ctx.fillRect(dx,0,dw,h);
    if(redraw)return;
    if(t>=9.2){setReady(true);return}frame=requestAnimationFrame(draw);
   };resize=new ResizeObserver(()=>draw(lastTime,true));resize.observe(el);frame=requestAnimationFrame(draw);
  };image.onerror=()=>{if(active){setFailed(true);setReady(true)}};
  image.src=brandArtwork;
  return()=>{active=false;cancelAnimationFrame(frame);resize?.disconnect();image.onload=null;image.onerror=null};
 },[run]);
 const skip=()=>{finish.current=true;setReady(true)};
 return <div className="brand-premiere">
  <section className={`brand-stage ${ready?'is-revealed':''}`} aria-label="张家界酒产品发布开场">
   <canvas ref={canvas} aria-label="张家界酒瓶盖、包装纹样特写与完整产品展示" role="img"/>
   {failed&&<img className="brand-fallback" src={brandArtwork} alt="张家界酒产品"/>}
   <div className="brand-reveal-copy" aria-hidden={!ready}><small>BRAND REDESIGN</small><img src="/dossier/brand-lettering.webp" alt="张家界酒"/><p>张家界酒 · 品牌重塑</p><button disabled={!ready} onClick={()=>reading.current?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}>向下探索项目 ↓</button></div>
   <div className="brand-film-controls">{ready?<button onClick={()=>setRun(v=>v+1)}>重播开场 ↺</button>:<button onClick={skip}>跳过开场 →</button>}<span>{ready?'张家界酒 / 品牌重塑':'细节之中，见全貌。'}</span></div>
  </section>
  <div ref={reading} className="brand-original-content">{children}</div>
 </div>
}
