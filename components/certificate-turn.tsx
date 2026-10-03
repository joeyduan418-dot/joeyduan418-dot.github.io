"use client";
import {useEffect,useRef} from 'react';

/** Capture the existing paper layout so the moving sheet never changes its artwork. */
async function paintPage(page:HTMLElement){
 const rect=page.getBoundingClientRect(),scale=Math.min(2,1800/rect.width);
 const canvas=document.createElement('canvas');canvas.width=Math.round(rect.width*scale);canvas.height=Math.round(rect.height*scale);
 const ctx=canvas.getContext('2d')!;ctx.scale(scale,scale);
 ctx.fillStyle='#fffefa';ctx.fillRect(0,0,rect.width,rect.height);
 ctx.strokeStyle='rgba(169,191,206,.13)';ctx.lineWidth=1;
 for(let x=0;x<rect.width;x+=24){ctx.beginPath();ctx.moveTo(x+.5,0);ctx.lineTo(x+.5,rect.height);ctx.stroke()}
 for(let y=0;y<rect.height;y+=24){ctx.beginPath();ctx.moveTo(0,y+.5);ctx.lineTo(rect.width,y+.5);ctx.stroke()}
 const gutter=ctx.createLinearGradient(0,0,rect.width,0);
 const left=page.classList.contains('page-0');gutter.addColorStop(0,left?'rgba(120,110,102,0)':'rgba(120,110,102,.12)');gutter.addColorStop(.07,'rgba(120,110,102,0)');gutter.addColorStop(.93,'rgba(120,110,102,0)');gutter.addColorStop(1,left?'rgba(120,110,102,.12)':'rgba(120,110,102,0)');ctx.fillStyle=gutter;ctx.fillRect(0,0,rect.width,rect.height);
 await Promise.all(Array.from(page.querySelectorAll('img')).map(async img=>{try{await img.decode()}catch{}}));
 for(const img of page.querySelectorAll('img')){
  if(!img.naturalWidth)continue;
  const r=img.getBoundingClientRect(),fit=Math.min(img.clientWidth/img.naturalWidth,img.clientHeight/img.naturalHeight),w=img.naturalWidth*fit,h=img.naturalHeight*fit;
  const transform=getComputedStyle(img.closest('button')!).transform;
  const angle=transform==='none'?0:Math.atan2(new DOMMatrixReadOnly(transform).b,new DOMMatrixReadOnly(transform).a);
  ctx.save();ctx.translate(r.left-rect.left+r.width/2,r.top-rect.top+r.height/2);ctx.rotate(angle);ctx.shadowColor='rgba(89,69,43,.18)';ctx.shadowBlur=7;ctx.shadowOffsetY=5;ctx.drawImage(img,-w/2,-h/2,w,h);ctx.restore();
 }
 for(const el of page.querySelectorAll<HTMLElement>('.honor-entry small,.honor-entry h3,.honor-entry p,.honor-entry button span')){
  const r=el.getBoundingClientRect(),style=getComputedStyle(el),text=el.textContent||'';
  ctx.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;ctx.fillStyle=style.color;ctx.textBaseline='top';
  const lineHeight=parseFloat(style.lineHeight)||parseFloat(style.fontSize)*1.3;
  let line='',y=r.top-rect.top;
  const paint=(value:string)=>{const x=r.left-rect.left+(style.textAlign==='center'?(r.width-ctx.measureText(value).width)/2:0);ctx.fillText(value,x,y);y+=lineHeight};
  for(const char of text){if(line&&ctx.measureText(line+char).width>r.width){paint(line);line=char}else line+=char}if(line)paint(line);
 }
 return canvas;
}

