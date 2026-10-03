"use client";

import {useEffect, useRef} from 'react';
import {findPeripheralLights, type PeripheralLight} from './stage-projection-motion';

type Beam = [number, number, number, number, number, number];
type LightCue = {color: string; beams: Beam[]; dust: number};

// Coordinates follow the original fixtures and are relative to each image.
const cues: Record<string, LightCue> = {
 '0-0': {color:'104, 218, 255', beams:[[.405,.355,.34,.79,.085,.032],[.44,.36,.48,.78,.075,.028],[.596,.365,.65,.8,.08,.026],[.644,.382,.72,.76,.07,.03]], dust:34},
 '0-1': {color:'255, 189, 100', beams:[[.327,.625,.25,.45,.04,.025],[.357,.75,.31,.55,.035,.027],[.638,.75,.68,.53,.04,.025],[.663,.61,.71,.44,.04,.024]], dust:28},
 '0-2': {color:'255, 210, 113', beams:[[.427,.20,.39,.77,.055,.027],[.477,.205,.48,.8,.06,.02],[.60,.19,.57,.78,.05,.023],[.65,.165,.69,.76,.055,.03]], dust:34},
 '1-0': {color:'151, 231, 229', beams:[[.477,.46,.45,.72,.045,.018],[.57,.68,.63,.49,.06,.024],[.41,.69,.36,.51,.055,.022]], dust:24},
 '1-1': {color:'255, 108, 91', beams:[[.395,.235,.44,.73,.05,.026],[.49,.24,.5,.76,.05,.022],[.595,.23,.57,.73,.05,.025]], dust:22},
 '1-2': {color:'255, 197, 113', beams:[[.446,.27,.43,.74,.045,.025],[.55,.265,.57,.75,.045,.023]], dust:28},
 '1-3': {color:'255, 199, 115', beams:[[.46,.305,.41,.76,.05,.021],[.56,.3,.60,.75,.05,.023]], dust:30},
 '1-4': {color:'248, 218, 146', beams:[[.476,.258,.43,.765,.055,.022],[.565,.26,.59,.765,.05,.025]], dust:28},
 '1-5': {color:'138, 198, 255', beams:[[.475,.265,.43,.79,.065,.025],[.555,.27,.60,.79,.06,.022]], dust:26},
 '1-6': {color:'154, 236, 201', beams:[[.46,.27,.41,.77,.06,.024],[.54,.26,.59,.77,.06,.023]], dust:24},
 '2-0': {color:'255, 222, 129', beams:[[.40,.40,.36,.78,.06,.024],[.62,.4,.66,.79,.06,.027]], dust:30},
 '2-1': {color:'104, 224, 252', beams:[[.39,.395,.36,.78,.06,.025],[.58,.395,.64,.78,.06,.026]], dust:30},
 '2-2': {color:'137, 218, 255', beams:[[.072,.238,.36,.65,.065,.025],[.922,.238,.69,.65,.065,.026]], dust:42},
 '3-0': {color:'137, 220, 244', beams:[[.465,0,.51,.84,.045,.013]], dust:18},
 '3-1': {color:'122, 209, 244', beams:[[.55,0,.52,.82,.05,.014]], dust:18},
 '3-2': {color:'151, 224, 242', beams:[[.43,0,.51,.84,.05,.014],[.80,0,.66,.69,.045,.013]], dust:20},
 '3-3': {color:'136, 223, 244', beams:[[.43,0,.51,.83,.05,.014],[.80,0,.66,.69,.045,.013]], dust:18},
};

