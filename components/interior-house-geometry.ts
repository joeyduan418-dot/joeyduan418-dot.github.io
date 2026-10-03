import * as T from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Single-storey footprint traced from the supplied 4264 × 2647 floor plan.
// Normalized plan coordinates keep partitions and furniture in one system.
export function createInteriorHouse(){
 const house=new T.Group(),geometries:T.BufferGeometry[]=[],materials=new Map<string,T.MeshStandardMaterial>();
 const X=(x:number)=>(x-50)*.20,Z=(y:number)=>(y-50)*.1242;
 const mat=(c:string)=>{let m=materials.get(c);if(!m){m=new T.MeshStandardMaterial({color:c,roughness:.78});materials.set(c,m)}return m};
 const add=(g:T.BufferGeometry,c:string,x:number,h:number,y:number)=>{geometries.push(g);const m=new T.Mesh(g,mat(c));m.position.set(X(x),h,Z(y));m.castShadow=true;m.receiveShadow=true;house.add(m);return m};
 const box=(x:number,y:number,w:number,d:number,h:number,c:string,base=0,r=.035)=>add(new RoundedBoxGeometry(w*.2,h,d*.1242,2,Math.min(r,w*.07,d*.04,h*.4)),c,x,base+h/2,y);
 const ball=(x:number,y:number,h:number,r:number,c:string)=>add(new T.SphereGeometry(r,12,8),c,x,h,y);
 const cyl=(x:number,y:number,h:number,r:number,d:number,c:string)=>add(new T.CylinderGeometry(r,r,d,24),c,x,h,y);
 const glow=(m:T.Mesh)=>{const a=(m.material as T.MeshStandardMaterial).clone();a.emissive.set('#e7bf88');a.emissiveIntensity=.5;m.material=a};
 const wall=(x1:number,y1:number,x2:number,y2:number,h=1.18)=>{
  const a=new T.Vector3(X(x1),0,Z(y1)),b=new T.Vector3(X(x2),0,Z(y2));
  const g=new RoundedBoxGeometry(a.distanceTo(b),h,.085,2,.015);geometries.push(g);const m=new T.Mesh(g,mat('#ded8ce'));m.position.copy(a).add(b).multiplyScalar(.5);m.position.y=h/2;m.rotation.y=-Math.atan2(b.z-a.z,b.x-a.x);m.castShadow=true;m.receiveShadow=true;house.add(m);
 };
 const plant=(x:number,y:number,base=0,s=1)=>{cyl(x,y,base+.08*s,.08*s,.16*s,'#ac9577');for(let i=0;i<6;i++){const leaf=ball(x+Math.cos(i*2.4)*.4*s,y+Math.sin(i*2.4)*.6*s,base+(.22+i*.03)*s,.07*s,i%2?'#6e8357':'#98a777');leaf.scale.set(.6,1.4,.7)}};
 const outline=[[18.2,3.9],[55.3,3.9],[55.3,2.4],[64.8,2.4],[64.8,3.9],[98.6,3.9],[98.6,86.8],[62.8,86.8],[62.8,98],[34.8,98],[34.8,82.2],[18.3,82.2],[18.3,88],[6.8,88],[6.8,82.2],[1.3,82.2],[1.3,28.7],[18.2,28.7]];
 const shape=new T.Shape();outline.forEach(([x,y],i)=>{if(i===0)shape.moveTo(X(x),-Z(y));else shape.lineTo(X(x),-Z(y))});shape.closePath();
 const floorGeo=new T.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1});geometries.push(floorGeo);const slab=new T.Mesh(floorGeo,mat('#96938b'));slab.rotation.x=-Math.PI/2;slab.position.y=-.2;slab.receiveShadow=true;house.add(slab);
 // Main grey stone floor with bedroom timber inserts.
 const bedrooms=[[1.5,51,16.7,36.7],[65.2,8.8,17.7,29.8],[60.5,48.8,17.4,38],[78.5,48.8,20,38],[83.5,22.6,15,26]];
 for(const [x,y,w,d] of bedrooms){box(x+w/2,y+d/2,w,d,.018,'#ae9680');for(let i=0;i<w;i+=.85)box(x+i,y+d/2,.027,d,.005,'#99836d',.018,.001)}
 for(const [x1,y1,x2,y2] of [[18.2,28.7,18.2,3.9],[18.2,3.9,34.5,3.9],[35.6,3.9,54.8,3.9],[55.5,2.4,64.6,2.4],[65.4,3.9,82.6,3.9],[84.1,3.9,98.6,3.9],[98.6,3.9,98.6,86.8],[98.6,86.8,78.2,86.8],[77.6,86.8,62.8,86.8],[62.8,86.8,62.8,98],[62.8,98,34.8,98],[34.8,98,34.8,82.2],[18.3,88,6.8,88],[6.8,88,6.8,82.2],[6.8,82.2,1.3,82.2],[1.3,82.2,1.3,28.7],[1.3,28.7,18.2,28.7]] as const)wall(x1,y1,x2,y2,.78);
 // Interior partitions retain real door gaps and the cross-apartment hallway.
 for(const a of [[18.2,4,18.2,38],[18.2,38,34.6,38],[35.2,4,35.2,15],[35.2,25,35.2,38],[55.3,4,55.3,37.5],[64.8,3,64.8,37.5],[55.3,37.5,60.6,37.5],[62.5,37.5,64.8,37.5],[65.2,38.5,68.6,38.5],[71.7,38.5,83.1,38.5],[83.2,9.2,83.2,49],[84,22,88,22],[91,22,98.5,22],[1.4,49.4,12.5,49.4],[15.5,49.4,18.5,49.4],[18.5,49.4,18.5,82.2],[60.1,48.5,65,48.5],[68,48.5,77.8,48.5],[78.1,48.5,81.5,48.5],[84.5,48.5,98.5,48.5],[60.1,48.5,60.1,84],[77.9,48.5,77.9,86.7]] as const)wall(a[0],a[1],a[2],a[3]);
 // Window planes and thin charcoal frames sit in the low cutaway envelope.
 const glass=new T.MeshPhysicalMaterial({color:'#c0d6dc',transparent:true,opacity:.35,roughness:.12,depthWrite:false,side:T.DoubleSide});
 for(const [x,y,w] of [[25,4,11],[48,4,10],[74,4,10],[90,4,5],[9.5,28.6,16],[12.5,88,11],[44,82.2,12],[71,86.8,9],[88,86.8,11],[48.7,98,27]] as const){const pane=box(x,y,w,.25,.6,'#c2d1d4',.12);pane.material=glass;box(x,y,w,.28,.035,'#666961',.12);box(x,y,w,.28,.035,'#666961',.7);}
 // Beds follow plan: headboard at the left in guest, right in other rooms.
 const bed=(x:number,y:number,w:number,d:number,c:string,headLeft=false)=>{
  box(x,y,w,d,.23,'#a89784');box(x,y,w+.15,d+.15,.16,'#e9e3d8',.23,.065);
  box(x+(headLeft?-1:1)*w*.44,y,.65,d+.5,.57,'#d2c6b6',.0,.04);
  box(x+(headLeft?-1:1)*w*.26,y,w*.26,d*.8,.08,'#eee9df',.40,.03);
  box(x+(headLeft?1:-1)*w*.10,y,w*.55,d+.12,.08,c,.40,.03);
  for(let i=0;i<4;i++)box(x+(headLeft?1:-1)*w*.1,y-d*.42+i*d*.27,w*.55,.04,.008,c==='#97a8b1'?'#8499a3':'#b6aa99',.48,.001);
 };
 bed(7.5,69,10.3,13,'#c3bbb0',true);bed(75.9,17.8,10.6,16.1,'#d6c6bd');bed(71.6,62.6,8.0,17.5,'#97a8b1');bed(91.8,66.9,10.5,16.4,'#d1b9b4');
 // Wardrobes in each actual location, including the master dressing passage.
 const wardrobe=(x:number,y:number,w:number,d:number)=>{box(x,y,w,d,.95,'#d5cebd');const doors=Math.max(2,Math.floor(w>d?w/2.5:d/3));for(let i=0;i<doors;i++){if(w>d)box(x-w/2+(i+.5)*w/doors,y+d/2+.05,.024,.045,.72,'#b3aa99',.1,.001);else box(x+w/2+.05,y-d/2+(i+.5)*d/doors,.045,.025,.72,'#b3aa99',.1,.001)}};
 wardrobe(6.8,53.2,10.5,5);wardrobe(20.7,65,2.7,30);wardrobe(76.4,34.9,10.5,4.9);wardrobe(85.4,34,2.8,25);wardrobe(96.8,29,3.1,13);wardrobe(77,62.5,1.5,17);wardrobe(57.5,64,2.4,33);
 for(const [x,y] of [[2.7,60],[2.7,77.8],[80.5,28.3],[96.5,56.4],[96.5,79]] as const){box(x,y,2.7,3.6,.3,'#c3b39d');const lamp=ball(x,y,.56,.09,'#e5d0a6');glow(lamp)}
 // Children's desks at their windows, master dressing seat and bench.
 for(const [x,y,w,d] of [[70.5,84,8.5,3.4],[73.3,6.8,13,3.7],[96.5,41.6,3.5,7]] as const){box(x,y,w,d,.065,'#d9d0c1',.52);for(const dx of [-1,1])box(x+dx*w*.38,y,.22,d*.65,.52,'#8f8576');}
 // Bathroom fittings: guest bath above the hallway and en-suite upper right.
 const bath=(x:number,y:number,w:number,d:number)=>{
  box(x,y,w,d,.019,'#e0dfd5');box(x,y-d*.36,w*.93,d*.26,.36,'#d8d7ce');
  const shower=box(x-w*.42,y,w*.04,d*.75,.9,'#e0d8cb');shower.material=glass;
  box(x+w*.28,y+d*.30,w*.25,d*.21,.45,'#c8c3b4');box(x+w*.28,y+d*.30,w*.26,d*.22,.04,'#efede3',.45);cyl(x+w*.28,y+d*.30,.53,.12,.09,'#eae8de');
  const wc=ball(x+w*.28,y,.22,.15,'#eae8de');wc.scale.set(.8,1,1.3);box(x+w*.28,y-.85,1.25,.6,.40,'#eae8de');
 };
 bath(60,20.1,8.8,34);bath(91.2,12.7,14.5,17);
 // L-shaped kitchen from the drawing, grey stone and beige cabinetry.
 box(21.1,24.4,3.4,22,.65,'#c4b9a6');box(27.1,34.8,15.8,3.8,.65,'#c4b9a6');box(21.1,24.4,3.55,22.2,.05,'#e3ddd1',.65);box(27.1,34.8,16,3.95,.05,'#e3ddd1',.65);
 for(const y of [20.3,24.5])box(21, y,2.2,3.2,.025,'#7c8580',.71,.02);
 for(const x of [26.5,28.1]){const burner=add(new T.TorusGeometry(.12,.018,6,18),'#3e433f',x,.73,35);burner.rotation.x=Math.PI/2;}
 box(21.1,8.3,3.4,7.6,1.1,'#cecbc0');box(21.1,8.3,3.45,7.6,.035,'#b6b6a9',1.1);plant(22,30,.72,.6);
 // Dining area: table location from plan, round design from rendering room-8.
 cyl(44,23,.67,.77,.09,'#e7e0d4');cyl(44,23,.34,.22,.62,'#c5b8a4');
 const chair=(x:number,y:number,angle:number)=>{cyl(x,y,.34,.18,.10,'#d4cabc');const b=box(x,y,1.9,.40,.31,'#d4cabc',.35,.025);b.rotation.y=angle;for(const dx of [-.55,.55])box(x+dx,y,.11,1.5,.31,'#7e7568',0,.006)};
 for(const [x,y,a] of [[39,19,0],[39,26,0],[49,19,0],[49,26,0],[44,32,Math.PI/2],[44,14,Math.PI/2]] as const)chair(x,y,a);
 const pendant=add(new T.TorusGeometry(.52,.024,6,40),'#c5ac7b',44,1.63,23);pendant.rotation.x=Math.PI/2;glow(pendant);box(44,23,.08,.08,.20,'#b9a06e',1.66,.006);plant(44,23,.73,.6);wardrobe(53.2,21,1.8,31);
 // Living room: left-facing L sofa and nested circular coffee tables.
 box(41.7,64.6,18.3,32.5,.020,'#d1cabb');box(35.2,61.8,6.2,23.7,.26,'#e4e0d7');box(33.1,61.8,1.4,23.9,.49,'#dbd6ca');box(39,78,10.7,5,.26,'#e4e0d7');
 for(let i=0;i<4;i++){box(35.3,53.2+i*5.5,4.5,5.0,.08,'#eee8dd',.26);const p=box(34.5,53.2+i*5.5,1.35,3.1,.15,i%2?'#a6a8a0':'#c2b7a5',.42,.04);p.rotation.y=.10;}
 cyl(45.7,62,.36,.50,.10,'#9d9587');cyl(44.5,59.8,.30,.36,.07,'#c8bbab');cyl(45.7,62,.18,.19,.28,'#817c73');plant(45.7,62,.42,.6);
 // Long TV / fireplace on the left of the living area, facing the sofa.
 box(21,65.4,2.3,28.6,.83,'#b8a993');box(22.3,66,.18,13,.52,'#303739',.23);box(22.4,66,.16,14,.10,'#68574b',.12);for(let i=0;i<11;i++)glow(ball(22.6,60+i*.95,.19,.03,'#ffc47a'));
 // Entry endpoint below the living room; plants echo the original entry view.
 box(59,87,6.3,4.8,.66,'#c8bcaa');box(8,46,8.8,3.4,.68,'#cabfae');plant(10,42,0,1.3);plant(51,77,0,1.1);plant(58.5,88,.68,.7);
 return {house,dispose:()=>{geometries.forEach(g=>g.dispose());const all=new Set<T.Material>(materials.values());house.traverse(o=>{if(o instanceof T.Mesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>all.add(m))});all.add(glass);all.forEach(m=>m.dispose())}};
}