export default function CertificateTurn({direction,onCovered,onDone,onRustle}:{direction:'next'|'prev';onCovered:()=>void;onDone:()=>void;onRustle?:()=>void}){
 const host=useRef<HTMLDivElement>(null),callbacks=useRef({onCovered,onDone,onRustle});
 useEffect(()=>{callbacks.current={onCovered,onDone,onRustle}},[onCovered,onDone,onRustle]);
 useEffect(()=>{
  let cancelled=false,cleanup=()=>{};
  const fallback=()=>{if(!cancelled)callbacks.current.onDone()};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){const id=requestAnimationFrame(fallback);return()=>{cancelled=true;cancelAnimationFrame(id)}}
  import('three').then(async T=>{
   const el=host.current,book=el?.parentElement;
   const front=book?.querySelector<HTMLElement>(`.page-${direction==='next'?1:0}:not(.honor-turn-preview)`),back=book?.querySelector<HTMLElement>('.honor-turn-preview');
   if(!el||!front||!back){fallback();return}
   const paintings=await Promise.all([paintPage(front),paintPage(back)]);
   if(cancelled)return;
   const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,.1,20);camera.position.z=5;
   const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;el.appendChild(renderer.domElement);
   const textures=paintings.map(p=>{const t=new T.CanvasTexture(p);t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t});
   const isPrevious=direction==='prev',sign=isPrevious?-1:1;
   // Mesh winding reverses for a page picked up from the left half of the book.
   textures[0].repeat.x=isPrevious?-1:1;textures[0].offset.x=isPrevious?1:0;
   textures[1].repeat.x=isPrevious?1:-1;textures[1].offset.x=isPrevious?0:1;
   const paperHeight=2*el.clientHeight/el.clientWidth;
   const geometry=new T.PlaneGeometry(1,paperHeight,80,24),base=new Float32Array(geometry.attributes.position.array);
   if(geometry.attributes.position instanceof T.BufferAttribute)geometry.attributes.position.setUsage(T.DynamicDrawUsage);
   const materials=[new T.MeshStandardMaterial({map:textures[0],side:isPrevious?T.BackSide:T.FrontSide,roughness:.96}),new T.MeshStandardMaterial({map:textures[1],side:isPrevious?T.FrontSide:T.BackSide,roughness:.96})];
   const face=new T.Mesh(geometry,materials[0]),reverse=new T.Mesh(geometry,materials[1]);face.castShadow=true;scene.add(face,reverse);
   scene.add(new T.HemisphereLight(0xfffdf6,0xc2b9ad,2.1));
   const light=new T.DirectionalLight(0xfffaf0,1.5);light.position.set(-sign*.8,1.8,5);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.camera.left=-2;light.shadow.camera.right=2;light.shadow.camera.top=2;light.shadow.camera.bottom=-2;light.shadow.camera.near=.1;light.shadow.camera.far=10;light.shadow.normalBias=.012;light.shadow.bias=-.0001;light.shadow.radius=4;scene.add(light);
   const shadowGeometry=new T.PlaneGeometry(2,paperHeight),shadowMaterial=new T.ShadowMaterial({color:0x66584b,opacity:.24}),shadow=new T.Mesh(shadowGeometry,shadowMaterial);shadow.position.z=-.018;shadow.receiveShadow=true;scene.add(shadow);
   let frame=0,start=0,currentHeight=paperHeight,rustled=false;
   const resize=()=>{currentHeight=2*el.clientHeight/el.clientWidth;camera.top=currentHeight/2;camera.bottom=-currentHeight/2;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight,false);shadow.scale.y=currentHeight/paperHeight};
   const ro=new ResizeObserver(resize);ro.observe(el);resize();
   cleanup=()=>{cancelAnimationFrame(frame);ro.disconnect();geometry.dispose();shadowGeometry.dispose();shadowMaterial.dispose();materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove()};
   const draw=(now:number)=>{
    if(cancelled)return;
    if(!start)start=now;
    const p=Math.min(1,(now-start)/1480),e=p*p*p*(p*(p*6-15)+10),lift=Math.sin(Math.PI*e),positions=geometry.attributes.position;
    if(p>=.32&&!rustled){rustled=true;callbacks.current.onRustle?.()}
    for(let v=0;v<positions.count;v++){
     const u=base[v*3]+.5,vertical=base[v*3+1]/paperHeight;
     let x=0,z=0;
     // Integrate an inextensible sheet: the spine leads, the outer corner follows.
     for(let k=0;k<28;k++){
      const q=u*(k+.5)/28;
      const bend=lift*(.78*(1-2*q)+.24*q*q*vertical);
      const angle=Math.max(0,Math.min(Math.PI,e*Math.PI+bend));
      x+=Math.cos(angle)*u/28;z+=Math.sin(angle)*u/28;
     }
     const settle=p>.86?Math.sin((p-.86)/.14*Math.PI)*.009*u:0;
     positions.setXYZ(v,sign*x,vertical*currentHeight,z+settle);
    }
    positions.needsUpdate=true;geometry.computeVertexNormals();renderer.render(scene,camera);
    // Only reveal the underlying destination page after the first matching frame is painted.
    if(p===0)callbacks.current.onCovered();
    if(p<1)frame=requestAnimationFrame(draw);else callbacks.current.onDone();
   };
   frame=requestAnimationFrame(draw);
  }).catch(fallback);
  return()=>{cancelled=true;cleanup()};
 },[direction]);
 return <div ref={host} className="certificate-curl" aria-hidden="true"/>;
}
