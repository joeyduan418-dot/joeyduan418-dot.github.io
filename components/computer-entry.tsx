"use client";
import {useEffect,useLayoutEffect,useRef,type ReactNode} from 'react';
import {createPortal} from 'react-dom';

type DeskRect={x:number;y:number;width:number;height:number};
const smooth=(v:number)=>{const p=Math.max(0,Math.min(1,v));return p*p*p*(p*(p*6-15)+10)};

/** The destination stays on the monitor glass until the bezel has passed outside the viewport. */
export default function ComputerEntry({rect,onComplete,children}:{rect:DeskRect;onComplete:()=>void;children:ReactNode}){
 const scene=useRef<HTMLDivElement>(null),image=useRef<HTMLImageElement>(null),screen=useRef<HTMLDivElement>(null),done=useRef(onComplete);
 useEffect(()=>{done.current=onComplete},[onComplete]);
 useLayoutEffect(()=>{
  let active=true,completed=false;
  const animations:Animation[]=[];
  const finish=()=>{if(active&&!completed){completed=true;done.current()}};
  const w=window.innerWidth,h=window.innerHeight;
  const glass={x:rect.x+rect.width*.391,y:rect.y+rect.height*.135,w:rect.width*.196,h:rect.height*.244};
  const center={x:glass.x+glass.w/2,y:glass.y+glass.h/2};
  // Zoom beyond the bezel before fitting the desktop to the viewport; nothing changes pages mid-push.
  const coverZoom=Math.max(w/glass.w,h/glass.h),finalZoom=coverZoom*1.2;
  const duration=1800,sceneElement=scene.current!,imageElement=image.current!,screenElement=screen.current!;
  const source=document.querySelector<HTMLImageElement>('.desk-backdrop');
  if(source)imageElement.style.filter=getComputedStyle(source).filter;
  const atmosphere=document.querySelector<HTMLElement>('.workbench>.desk-atmosphere');
  let snapshot:HTMLElement|null=null;
  if(atmosphere){
   snapshot=atmosphere.cloneNode(true) as HTMLElement;
   Object.assign(snapshot.style,{left:'0px',top:'0px',width:`${rect.width}px`,height:`${rect.height}px`,visibility:'visible'});
   const originals=atmosphere.querySelectorAll('canvas');
   snapshot.querySelectorAll('canvas').forEach((canvas,i)=>{if(originals[i]){canvas.width=originals[i].width;canvas.height=originals[i].height;canvas.getContext('2d')?.drawImage(originals[i],0,0)}});
   const groups=atmosphere.querySelectorAll('.desk-plant-motion g');
   snapshot.querySelectorAll<SVGGElement>('.desk-plant-motion g').forEach((group,i)=>{group.style.animation='none';group.style.transform=getComputedStyle(groups[i]).transform});
   sceneElement.appendChild(snapshot);
  }
  const cameraFrames:Keyframe[]=[],displayFrames:Keyframe[]=[];
  for(let i=0;i<=120;i++){
   const p=i/120,e=smooth(p),zoom=Math.exp(Math.log(finalZoom)*e);
   const cx=center.x+(w/2-center.x)*e,cy=center.y+(h/2-center.y)*e;
   cameraFrames.push({offset:p,transform:`translate3d(${cx+(rect.x-center.x)*zoom}px,${cy+(rect.y-center.y)*zoom}px,0) scale(${zoom})`});
   const gw=glass.w*zoom,gh=glass.h*zoom;
   // Adapt the screen's aspect only after the glass physically covers the whole viewport.
   const fit=smooth((zoom/coverZoom-1)/.2);
   const x=(cx-gw/2)*(1-fit),y=(cy-gh/2)*(1-fit);
   const sw=gw+(w-gw)*fit,sh=gh+(h-gh)*fit;
   // One desktop surface owns its wallpaper, folders and bottom taskbar.
   // Change the layout height to fit the glass, never the X/Y scale of its contents.
   const screenScale=sw/w;
   displayFrames.push({offset:p,transform:`translate3d(${x}px,${y}px,0) scale(${screenScale})`,height:`${sh/screenScale}px`,borderRadius:`${3*(1-fit)}%`,opacity:fit});
  }
  const first=displayFrames[0];screenElement.style.transform=first.transform as string;screenElement.style.height=first.height as string;
  const start=()=>{
   if(!active)return;
   if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return}
   const timing={duration,easing:'linear',fill:'forwards' as const};
   const camera=sceneElement.animate(cameraFrames,timing),display=screenElement.animate(displayFrames,timing);
   animations.push(camera,display);display.finished.then(finish).catch(()=>{});
  };
  void imageElement.decode().then(start,start);
  window.addEventListener('resize',finish,{once:true});
  return()=>{active=false;animations.forEach(animation=>animation.cancel());snapshot?.remove();window.removeEventListener('resize',finish)};
 },[rect]);
 return createPortal(<div className="computer-camera" aria-hidden="true">
  <div ref={scene} className="computer-camera-scene" style={{width:rect.width,height:rect.height,transform:`translate3d(${rect.x}px,${rect.y}px,0)`}}>
   <img ref={image} src="/dossier/desk.webp" alt="" style={{width:rect.width,height:rect.height}}/>
  </div>
  <div ref={screen} className="computer-camera-display computer-screen-surface">{children}</div>
 </div>,document.body);
}
