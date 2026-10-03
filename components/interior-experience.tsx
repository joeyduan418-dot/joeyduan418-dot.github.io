"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import './interior-experience.css';
import InteriorHouseModel from './interior-house-model';

const rooms=[
 {name:'玄关',image:7,zone:[35,83,26,13]},
 {name:'客厅',image:6,zone:[23,48,33,33]},
 {name:'餐厅',image:8,zone:[36,6,18,31]},
 {name:'厨房',image:0,zone:[19,6,15,31]},
 {name:'主卧',image:2,zone:[84,49,13,34]},
 {name:'男孩房',image:1,zone:[61,50,16,33]},
 {name:'女孩房',image:4,zone:[66,10,16,26]},
 {name:'客卧',image:3,zone:[2,52,15,28]},
 {name:'卫生间',image:5,zone:[56,7,8,28]},
];
export default function InteriorExperience(){
 const [progress,setProgress]=useState(0),[entered,setEntered]=useState(false),[room,setRoom]=useState(0),[failed,setFailed]=useState(false);
 const [modelReady,setModelReady]=useState(false),[modelFailed,setModelFailed]=useState(false);
 const [guideOpen,setGuideOpen]=useState(false),[changing,setChanging]=useState(false),[roomError,setRoomError]=useState(''),[fullFrame,setFullFrame]=useState(false);
 const roomRequest=useRef(0);
 const heading=useRef<HTMLHeadingElement>(null);
 const mapButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  if(!modelReady)return;
  let disposed=false,frame=0,start=0,ready=false;
  const first=new Image();first.src='/dossier/room-7.webp';
  first.decode().then(()=>{ready=true}).catch(()=>{if(!disposed)setFailed(true)});
  const tick=(now:number)=>{
   if(!start)start=now;
   const elapsed=now-start;
   const value=Math.min(ready?100:95,Math.floor(elapsed/40));setProgress(value);
   if(value===100 && elapsed>=4300){setEntered(true);return;}
   frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>{disposed=true;cancelAnimationFrame(frame)};
 },[modelReady]);
 useEffect(()=>{if(entered)heading.current?.focus()},[entered]);
 useEffect(()=>()=>{roomRequest.current++},[]);
 const current=rooms[room];
 const change=async(index:number)=>{
  if(index===room){setGuideOpen(false);return;}
  if(index<0 || index>=rooms.length)return;
  const id=++roomRequest.current;setChanging(true);setRoomError('');
  const image=new Image();image.src=`/dossier/room-${rooms[index].image}.webp`;
  try{
   await image.decode();if(id!==roomRequest.current)return;
   setRoom(index);setGuideOpen(false);
  }catch{if(id===roomRequest.current)setRoomError('这个空间暂时没能加载，请再次选择。')}
  finally{if(id===roomRequest.current)setChanging(false)}
 };
 if(!entered)return <section className="home-loading" aria-label="正在进入室内设计">
  <small>INTERIOR DESIGN / DUAN JINGYI</small><h2>把生活，慢慢装进家里。</h2>
  {modelFailed?<p className="home-model-unavailable">当前设备无法显示三维模型，正在进入作品。</p>:<InteriorHouseModel onReady={()=>setModelReady(true)} onError={()=>{setModelFailed(true);setModelReady(true)}}/>}
  {!modelFailed&&<p className="home-model-hint">拖动小屋，换个角度看看</p>}
  <div className="home-loading-meter"><div className="home-loading-label"><span>{failed?'图片暂未加载成功':'正在打开这个家'}</span><b>{progress}%</b></div><div className="home-loading-track" role="progressbar" aria-label="空间加载进度" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${progress}%`}}/></div></div>
  {failed&&<button onClick={()=>setEntered(true)}>进入查看</button>}
 </section>;
 return <section className={`home-immersive ${fullFrame?'is-full-frame':''}`} aria-label="沉浸式住宅参观" onKeyDown={e=>{if(e.key==='Escape'&&guideOpen){setGuideOpen(false);mapButton.current?.focus()}if(e.target===e.currentTarget&&!guideOpen){if(e.key==='ArrowRight')void change(room+1);if(e.key==='ArrowLeft')void change(room-1)}}} tabIndex={0}>
  <div className="home-immersive-ambient" style={{backgroundImage:`url('/dossier/room-${current.image}.webp')`}} aria-hidden="true"/>
  <div key={current.image} className="home-immersive-scene">
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src={`/dossier/room-${current.image}.webp`} alt={`${current.name}室内设计效果图`} draggable={false}/>
  </div>
  <header className="home-immersive-title"><small>HOME / INTERIOR DESIGN</small><h2 ref={heading} tabIndex={-1}>{current.name}</h2></header>
  <div className="home-immersive-tools"><button aria-pressed={fullFrame} onClick={()=>setFullFrame(v=>!v)}>{fullFrame?'沉浸画面':'完整画面'}</button><a href={`/dossier/room-${current.image}.webp`} target="_blank" rel="noreferrer" aria-label={`查看${current.name}高清原图`}>原图 ↗</a></div>
  {changing&&<span className="home-immersive-loading" role="status">正在进入…</span>}
  <nav className="home-immersive-nav" aria-label="参观路线">
   <button disabled={room===0||changing} onClick={()=>void change(room-1)} aria-label="上一个空间">←</button>
   <div><span>{String(room+1).padStart(2,'0')} / {String(rooms.length).padStart(2,'0')}</span><button ref={mapButton} aria-expanded={guideOpen} aria-controls="home-floor-map" onClick={()=>setGuideOpen(v=>!v)}>平面导览 <i>⌑</i></button></div>
   <button disabled={room===rooms.length-1||changing} onClick={()=>void change(room+1)}>{room<rooms.length-1?`进入${rooms[room+1].name}`:'参观结束'} →</button>
  </nav>
  {roomError&&<p className="home-immersive-error" role="alert">{roomError}</p>}
  {guideOpen&&<div className="home-map-overlay" id="home-floor-map">
   <div className="home-map-panel" aria-label="大平层空间导览">
    <header><div><small>FLOOR PLAN</small><h3>你想走进哪个空间？</h3></div><button onClick={()=>{setGuideOpen(false);mapButton.current?.focus()}} aria-label="收起平面导览">×</button></header>
    <div className="home-map-drawing">
     {/* eslint-disable-next-line @next/next/no-img-element */}
     <img src="/dossier/interior-floor-plan.png" alt="住宅真实平面布置图"/>
     {rooms.map((r,index)=>{const [x,y,w,h]=r.zone;return <button key={r.name} className="home-map-region" style={{left:`${x}%`,top:`${y}%`,width:`${w}%`,height:`${h}%`} as CSSProperties} aria-pressed={room===index} onClick={()=>void change(index)}><span>{r.name}</span></button>})}
    </div>
    <nav aria-label="选择房间">{rooms.map((r,index)=><button key={r.name} aria-pressed={room===index} onClick={()=>void change(index)}>{r.name}</button>)}</nav>
   </div>
  </div>}
 </section>;
}
