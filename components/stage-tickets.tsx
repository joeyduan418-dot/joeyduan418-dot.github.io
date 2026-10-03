"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import assets from '../data/dossier-assets.json';
import StageTicketScene,{ticketColors,ticketSubtitles,ticketArtwork,type TicketPhase} from './stage-ticket-scene';
import StagePerformance from './stage-performance';
import './stage-tickets.css';
import {useInteractionSound} from './interaction-sound';

export default function StageTickets({mute}:{mute:boolean}){
 const [selected,setSelected]=useState(0),[gallery,setGallery]=useState<number|null>(null),[phase,setPhase]=useState<TicketPhase>('rolled'),[ready,setReady]=useState(false),[used,setUsed]=useState<number[]>([]);
 const host=useRef<HTMLElement>(null),lock=useRef(false);
 const tearing=phase==='tearing',finished=used.length===assets.stage.length;
 const sound=useInteractionSound();
 useEffect(()=>{host.current?.closest('.experience-dialog')?.scrollTo({top:0,behavior:'instant'})},[gallery,selected]);
 const tear=()=>{
  if(lock.current||!ready||phase!=='rolled')return;lock.current=true;setPhase('tearing');

 };
 const complete=()=>{setUsed(v=>v.includes(selected)?v:[...v,selected]);if(selected<assets.stage.length-1){setSelected(i=>i+1);setPhase('rolled')}else{setPhase('detached')}lock.current=false};
 return <section ref={host} className={`theatre-experience theatre-continuous ${used.length?'has-tickets':'is-first-roll'} ${finished?'is-finished':''}`}>
  {gallery!==null&&<StagePerformance key={gallery} project={assets.stage[gallery]} onBack={()=>setGallery(null)}/>}
  <div hidden={gallery!==null}>
   <div className={`theatre-machine ${tearing?'is-tearing':''}`}>
    <StageTicketScene index={selected} title={assets.stage[selected].title} phase={phase} onReady={()=>setReady(true)} onComplete={complete} onRip={()=>{if(!mute)sound('ticket-tear')}}/>
    <div className="theatre-action">
     {finished?<span role="status">四场好戏，已收入票根。点击下方票根查看作品。</span>:<button disabled={tearing||!ready} onClick={tear}>{!ready?'正在准备票卷…':tearing?'正在撕票…':'撕下一张票根 ↗'}</button>}
     <span className="theatre-sr" aria-live="polite">已撕下 {used.length} 张，共四张</span>
    </div>
   </div>
   <div className="theatre-selection" aria-label="已撕下的舞台票根">{used.map(i=>{const s=assets.stage[i];return <button className="theatre-mini" key={s.title} disabled={tearing} onClick={()=>{sound('paper-slide');setGallery(i)}} style={{'--ticket-paper':ticketColors[i]} as CSSProperties}>
    <span className="theatre-mini-number">ADMIT ONE<br/>A 000{i+1}</span><img src={ticketArtwork[i]} alt=""/><span className="theatre-mini-title"><strong>{s.title}</strong><small>{ticketSubtitles[i]}</small><em>查看作品 ↗</em></span><i aria-hidden="true">0{i+1}</i>
   </button>})}</div>
  </div>
 </section>;
}