export default function StageLivingPoster({src, alt, paused, onReady}: {
 src: string; alt: string; paused: boolean; onReady?: ()=>void;
}) {
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const timeRef=useRef(0);
 const pausedRef=useRef(paused);
 const syncRef=useRef<(()=>void)|null>(null);
 useEffect(()=>{pausedRef.current=paused;syncRef.current?.()},[paused]);

 useEffect(()=>{
  const canvas=canvasRef.current;
  const context=canvas?.getContext('2d');
  if(!canvas || !context)return;
  const image=new Image();
  const scene=src.match(/stage-(\d+-\d+)\./)?.[1] ?? '0-0';
  const cue=cues[scene];
  const production=Number(scene[0]);
  const variation=Number(scene.split('-')[1]);
  const goldenRural=scene==='2-0';
  let points:PeripheralLight[]=[];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const glow=document.createElement('canvas');
  const glowContext=glow.getContext('2d', {willReadFrequently:true});
  if(!glowContext)return;
  let disposed=false, loaded=false, visible=true, frame=0, previous=0;
  let width=0, height=0, iw=0, ih=0, ox=0, oy=0;
  let seed=src.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const dust=Array.from({length:goldenRural?88:[30,24,64,20][production]+variation},()=>({x:random(), y:random(), speed:random(), radius:random(), phase:random()*Math.PI*2}));

  const resize=()=>{
   const rect=canvas.getBoundingClientRect();
   const dpr=Math.min(devicePixelRatio || 1,1.5);
   width=rect.width; height=rect.height;
   canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr);
   context.setTransform(dpr,0,0,dpr,0,0);
   if(loaded){
    const scale=Math.min(width/image.naturalWidth,height/image.naturalHeight);
    iw=image.naturalWidth*scale; ih=image.naturalHeight*scale;
    ox=(width-iw)/2; oy=(height-ih)/2;
   }
  };

  const draw=(time:number)=>{
   context.clearRect(0,0,width,height);
   context.save(); context.translate(ox,oy);
   context.beginPath(); context.rect(0,0,iw,ih); context.clip();
   context.globalCompositeOperation='screen';

   // Pulse the original peripheral fixtures in a travelling wave.
   points.forEach(p=>{
    // Silk: chase along the rim; opera: mirrored banks; rural: scattered
    // firefly-like responses; White Snake: restrained, slow breathing.
    const pulse=production===0 ? Math.pow((1+Math.sin(time*1.1-p.phase*2+variation*.5))*.5,3)
     : production===1 ? .15+.85*Math.pow((1+Math.sin(time*.85-Math.abs(p.x-.5)*9+variation))*.5,2)
     : production===2 ? .12+.88*Math.pow((1+Math.sin(time*(.65+p.x*.5)+p.y*25+p.x*17))*.5,4)
     : .15+.4*(1+Math.sin(time*.4+p.x*5))*.5;
    const x=p.x*iw,y=p.y*ih,r=Math.max(3,iw*.008);
    context.globalCompositeOperation='source-over';
    const dim=context.createRadialGradient(x,y,0,x,y,r*.45);
    dim.addColorStop(0,`rgba(0,0,0,${(1-pulse)*.65})`);dim.addColorStop(1,'rgba(0,0,0,0)');
    context.fillStyle=dim;context.fillRect(x-r,y-r,r*2,r*2);
    context.globalCompositeOperation='screen';
    const halo=context.createRadialGradient(x,y,0,x,y,r);
    halo.addColorStop(0,`rgba(${p.color},${pulse*.9})`);halo.addColorStop(.22,`rgba(${p.color},${pulse*.5})`);halo.addColorStop(1,`rgba(${p.color},0)`);
    context.fillStyle=halo;context.fillRect(x-r,y-r,r*2,r*2);
   });

   cue.beams.forEach(([x,y,tx,ty,spread,sway],i)=>{
    // Complete a legible sweep within the eight-second scene hold.
    // Keep the fixture fixed; move the destination, not the source image.
    const swing=production===0 ? Math.sin(time*.95+i*.85+variation*.4)
     : production===1 ? (i%2===0?1:-1)*Math.sin(time*.85+variation)
     : production===2 ? Math.sin(time*.78+i*2.1+variation*.6)
     : Math.sin(time*.68+i);
    const travel=production===0 ? Math.max(.105,sway*3.6)
     : production===1 ? Math.max(.08,sway*3.3)
     : production===2 ? Math.max(.09,sway*3.5)
     : Math.max(.045,sway*3);
    const endX=Math.max(.06,Math.min(.94,tx+swing*travel));
    const vx=(endX-x)*iw, vy=(ty-y)*ih;
    const length=Math.hypot(vx,vy);
    context.save(); context.translate(x*iw,y*ih);
    context.rotate(Math.atan2(vy,vx)-Math.PI/2);
    const intensity=production===0 ? .13+.34*(1+Math.sin(time*.6+i))*.5
     : production===1 ? .11+.34*Math.pow((1+Math.sin(time*.65+i*Math.PI))*.5,2)
     : production===2 ? .10+.29*(1+Math.sin(time*.4+i*1.5))*.5
     : .08+.23*(1+Math.sin(time*.3+i))*.5;
    const cone=context.createLinearGradient(0,0,0,length);
    cone.addColorStop(0,`rgba(${cue.color},${intensity*.85})`);
    cone.addColorStop(.38,`rgba(${cue.color},${intensity})`);
    cone.addColorStop(.78,`rgba(${cue.color},${intensity*.48})`);
    cone.addColorStop(1,`rgba(${cue.color},0)`);
    context.fillStyle=cone; context.filter=`blur(${Math.max(1.2,iw*.002)}px)`;
    context.beginPath();context.moveTo(-1,0);context.lineTo(-spread*iw*.43,length);context.quadraticCurveTo(0,length*1.12,spread*iw*.43,length);context.lineTo(1,0);context.closePath();context.fill();
    context.filter='none';context.restore();
   });

   // Four different upward particle choreographies, fading at both ends.
   // All coordinates belong to the contained image, never to the page.
   dust.forEach(p=>{
    const rate=production===0 ? .045+p.speed*.035 : production===1 ? .035+p.speed*.025 : production===2 ? .028+p.speed*.035 : .018+p.speed*.022;
    const life=(p.y+time*rate)%1;
    let x:number,y:number,r:number,color:string;
    if(production===0){
     // Wind-borne flecks rise from the outer Silk Road stage rim.
     x=.12+p.x*.76+life*.055+Math.sin(time*.5+p.phase)*.012;
     y=.87-life*.66;r=.6+p.radius*1.35;
     color=variation===0 ? (p.x>.6?'177, 229, 255':'107, 198, 246') : (p.x>.5?'255, 226, 160':'231, 172, 79');
    }else if(production===1){
     // Two wings of theatrical glints lift beside the central performance.
     const side=p.x<.5?-1:1;
     x=.5+side*(.16+Math.abs(p.x-.5)*.5)+Math.sin(life*3+p.phase)*.013;
     y=.86-life*.6;r=.55+p.radius*1.45;
     color=variation===0?'172, 238, 222':variation===5?'165, 207, 255':variation===6?'166, 241, 199':p.radius>.55?'255, 218, 142':'239, 153, 98';
    }else if(production===2){
     // Soft seed/firefly lights rise organically around the central tree.
     x=.17+p.x*.66+Math.sin(time*.48+p.phase)*(.013+p.radius*.016);
     y=.9-life*.76;r=.85+p.radius*2.2;
     color=variation===0?(p.x>.5?'255, 229, 146':'219, 236, 155'):(p.x>.5?'215, 239, 155':'168, 231, 178');
    }else{
     // Fine silver-blue motes ascend slowly above the water, leaving the
     // actor and narrow central spotlight visually unobstructed.
     x=.26+p.x*.5+Math.sin(time*.23+p.phase)*.008;
     y=.82-life*.52;r=.6+p.radius*1.7;
     color=p.radius>.65?'198, 230, 249':'113, 190, 223';
    }
    const envelope=Math.sin(Math.PI*life);
    const twinkle=production===2 ? .16+.84*Math.pow((1+Math.sin(time*(.8+p.speed*.7)+p.phase))*.5,2) : .7+.3*Math.sin(time*.6+p.phase);
    const alpha=envelope*twinkle*(production===3?.24:.40);
    const radius=Math.max(.35,r*iw/850*.55)*(goldenRural?1.35:1),px=x*iw,py=y*ih;
    const halo=context.createRadialGradient(px,py,0,px,py,radius*2.5);
    halo.addColorStop(0,`rgba(${color},${alpha})`);
    halo.addColorStop(.26,`rgba(${color},${alpha*.55})`);
    halo.addColorStop(1,`rgba(${color},0)`);
    context.fillStyle=halo;context.fillRect(px-radius*2.5,py-radius*2.5,radius*5,radius*5);
    if(production===0 || (production===1 && p.radius>.7)){
     context.fillStyle=`rgba(${color},${alpha*.75})`;
     context.beginPath();context.ellipse(px,py,radius*.36,radius*(production===0?1.8:1.1),.25,0,Math.PI*2);context.fill();
    }
   });
   context.restore();
  };

  const tick=(now:number)=>{
   frame=requestAnimationFrame(tick);
   if(now-previous<1000/30)return;
   const delta=previous ? Math.min((now-previous)/1000,.1) : 0;
   previous=now; timeRef.current+=delta;draw(timeRef.current);
  };
  const sync=()=>{
   cancelAnimationFrame(frame);previous=0;
   if(loaded && !pausedRef.current && !reduced.matches && !document.hidden && visible)frame=requestAnimationFrame(tick);
   if(reduced.matches){context.clearRect(0,0,width,height)}
  };
  syncRef.current=sync;
  const observer=new ResizeObserver(()=>{resize();if(loaded && !reduced.matches)draw(timeRef.current)});
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()});
  observer.observe(canvas);intersection.observe(canvas);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  image.onload=()=>{
   if(disposed)return;
   loaded=true;
   glow.width=480;glow.height=Math.round(480*image.naturalHeight/image.naturalWidth);
   glowContext.drawImage(image,0,0,glow.width,glow.height);
   const pixels=glowContext.getImageData(0,0,glow.width,glow.height);
   points=findPeripheralLights(pixels);
   resize();if(!reduced.matches)draw(timeRef.current);sync();
  };
  image.src=src;
  return()=>{
   disposed=true;image.onload=null;cancelAnimationFrame(frame);
   syncRef.current=null;
   observer.disconnect();intersection.disconnect();
   document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);
  };
 },[src]);

 return <div className="stage-living-poster">
  {/* Preserve the full-resolution scenery; animate only light and atmosphere. */}
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img src={src} alt={alt} draggable={false} onLoad={onReady}/>
  <canvas ref={canvasRef} className="stage-poster-light" aria-hidden="true"/>
 </div>;
}
