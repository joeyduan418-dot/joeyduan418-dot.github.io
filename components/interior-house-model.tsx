"use client";
import {useEffect,useRef} from 'react';
import type * as Three from 'three';

export default function InteriorHouseModel({onReady,onError}:{onReady:()=>void;onError:()=>void}){
 const host=useRef<HTMLDivElement>(null);
 const callbacks=useRef({onReady,onError});
 useEffect(()=>{callbacks.current={onReady,onError}},[onReady,onError]);
 useEffect(()=>{
  let cancelled=false,cleanup=()=>{};
  void Promise.all([import('three'),import('./interior-house-geometry')]).then(([T,{createInteriorHouse}])=>{
   if(cancelled||!host.current)return;
   const el=host.current;
   const renderer=new T.WebGLRenderer({alpha:true,antialias:true});
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0,0);
   renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
   renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
   el.appendChild(renderer.domElement);
   const scene=new T.Scene(),model=createInteriorHouse(),house=model.house;scene.add(house);
   const camera=new T.OrthographicCamera(-5.5,5.5,5.5,-5.5,.1,60);camera.position.set(12,20,23);camera.lookAt(0,.2,0);
   scene.add(new T.HemisphereLight(0xfff5e2,0xb6ac9c,2.1));
   const sun=new T.DirectionalLight(0xffedcf,3);sun.position.set(-8,18,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-16;sun.shadow.camera.right=16;sun.shadow.camera.top=16;sun.shadow.camera.bottom=-16;sun.shadow.normalBias=.035;scene.add(sun);
   const fill=new T.DirectionalLight(0xd7e6ff,1.8);fill.position.set(6,5,-5);scene.add(fill);
   const ground=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.13}));ground.rotation.x=-Math.PI/2;ground.position.y=-.2;ground.receiveShadow=true;scene.add(ground);
   house.rotation.y=-.25;
   let frame=0,previous=0,time=0,down=false,lastX=0,manual=0;
   const reduced=matchMedia('(prefers-reduced-motion: reduce)');
   const downFn=(e:PointerEvent)=>{down=true;lastX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId)};
   const moveFn=(e:PointerEvent)=>{if(down){manual+=(e.clientX-lastX)*.009;lastX=e.clientX}};
   const upFn=()=>{down=false};
   renderer.domElement.addEventListener('pointerdown',downFn);renderer.domElement.addEventListener('pointermove',moveFn);renderer.domElement.addEventListener('pointerup',upFn);renderer.domElement.addEventListener('pointercancel',upFn);
   const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);const aspect=w/h;const extent=Math.max(8.7,12.0/aspect);camera.left=-extent*aspect;camera.right=extent*aspect;camera.top=extent;camera.bottom=-extent;camera.updateProjectionMatrix()};
   const observer=new ResizeObserver(resize);observer.observe(el);resize();
   let notified=false;
   const draw=(now:number)=>{const delta=previous?Math.min((now-previous)/1000,.05):0;previous=now;if(!document.hidden&&!down&&!reduced.matches)time+=delta;house.rotation.y=-.2+Math.sin(time*.75)*.62+manual;house.position.y=reduced.matches?0:Math.sin(time*1.7)*.055;renderer.render(scene,camera);if(!notified){notified=true;callbacks.current.onReady()}frame=requestAnimationFrame(draw)};
   frame=requestAnimationFrame(draw);
   cleanup=()=>{cancelAnimationFrame(frame);observer.disconnect();renderer.domElement.removeEventListener('pointerdown',downFn);renderer.domElement.removeEventListener('pointermove',moveFn);renderer.domElement.removeEventListener('pointerup',upFn);renderer.domElement.removeEventListener('pointercancel',upFn);model.dispose();ground.geometry.dispose();(ground.material as Three.Material).dispose();renderer.dispose();renderer.domElement.remove()};
  }).catch(()=>{if(!cancelled)callbacks.current.onError()});
  return()=>{cancelled=true;cleanup()};
 },[]);
 return <div ref={host} className="home-model-3d" role="img" aria-label="可拖动旋转的大平层住宅三维模型"/>;
}
