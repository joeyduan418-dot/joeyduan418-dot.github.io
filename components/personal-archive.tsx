"use client";
import {useState,useEffect,useCallback,useRef,type CSSProperties} from 'react';
import ArchiveNotebook from './hanging-notebook';
import {useInteractionSound} from './interaction-sound';
import CertificateTurn from './certificate-turn';
import {Dialog,DialogContent,DialogTitle} from './ui/dialog';
import assets from '../data/dossier-assets.json';

const photos=['黄石寨的山间','雪场的一天','溪水与山林','秋日的阳光','游泳之后','散步的日常'];
const collect=[['125px','-35px'],['-95px','-150px'],['255px','-210px'],['45px','-315px'],['355px','-435px'],['-160px','-465px']];
const MAX_PULL=210;


function HonorPage({side,start,preview=false,onTurn,onSelect}:{side:number;start:number;preview?:boolean;onTurn?:()=>void;onSelect?:(src:string,title:string)=>void}){
 return <div className={`honor-page page-${side} ${preview?'honor-turn-preview':''}`} role={preview?undefined:'button'} tabIndex={preview?undefined:0} aria-hidden={preview||undefined} aria-label={preview?undefined:side===0?'点击翻到上一页':'点击翻到下一页'} onClick={onTurn} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onTurn?.()}}}>
  {assets.honors.slice(start,start+2).map((src,j)=><article className="honor-entry" key={src}><button tabIndex={preview?-1:0} onClick={e=>{e.stopPropagation();onSelect?.(src,`荣誉证书 ${start+j+1}`)}}><img src={src} alt={`荣誉证书 ${start+j+1}`} loading={preview?'eager':'lazy'}/><span>点击查看原件 ↗</span></button><div><small>记录 / {String(start+j+1).padStart(2,'0')}</small><h3>荣誉证书</h3><p>颁发机构、时间及荣誉名称，请查看证书原文。</p></div></article>)}
 </div>;
}

