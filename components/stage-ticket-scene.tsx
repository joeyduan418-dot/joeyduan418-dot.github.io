"use client";
import {useEffect,useRef,useState} from 'react';
import assets from '../data/dossier-assets.json';

export const ticketColors=['#bec09a','#e7bf7e','#c9b77d','#bdcbc4'];
export const ticketSubtitles=['SILK ROAD DREAM','CHINESE OPERA','RURAL REVIVAL','THE WHITE SNAKE'];
export const ticketArtwork=['/dossier/ticket-user-silk-transparent.webp','/dossier/ticket-user-opera-transparent.webp','/dossier/ticket-user-rural-transparent.webp','/dossier/ticket-user-snake-transparent.webp'];

function ticketTexture(title:string,index:number,art:HTMLImageElement){
 const c=document.createElement('canvas');c.width=1400;c.height=700;
 const g=c.getContext('2d')!;g.fillStyle=ticketColors[index];g.fillRect(0,0,1400,700);
 // Fine deterministic paper grain and faded horizontal press marks.
 let seed=19;for(let i=0;i<18000;i++){seed=(seed*16807)%2147483647;const x=seed%1400;seed=(seed*16807)%2147483647;const y=seed%700;g.fillStyle=i%2?'#4937200b':'#fff8de1b';g.fillRect(x,y,1.5,1.5)}
 for(let y=0;y<700;y+=13){g.fillStyle='#51442d06';g.fillRect(0,y,1400,4)}
 g.strokeStyle='#493e31';g.lineWidth=3;g.strokeRect(43,43,1314,614);g.lineWidth=1;g.strokeRect(53,53,1294,594);
 g.setLineDash([8,8]);g.beginPath();g.moveTo(170,45);g.lineTo(170,655);g.moveTo(1190,45);g.lineTo(1190,655);g.stroke();g.setLineDash([]);
 const artScale=Math.min(960/art.naturalWidth,335/art.naturalHeight);
 const aw=art.naturalWidth*artScale,ah=art.naturalHeight*artScale;
 g.save();g.drawImage(art,200+(960-aw)/2,260+(335-ah)/2,aw,ah);g.restore();
 g.fillStyle='#493e31';g.font='20px Georgia';g.fillText('SCENOGRAPHY / THEATRE COLLECTION',215,105);
 g.font='bold 66px "Microsoft YaHei",serif';g.fillText(title,210,183);
 g.font='25px Georgia';g.fillText(ticketSubtitles[index],215,226);
 g.fillStyle='#a94d3d';g.font='bold 25px monospace';g.fillText(`NO. 00${index+1} / ADMIT ONE`,825,160);
 g.fillStyle='#493e31';g.font='21px "Microsoft YaHei"';g.fillText('舞台布景设计 · 段静怡',850,207);
 g.font='17px monospace';g.fillText('KEEP THIS TICKET / ENTER THE STORY',215,628);
 for(const x of [108,1272]){g.save();g.translate(x,350);g.rotate(Math.PI/2);g.textAlign='center';g.font='bold 32px monospace';g.fillText(x<200?'ADMIT ONE':`A 000${index+1}`,0,0);g.restore()}
 // Transparent punched edges are part of the texture, so the mesh casts a ticket silhouette.
 g.globalCompositeOperation='destination-out';for(let y=18;y<700;y+=30){for(const x of [0,1400]){g.beginPath();g.arc(x,y,8,0,Math.PI*2);g.fill()}}
 for(const x of [0,1400])for(const y of [0,700]){g.beginPath();g.arc(x,y,45,0,Math.PI*2);g.fill()}
 for(const x of [170,1190])for(const y of [0,700]){g.beginPath();g.arc(x,y,18,0,Math.PI*2);g.fill()}
 return c;
}

