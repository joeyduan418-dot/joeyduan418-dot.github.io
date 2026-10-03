"use client";
import {useRef,useState,useEffect} from 'react';
import {Dialog,DialogContent,DialogTitle} from './ui/dialog';
import ResumeProp from './resume-prop';
import PersonalArchive from './personal-archive';
import ComputerEntry from './computer-entry';
import BrandPremiere from './brand-premiere';
import BrandPages from './brand-pages';
import IpPremiere from './ip-premiere';
import IpPages from './ip-pages';
import UiExperience from './ui-experience';
import StageTickets from './stage-tickets';
import VideoTelevision from './video-television';
import InteriorExperience from './interior-experience';
import ContactDesk from './contact-desk';
import DeskAtmosphere from './desk-atmosphere';
import useDeskMusic from './use-desk-music';
import {InteractionSoundContext,useInteractionAudio} from './interaction-sound';
import assets from '../data/dossier-assets.json';
const folders=[['brand','品牌设计'],['ip','IP设计'],['ui','UI设计'],['ai','AI视频'],['stage','舞台布景设计'],['interior','室内设计']];
const page=(n:number)=>`/dossier/page-${String(n).padStart(2,'0')}.webp`;
function Pages({start,end}:{start:number;end:number}){return <div className="original-pages">{Array.from({length:end-start+1},(_,i)=>start+i).map(n=><figure key={n} className={n===8||n===9?'research-page':''}><a href={page(n)} target="_blank" rel="noreferrer"><img src={page(n)} loading="lazy" alt={`原作品集第${n}页，点击放大`}/></a>{(n===8||n===9)&&<figcaption>原始调研图表 · 渐显 / 点击放大读取数据</figcaption>}</figure>)}</div>}
export default function WorkingDesk(){
const [view,setView]=useState(''),[detail,setDetail]=useState(false),[moving,setMoving]=useState(false),[computerFocus,setComputerFocus]=useState(false),[mute,setMute]=useState(false),[coffee,setCoffee]=useState(0),[tab,setTab]=useState('生活相册'),[stage,setStage]=useState(-1),[torn,setTorn]=useState<number[]>([]);const timer=useRef<ReturnType<typeof setTimeout>|null>(null);useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
const sound=useInteractionAudio(mute);
const clickSound=()=>sound('mouse-click');
const open=(v:string)=>{if(v==='resume')sound('paper-slide');else if(v==='archive')sound('page-turn');else if(v==='contact')sound('handset');else if(v==='photo')sound('photo');else if(folders.some(([id])=>id===v))sound('mouse-click');else if(!v&&view==='contact')sound('handset');if(timer.current)clearTimeout(timer.current);setComputerFocus(false);setView(v);setDetail(false);setMoving(false);setStage(-1)};
const enter=(ms=700)=>{clickSound();setMoving(true);timer.current=setTimeout(()=>{setDetail(true);setMoving(false)},matchMedia('(prefers-reduced-motion: reduce)').matches?0:ms)};
const project=folders.some(([id])=>id===view);
useDeskMusic(!mute, computerFocus || view==='desktop' || project);
const [discovered,setDiscovered]=useState('');
const [lampOn,setLampOn]=useState(true);
const paperButton=useRef<HTMLButtonElement|null>(null);
const collectResume=()=>{setDiscovered('');open('resume')};
const [cameraRect,setCameraRect]=useState({x:0,y:0,width:0,height:0});
const desktop=()=> <section className="retro-desktop"><div className="desktop-folders">{folders.map(([id,name],i)=><button key={id} onClick={()=>open(id)}><span className="folder-icon"/><strong>{name}</strong><small>0{i+1} / OPEN</small></button>)}</div><div className="desktop-taskbar"><button onClick={()=>open('')}>← 返回工作台</button><span>段静怡的作品桌面</span><button onClick={()=>setMute(!mute)}>{mute?'声音 OFF':'声音 ON'}</button></div></section>;
const focusComputer=()=>{if(computerFocus)return;clickSound();if(matchMedia('(prefers-reduced-motion: reduce)').matches){open('desktop');return}const image=document.querySelector<HTMLImageElement>('.desk-backdrop');if(!image){open('desktop');return}const r=image.getBoundingClientRect();setCameraRect({x:r.x,y:r.y,width:r.width,height:r.height});setComputerFocus(true)};
const discover=(v:string)=>{if(v==='resume'){collectResume();return}if(matchMedia('(hover: none)').matches&&discovered!==v){setDiscovered(v);return}setDiscovered('');if(v==='desktop'){focusComputer();return}open(v)};
return <InteractionSoundContext.Provider value={sound}><main className={`workbench ${lampOn?'':'desk-lamp-off'} ${computerFocus?'computer-zooming':''}`}><img className="desk-backdrop" src="/dossier/desk.webp" alt="雨夜个人工作台"/><DeskAtmosphere lampOn={lampOn} active={!view}/><header className="desk-header"><span>段静怡 <small>DUAN JINGYI</small></span><div className="desk-header-actions"><nav aria-label="工作台导航">{[['desktop','作品'],['resume','简历'],['archive','档案'],['contact','联系']].map(([id,name])=><button key={id} disabled={computerFocus} onClick={()=>id==='resume'?collectResume():id==='desktop'?focusComputer():open(id)}>{name}</button>)}</nav><button className="desk-music-toggle" aria-pressed={!mute} aria-label={mute?'开启音乐':'关闭音乐'} disabled={computerFocus} onClick={()=>setMute(!mute)}><svg viewBox="0 0 28 28" aria-hidden="true"><path d="M4 12v4M9 7v14M14 3v22M19 8v12M24 11v6"/></svg><span>音乐 {mute?'OFF':'ON'}</span></button></div></header><div className="desk-caption"><small>DESIGN &amp; EVERYDAY LIFE</small><h1>一些作品，<br/>一些生活。</h1><p>欢迎来到段静怡的工作台。<br/>从一件物品开始，认识我的设计与日常。</p></div>{[['computer','desktop','电脑 · 六类作品'],['paper','resume','拾取这份简历'],['files','archive','个人档案'],['phone','contact','联系我'],['photo','photo','小狗的照片']].map(([spot,v,label])=><button ref={spot==='paper'?paperButton:undefined} key={spot} aria-label={label} aria-pressed={discovered===v} disabled={computerFocus} className={`desk-hotspot spot-${spot} ${discovered===v?'is-discovered':''}`} onClick={()=>discover(v)}><i className="desk-guide" aria-hidden="true"/><span>{label}{discovered===v?' · 再点一次打开':' ↗'}</span></button>)}<button disabled={computerFocus} className={`desk-hotspot spot-coffee coffee-${coffee}`} aria-label="喝咖啡" onClick={()=>{if(coffee<3){sound('cup');setCoffee(coffee+1)}}}><i className="desk-guide" aria-hidden="true"/><span>{coffee===3?'咖啡喝光啦':'喝一口咖啡'}</span>{coffee>0&&<i className="coffee-surface"/>}</button><button disabled={computerFocus} className="desk-hotspot spot-lamp" aria-label={lampOn?'关闭台灯':'打开台灯'} aria-pressed={lampOn} onClick={()=>{sound('lamp-switch');setLampOn(!lampOn)}}><i className="desk-guide" aria-hidden="true"/><span>{lampOn?'关掉台灯':'打开台灯'} ↗</span></button><footer className="desk-footer"><span className="desk-explore-hint"><svg viewBox="0 0 24 36" aria-hidden="true"><rect x="2" y="2" width="20" height="32" rx="10"/><path d="M12 8v6"/></svg>点击桌上物品，开始探索</span><span className="desk-edition">PORTFOLIO / 2026</span></footer>{computerFocus&&<ComputerEntry rect={cameraRect} onComplete={()=>open('desktop')}>{desktop()}</ComputerEntry>}
<Dialog open={!!view} onOpenChange={o=>!o&&open('')}><DialogContent showCloseButton={false} className={`experience-dialog view-${view}`}><DialogTitle className="sr-only">{folders.find(([id])=>id===view)?.[1]||(view==='contact'?'联系方式':'个人工作台档案')}</DialogTitle><div className="experience-bar"><button onClick={()=>open(project?'desktop':'')}>← {project?'返回作品桌面':'返回工作台'}</button><span>DESIGN DOSSIER / DUAN JINGYI</span><div>{project&&<button onClick={()=>open('')}>工作台</button>}<button onClick={()=>setMute(!mute)}>{mute?'静音':'声音开启'}</button></div></div>
{view==='desktop'&&desktop()}
{view==='resume'&&<section className="resume-inspect">{!detail?<ResumeProp onRead={()=>setDetail(true)}/>:<div className="resume-readable"><h2>段静怡 / 视觉设计师</h2><p>吉首大学 · 视觉传达设计本科<br/>2025.09 — 2027.06</p><p>湖南大众传媒职业技术学院 · 室内艺术设计<br/>2022.09 — 2025.06</p><a href="/assets/resume.png" download="段静怡-简历.png">下载原版简历 ↓</a><button onClick={()=>setDetail(false)}>返回简历册</button><img src="/assets/resume.png" alt="段静怡原版简历"/></div>}</section>}
{view==='archive'&&<PersonalArchive/>}
{view==='contact'&&<ContactDesk/>}
{view==='photo'&&<section className="dog-view"><img src="/dossier/dog.webp" alt="靠在身边的小狗"/><p>今天也要有一点快乐。</p></section>}
{view==='brand'&&<BrandPremiere><BrandPages/><button className="end-return" onClick={()=>open('desktop')}>← 回到作品桌面</button></BrandPremiere>}
{view==='ip'&&(!detail?<IpPremiere onComplete={()=>setDetail(true)}/>:<section className="project-reading ip-reading"><header><h2>湘味五侠</h2><p>IP 形象设计 / 保留原内容与视觉</p></header><IpPages/><button className="end-return" onClick={()=>open('desktop')}>← 回到作品桌面</button></section>)}
{view==='ui'&&<UiExperience onReturn={()=>open('desktop')}/>}
{view==='stage'&&<StageTickets mute={mute}/>}
{view==='ai'&&<VideoTelevision videos={assets.videos} muted={mute}/>}
{view==='interior'&&<InteriorExperience/>}
</DialogContent></Dialog></main></InteractionSoundContext.Provider>}