export default function PersonalArchive(){
 const sound=useInteractionSound();
 const [opened,setOpened]=useState(false);
 const [turnSheet,setTurnSheet]=useState<{direction:'next'|'prev';front:string[];back:string[];target:number}|null>(null);
 const [settled,setSettled]=useState(false);
 const [ribbon,setRibbon]=useState(false);
 const [phase,setPhase]=useState<'life'|'flash'|'honors'>('life');
 const [pull,setPull]=useState(0);
 const [dragging,setDragging]=useState(false);
 const [spread,setSpread]=useState(0);
 const [turning,setTurning]=useState<''|'next'|'prev'>('');
 const [turnReady,setTurnReady]=useState(false);
 const [selected,setSelected]=useState<{src:string;title:string}|null>(null);
 const origin=useRef(0),distance=useRef(0),dragActive=useRef(false),transitionTimer=useRef<ReturnType<typeof setTimeout>|null>(null),turnTimer=useRef<ReturnType<typeof setTimeout>|null>(null),turnEndTimer=useRef<ReturnType<typeof setTimeout>|null>(null),readyTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const onReady=useCallback(()=>setSettled(true),[]);
 useEffect(()=>{if(!settled)return;const id=setTimeout(()=>setRibbon(true),6100);return()=>clearTimeout(id)},[settled]);
 useEffect(()=>()=>{if(transitionTimer.current)clearTimeout(transitionTimer.current);if(turnTimer.current)clearTimeout(turnTimer.current);if(turnEndTimer.current)clearTimeout(turnEndTimer.current);if(readyTimer.current)clearTimeout(readyTimer.current)},[]);
 useEffect(()=>{if(phase!=='flash')return;const id=setTimeout(()=>{setPhase('honors');setPull(0)},320);return()=>clearTimeout(id)},[phase]);
 const completePull=()=>{sound('ribbon');setDragging(false);setPull(MAX_PULL);transitionTimer.current=setTimeout(()=>setPhase('flash'),520)};
 const releasePull=()=>{dragActive.current=false;if(distance.current>=145)completePull();else{setDragging(false);setPull(0)}};
 const count=Math.ceil(assets.honors.length/4),progress=Math.min(1,pull/MAX_PULL);
 const turnBook=(direction:'next'|'prev')=>{if(turning)return;const target=spread+(direction==='next'?1:-1);if(target<0||target>=count)return;setTurnReady(false);setTurning(direction);setTurnSheet({direction,target,front:assets.honors.slice(spread*4+(direction==='next'?2:0),spread*4+(direction==='next'?4:2)),back:assets.honors.slice(target*4+(direction==='next'?0:2),target*4+(direction==='next'?2:4))})};
 const archiveStyle={'--archive-pull':`${pull}px`,'--collect':progress} as CSSProperties;
 return <section className={`personal-archive archive-${phase}`} style={archiveStyle}>
  {phase!=='honors'?<>
   <header className="archive-heading"><small>PERSONAL ARCHIVE / 段静怡</small><h2>生活，翻到这一页。</h2><p>几段日常，夹在我的个人档案里。</p></header>
   <div className="notebook-composition">
    <ArchiveNotebook onReady={onReady} opened={opened} onOpen={()=>{sound('page-riffle');setOpened(true)}}/>
    {!opened&&<p className="book-open-hint">点击本子，翻开个人档案</p>}
    <div className={`falling-photos ${settled?'photos-released':''} ${dragging||pull>0?'photos-collecting':''}`}>
     {photos.map((title,i)=><button key={title} className={`life-photo photo-${i}`} style={{'--angle':`${[-8,7,-4,6,-6,8][i]}deg`,'--delay':`${i*390}ms`,'--sway':`${[-1.2,.9,-.8,1.1,-.7,1][i]}deg`,'--collect-x':collect[i][0],'--collect-y':collect[i][1]} as CSSProperties} disabled={!settled} onClick={()=>{sound('photo');setSelected({src:`/dossier/life-${i}.webp`,title})}}><img src={`/dossier/life-${i}.webp`} alt={title}/><span>{title}<small>0{i+1} / MOMENT</small></span></button>)}
    </div>
    {ribbon&&<div className="ribbon-position">
     <button className={`medal-ribbon ${dragging?'is-dragging':''}`} aria-label="向下拉出奖牌，查看荣誉证书；也可按回车" onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();completePull()}}} onPointerDown={e=>{origin.current=e.clientY;distance.current=pull;dragActive.current=true;setDragging(true);e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(!dragActive.current)return;distance.current=Math.max(0,Math.min(MAX_PULL,e.clientY-origin.current));setPull(distance.current)}} onPointerUp={releasePull} onPointerCancel={()=>{dragActive.current=false;setDragging(false);setPull(0)}}>
      <span className="ribbon-stitch"/><span className="ribbon-copy">2024 · WORLD SKILLS</span><img src="/dossier/medal-cutout.webp" alt="世界职业院校技能大赛银牌"/>
     </button><p>向下拉出奖牌</p>
    </div>}
   </div><p className="archive-caption">悬停翻看 · 点击放大照片 · 拉动红色奖牌带</p>
  </>:<div className="honor-scene">
   <header><small>HONORS / PERSONAL ARCHIVE</small><h2>留下努力的凭证。</h2><button onClick={()=>{setTurnSheet(null);setTurning('');setTurnReady(false);setPhase('life')}}>← 返回生活相册</button></header>
<div className={`honor-open-book ${turning?`is-turning turn-${turning}`:''}`} aria-busy={!!turning}>
 {[0,1].map(side=>{const underSheet=turnReady&&turnSheet&&side===(turnSheet.direction==='next'?1:0);const visibleSpread=underSheet?turnSheet.target:spread;return <HonorPage key={side} side={side} start={visibleSpread*4+side*2} onTurn={()=>turnBook(side===0?'prev':'next')} onSelect={(src,title)=>{if(!turning)setSelected({src,title})}}/>})}
 {turnSheet&&<>
  <HonorPage side={turnSheet.direction==='next'?0:1} start={turnSheet.target*4+(turnSheet.direction==='next'?0:2)} preview/>
  <CertificateTurn direction={turnSheet.direction} onCovered={()=>setTurnReady(true)} onRustle={()=>sound('page-turn')} onDone={()=>{setSpread(turnSheet.target);setTurning('');setTurnReady(false);setTurnSheet(null)}}/>
 </>}
 {!turning&&spread>0&&<span className="page-cue previous">← 点击左页</span>}
 {!turning&&spread<count-1&&<span className="page-cue next">点击右页 →</span>}
</div>
   <p className="honor-page-status">点击书页翻阅 <span>{spread+1} / {count}</span></p>
  </div>}
  {phase==='flash'&&<div className="archive-white-transition" aria-label="正在翻到荣誉证书"/>}
  <Dialog open={!!selected} onOpenChange={o=>!o&&setSelected(null)}><DialogContent className="archive-lightbox"><DialogTitle>{selected?.title}</DialogTitle>{selected&&<img src={selected.src} alt={selected.title}/>}<button onClick={()=>setSelected(null)}>← 返回{phase==='honors'?'证书册':'生活相册'}</button></DialogContent></Dialog>
 </section>
}