export type TicketPhase='rolled'|'tearing'|'detached';
export default function StageTicketScene({title,index,phase,onReady,onComplete,onRip}:{title:string;index:number;phase:TicketPhase;onReady:()=>void;onComplete:()=>void;onRip?:()=>void}){
 const host=useRef<HTMLDivElement>(null),state=useRef(phase),current=useRef(index),ready=useRef(onReady),complete=useRef(onComplete);
 const [fallback,setFallback]=useState(false);
 const ripSound=useRef(onRip);
 useEffect(()=>{ripSound.current=onRip},[onRip]);
 useEffect(()=>{state.current=phase;current.current=index;ready.current=onReady;complete.current=onComplete},[phase,index,onReady,onComplete]);
 useEffect(()=>{
  if(fallback&&phase==='tearing'){ripSound.current?.();const timer=setTimeout(()=>complete.current(),400);return()=>clearTimeout(timer)}
 },[fallback,phase]);
 useEffect(()=>{
  let disposed=false,cleanup=()=>{};
  const arts=ticketArtwork.map(src=>{const img=new Image();img.src=src;return img});
  Promise.all([import('three'),Promise.all(arts.map(art=>art.decode()))]).then(([T])=>{
   if(disposed||!host.current)return;
   const el=host.current,scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,60);
   camera.position.set(0,2.8,10);camera.lookAt(0,0,0);
   const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;el.appendChild(renderer.domElement);
   const textures=arts.map((art,i)=>{const texture=new T.CanvasTexture(ticketTexture(assets.stage[i].title,i,art));texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();return texture});
   const texture=textures[current.current];
   const paper=new T.MeshStandardMaterial({map:texture,roughness:.66,side:T.DoubleSide,transparent:true,alphaTest:.15});
   const rollMaterial=new T.MeshStandardMaterial({color:ticketColors[index],roughness:.8,transparent:true});
   const edgeMaterial=new T.MeshStandardMaterial({color:ticketColors[index],roughness:1,side:T.DoubleSide,transparent:true});
   const group=new T.Group();group.rotation.set(-.04,-.3,0);scene.add(group);
   const geometry=new T.PlaneGeometry(4.8,2.4,160,48),sheet=new T.Mesh(geometry,paper);sheet.castShadow=true;sheet.receiveShadow=true;group.add(sheet);
   const positions=geometry.attributes.position,original=Float32Array.from(positions.array);
   const reserveGeometry=geometry.clone(),reservePaper=paper.clone(),reserve=new T.Mesh(reserveGeometry,reservePaper);reserve.castShadow=true;reserve.visible=false;group.add(reserve);
   const reservePositions=reserveGeometry.attributes.position;
   for(let i=0;i<reservePositions.count;i++){const s=original[i*3]+2.4,y=original[i*3+1],angle=(s-2.8)/.86,length=s-2.8;reservePositions.setXYZ(i,s<2.8?-1.1+.86*Math.sin(angle):-1.1+length,y,s<2.8?.86*Math.cos(angle):.86-.1*length*length)}
   reserveGeometry.computeVertexNormals();reserveGeometry.computeBoundingSphere();
   const rollGeometry=new T.CylinderGeometry(.82,.82,2.4,96,1,true),roll=new T.Mesh(rollGeometry,rollMaterial);roll.castShadow=true;group.add(roll);
   const rimGeometry=new T.RingGeometry(.25,.835,96),rims=[new T.Mesh(rimGeometry,edgeMaterial),new T.Mesh(rimGeometry,edgeMaterial)];rims.forEach((r,i)=>{r.rotation.x=-Math.PI/2;r.position.y=i?-1.202:1.202;group.add(r)});
   // Concentric paper layers around a hollow core make the roll visible from above.
   const layerMaterial=new T.LineBasicMaterial({color:'#66533c',transparent:true,opacity:.2});
   const layerGeometry=new T.BufferGeometry();const ringPoints:number[]=[];
   for(let radius=.27;radius<.83;radius+=.026)for(let i=0;i<96;i++){const a=i/96*Math.PI*2,b=(i+1)/96*Math.PI*2;ringPoints.push(Math.cos(a)*radius,1.205,Math.sin(a)*radius,Math.cos(b)*radius,1.205,Math.sin(b)*radius)}
   layerGeometry.setAttribute('position',new T.Float32BufferAttribute(ringPoints,3));const layers=new T.LineSegments(layerGeometry,layerMaterial);group.add(layers);
   const coreGeometry=new T.CylinderGeometry(.25,.25,2.4,48,1,true),coreMaterial=new T.MeshStandardMaterial({color:'#4b3527',side:T.DoubleSide,transparent:true}),core=new T.Mesh(coreGeometry,coreMaterial);group.add(core);
   const light=new T.DirectionalLight('#fff0d3',2.5);light.position.set(-3,6,7);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-7,right:7,top:5,bottom:-5});light.shadow.bias=-.001;scene.add(light);scene.add(new T.AmbientLight('#fff2dc',1.25));
   const floorGeometry=new T.PlaneGeometry(30,30),floorMaterial=new T.ShadowMaterial({opacity:.25}),floor=new T.Mesh(floorGeometry,floorMaterial);floor.rotation.x=-Math.PI/2;floor.position.y=-1.6;floor.receiveShadow=true;scene.add(floor);
   const resize=new ResizeObserver(()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=w/h<1.25?12:9;camera.updateProjectionMatrix()});resize.observe(el);
   let active=current.current,frame=0,tearStart=0,notified=false,ripNotified=false,targetX=-.04,targetY=-.3,down=false,lastX=0,lastY=0;
   const canvas=renderer.domElement;
   canvas.onpointerdown=e=>{if(state.current==='tearing')return;down=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)};
   canvas.onpointermove=e=>{if(!down||state.current==='tearing')return;targetY=Math.max(-.65,Math.min(.65,targetY+(e.clientX-lastX)*.005));targetX=Math.max(-.25,Math.min(.25,targetX+(e.clientY-lastY)*.003));lastX=e.clientX;lastY=e.clientY};
   canvas.onpointerup=canvas.onpointercancel=()=>{down=false};
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   const smooth=(v:number)=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
   const draw=(now:number)=>{
    if(disposed)return;
    if(active!==current.current){active=current.current;tearStart=0;notified=false;ripNotified=false;paper.map=textures[active];paper.needsUpdate=true;rollMaterial.color.set(ticketColors[active]);edgeMaterial.color.set(ticketColors[active]);}
    if(state.current==='tearing'&&!tearStart)tearStart=now;
    const t=state.current==='detached'||(reduced&&tearStart)?3.4:tearStart?(now-tearStart)/1000:0;
    if(tearStart&&t>=1.45&&!ripNotified){ripNotified=true;ripSound.current?.()}
    const pull=smooth(t/1.3),rip=smooth((t-1.45)/.48),settle=smooth((t-1.95)/1.05);
    // Arc-length mapping: the SAME printed paper unwraps from the cylinder into a tangent plane.
    const wrapped=2.8*(1-pull),radius=.86,rollX=-1.1-1.3*pull+1.3*settle;
    const recoil=Math.sin(rip*Math.PI)*.13;
    reserve.visible=active<3&&settle>0;reservePaper.map=textures[Math.min(active+1,3)];reservePaper.opacity=settle;reserve.position.x=rollX+1.1;
    [roll,core,...rims,layers].forEach(o=>{o.position.x=rollX;o.position.z=0;o.visible=active<3||settle<1});
    roll.rotation.y=-2.8*pull/radius;const rollOpacity=active===3?1-settle:1;rollMaterial.opacity=edgeMaterial.opacity=coreMaterial.opacity=rollOpacity;layerMaterial.opacity=.2*rollOpacity;
    if(rip>.5&&active<3){rollMaterial.color.lerp(new T.Color(ticketColors[active+1]),.08);edgeMaterial.color.copy(rollMaterial.color)}
    group.rotation.x+=((tearStart?-.04:targetX)-group.rotation.x)*.08;group.rotation.y+=((tearStart?-.3:targetY)-group.rotation.y)*.08;group.position.x=.45;
    group.position.y=reduced?0:Math.sin(now*.0015)*.02*(1-settle);
    for(let i=0;i<positions.count;i++){
     const s=original[i*3]+2.4,y=original[i*3+1],u=s/4.8;
     let x:number,z:number;
     if(s<wrapped){const angle=(s-wrapped)/radius;x=rollX+radius*Math.sin(angle);z=radius*Math.cos(angle)}
     else{const length=s-wrapped;x=rollX+length;z=radius-.10*(1-pull)*length*length+Math.sin(u*Math.PI)*.24*pull*(1-rip)}
     // The tear travels from the top perforation to the bottom, then the loose sheet recoils.
     const localRip=smooth((rip*1.3-(1.2-y)/2.4)/.3);
     const release=smooth(s/.65)+(1-smooth(s/.65))*localRip;
     x+=rip*.28*release+recoil*u;
     z+=Math.sin(rip*Math.PI)*u*.42;
     if(s<.04)x+=Math.sin(y*81)*.025*localRip;
     const flatX=s-2.4;
     x=x*(1-settle)+flatX*settle;z=z*(1-settle);
     positions.setXYZ(i,x,y-Math.sin(rip*Math.PI)*.20*u*(1-settle),z);
    }
    positions.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();
    sheet.rotation.z=-Math.sin(rip*Math.PI)*.075*(1-settle);sheet.position.y=-settle*3.3;sheet.scale.setScalar(1-settle*.32);paper.opacity=1-smooth((settle-.7)/.3);
    renderer.render(scene,camera);
    if(tearStart&&t>=3.05&&!notified){notified=true;complete.current()}
    frame=requestAnimationFrame(draw);
   };
   frame=requestAnimationFrame(draw);ready.current();
   cleanup=()=>{cancelAnimationFrame(frame);resize.disconnect();textures.forEach(t=>t.dispose());[geometry,reserveGeometry,rollGeometry,rimGeometry,coreGeometry,floorGeometry,layerGeometry].forEach(g=>g.dispose());[paper,reservePaper,rollMaterial,edgeMaterial,coreMaterial,floorMaterial,layerMaterial].forEach(m=>m.dispose());renderer.dispose();canvas.remove()};
  }).catch(()=>{if(!disposed){setFallback(true);ready.current()}});
  return()=>{disposed=true;cleanup()};
 },[]);
 return <div className={`theatre-scene ${fallback?'has-fallback':''}`} ref={host} role="img" aria-label={`${title}${phase==='detached'?'已撕下的票根':'卷状票根'}，可拖动查看`}>{fallback&&<div className="theatre-fallback" style={{background:ticketColors[index]}}><img src={ticketArtwork[index]} alt=""/><strong>{title}</strong><span>ADMIT ONE · 舞台布景设计</span></div>}</div>;
}
