"use client";
import {useEffect,useRef} from 'react';

export default function HangingNotebook({opened,onOpen,onReady}:{opened:boolean;onOpen:()=>void;onReady:()=>void}){
 const host=useRef<HTMLDivElement>(null),latest=useRef({opened,onReady});
 const wake=useRef(()=>{});
 useEffect(()=>{latest.current={opened,onReady};if(opened)wake.current()},[opened,onReady]);
 useEffect(()=>{let disposed=false,cleanup=()=>{};
  import('three').then(T=>{
   if(disposed||!host.current)return;
   const el=host.current,scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,30);
   camera.position.set(0,0,9);camera.lookAt(0,0,0);
   const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(pointer: coarse)').matches?1.5:2));el.appendChild(renderer.domElement);
   scene.add(new T.HemisphereLight(0xffffff,0xaca091,2));const light=new T.DirectionalLight(0xfff3df,1.7);light.position.set(-3,4,6);scene.add(light);
   const geometry:InstanceType<typeof T.BufferGeometry>[]=[],materials:InstanceType<typeof T.Material>[]=[];
   const leather=new T.MeshStandardMaterial({color:0x985b37,roughness:.9});materials.push(leather);
   const spineG=new T.CylinderGeometry(.065,.065,3.4,20);geometry.push(spineG);const spine=new T.Mesh(spineG,leather);spine.rotation.z=Math.PI/2;spine.position.set(0,1.1,0);scene.add(spine);
   const tex=new T.TextureLoader().load('/dossier/book-journal-cover.png',()=>{if(!disposed)renderer.render(scene,camera)});tex.colorSpace=T.SRGBColorSpace;tex.center.set(.5,.5);tex.rotation=-Math.PI/2;
   const coverMat=new T.MeshStandardMaterial({map:tex,transparent:true,alphaTest:.03,roughness:.9,side:T.DoubleSide});materials.push(coverMat);
   const coverG=new T.PlaneGeometry(3.48,2.55);coverG.translate(0,-1.275,0);geometry.push(coverG);const cover=new T.Mesh(coverG,coverMat);cover.position.set(0,1.15,.2);scene.add(cover);
   const leaves=Array.from({length:9},(_,i)=>{const g=new T.PlaneGeometry(3.25,2.4,24,40);geometry.push(g);const m=new T.MeshStandardMaterial({color:new T.Color().setRGB(.94-i*.009,.91-i*.009,.84-i*.008),roughness:1,side:T.DoubleSide});materials.push(m);const mesh=new T.Mesh(g,m);scene.add(mesh);return {g,mesh,base:new Float32Array(g.attributes.position.array),i}});
   let start:number|null=null,frame=0,notified=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   const smooth=(x:number)=>{const p=Math.max(0,Math.min(1,x));return p*p*(3-2*p)};
   // Integrate the curl once per row, rather than once per vertex. All columns
   // share the same bend, so this preserves the shape with far less tablet CPU work.
   const draw=(now:number)=>{frame=0;if(latest.current.opened&&start===null)start=now;const t=start===null?0:reduced?5:(now-start)/1000,o=smooth(t/.65);
    cover.rotation.x=-o*2.9;cover.visible=o<.99;
    leaves.forEach(({g,base,i})=>{const p=smooth((t-.18-i*.075)/.8),wave=Math.sin(p*Math.PI),angle=p*(.1+i*.17)+wave*.7,pos=g.attributes.position;
     for(let row=0;row<=40;row++){const u=row/40;let y=1.1,z=.08-i*.012;const ds=2.4*u/18;
      for(let k=0;k<18;k++){const q=u*(k+.5)/18,a=angle+wave*.9*Math.sin(q*Math.PI)+p*.24*q*q;y-=Math.cos(a)*ds;z+=Math.sin(a)*ds}
      for(let column=0;column<=24;column++){const v=row*25+column,x=base[v*3];pos.setXYZ(v,x,y,z+wave*.05*Math.sin(x*2)*u*u)}
     }pos.needsUpdate=true;g.computeVertexNormals();
    });
    renderer.render(scene,camera);
    // The last leaf finishes at 1.58 s; release photographs only after it settles.
    if(t>=1.6&&!notified){notified=true;latest.current.onReady()}
    if(start!==null&&!notified)frame=requestAnimationFrame(draw);
   };
   wake.current=()=>{if(!frame&&!notified)frame=requestAnimationFrame(draw)};
   const resize=()=>{camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight,false);renderer.render(scene,camera)};const ro=new ResizeObserver(resize);ro.observe(el);resize();frame=requestAnimationFrame(draw);
   cleanup=()=>{wake.current=()=>{};cancelAnimationFrame(frame);ro.disconnect();geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());tex.dispose();renderer.dispose();renderer.domElement.remove()};
  });return()=>{disposed=true;cleanup()};
 },[]);
 return <div className={`notebook-stage hanging-notebook ${opened?'book-started':'book-waiting'}`} ref={host} role="button" tabIndex={opened?-1:0} aria-label={opened?'书脊朝上的个人档案':'点击翻开个人档案本'} onClick={()=>!opened&&onOpen()} onKeyDown={e=>{if(!opened&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onOpen()}}}/>;
}
