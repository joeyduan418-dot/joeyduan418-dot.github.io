export type PeripheralLight={x:number;y:number;color:string;phase:number};

// Find isolated bright cores in the supplied image, rather than placing an
// unrelated particle grid over the artwork. Broad surfaces are rejected.
export function findPeripheralLights(pixels:ImageData):PeripheralLight[]{
 const {width,height,data}=pixels;
 const brightness=(x:number,y:number)=>{const i=(y*width+x)*4;return Math.max(data[i],data[i+1],data[i+2])};
 const candidates:{x:number;y:number;score:number;color:string}[]=[];
 for(let y=5;y<height-5;y+=2)for(let x=5;x<width-5;x+=2){
  const nx=x/width,ny=y/height;
  if(nx>.29 && nx<.71 && ny>.22 && ny<.84)continue;
  const b=brightness(x,y);
  if(b<125)continue;
  let background=0;
  for(const [dx,dy] of [[-4,0],[4,0],[0,-4],[0,4],[-3,-3],[3,-3],[-3,3],[3,3]])background+=brightness(x+dx,y+dy)/8;
  if(b-background<48)continue;
  const i=(y*width+x)*4;
  candidates.push({x:nx,y:ny,score:b-background,color:`${data[i]}, ${data[i+1]}, ${data[i+2]}`});
 }
 const chosen:PeripheralLight[]=[];
 for(const p of candidates.sort((a,b)=>b.score-a.score)){
  if(chosen.some(q=>Math.hypot((p.x-q.x)*width,(p.y-q.y)*height)<7))continue;
  chosen.push({x:p.x,y:p.y,color:p.color,phase:Math.atan2(p.y-.55,(p.x-.5)*1.6)});
  if(chosen.length>=90)break;
 }
 return chosen;
}
