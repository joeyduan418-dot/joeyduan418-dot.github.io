import sharp from 'sharp';
const root='public/dossier/';
async function crop(file,out,x,y,w,h){const m=await sharp(root+file).metadata();await sharp(root+file).extract({left:Math.round(m.width*x),top:Math.round(m.height*y),width:Math.round(m.width*w),height:Math.round(m.height*h)}).webp({quality:92}).toFile(root+out)}
for(let i=0;i<5;i++)await crop('page-40.webp',`poster-${i}.webp`,.123+i*.1575,.258,.15,.4);
await crop('page-64.webp','ui-home.webp',.037,.11,.456,.465);
await crop('page-64.webp','ui-screen-0.webp',.055,.119,.42,.444);
await crop('page-64.webp','ui-screen-1.webp',.525,.493,.465,.47);
await crop('page-64.webp','ui-screen-2.webp',.091,.686,.132,.115);
await crop('desk.webp','wallpaper.webp',.48,.15,.098,.219);
