"use client";

import {useEffect,useRef,useState} from 'react';
import './video-television.css';
import {useInteractionSound} from './interaction-sound';

function TelevisionStatic(){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current,ctx=canvas?.getContext('2d');
  if(!canvas || !ctx)return;
  canvas.width=320;canvas.height=180;
  const frame=ctx.createImageData(320,180);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let raf=0,last=0;
  const draw=(now:number)=>{
   if(now-last>95 || last===0){
    last=now;
    for(let i=0;i<frame.data.length;i+=4){const v=35+Math.random()*155;frame.data[i]=v;frame.data[i+1]=v;frame.data[i+2]=v+8;frame.data[i+3]=255;}
    ctx.putImageData(frame,0,0);
    ctx.fillStyle='rgba(0,0,0,.42)';ctx.fillRect(0,(now*.022)%210-30,320,16);
   }
   if(!reduced.matches)raf=requestAnimationFrame(draw);
  };
  raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);
 },[]);
 return <canvas ref={ref} className="video-archive-static" aria-hidden="true"/>;
}

export default function VideoTelevision({videos,muted=false}:{videos:{title:string;src:string}[];muted?:boolean}){
 const [channel,setChannel]=useState(-1);
 const sound=useInteractionSound();
 const selectChannel=(next:number)=>{sound('tv-button');setChannel(next)};
 return <section className="video-archive" aria-label="AI 视频电视机">
  <div className="video-archive-tv">
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img className="video-archive-shell" src="/dossier/ai-television-mockup.webp" alt="DJY 复古银色电视机，带像素贴纸" draggable={false}/>
   <div className={`video-archive-screen ${channel<0?'is-idle':''}`}>
    {channel<0?<div className="video-archive-idle"><TelevisionStatic/><span>DJY VIDEO ARCHIVE</span><strong>请选择频道</strong><small>按下机身上的 01 — 05</small></div>:<video key={videos[channel].src} src={videos[channel].src} controls autoPlay muted={muted} playsInline preload="metadata" aria-label={videos[channel].title}/>}
   </div>
   {videos.map((v,i)=><button key={v.src} className={`video-archive-knob knob-${i}`} aria-label={`频道 ${i+1}：${v.title}`} aria-pressed={channel===i} title={v.title} onClick={()=>selectChannel(i)}>{i===4&&<span>05</span>}</button>)}
   <button className="video-archive-power" aria-label={channel<0?'打开电视，播放频道 1':'关闭电视，返回待机'} title={channel<0?'开机':'待机'} onClick={()=>selectChannel(channel<0?0:-1)}/>
  </div>
  <nav className="video-archive-channels" aria-label="视频频道">
   {videos.map((v,i)=><button key={v.src} aria-pressed={channel===i} onClick={()=>selectChannel(i)}><span>0{i+1}</span>{v.title}</button>)}
  </nav>
 </section>;
}
