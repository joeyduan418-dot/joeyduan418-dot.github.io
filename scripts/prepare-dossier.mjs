import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root=path.resolve('..');
const out=path.resolve('public/dossier');
await fs.mkdir(out,{recursive:true});
const image=async(source,name,width=2400)=>sharp(source).resize({width,withoutEnlargement:true}).webp({quality:86}).toFile(path.join(out,name+'.webp'));
await image('C:/Users/29051/AppData/Local/Temp/codex-clipboard-45a703ad-8cf3-4e1c-a0d0-b98ab41f6bd8.png','desk',2560);
await image('C:/Users/29051/AppData/Local/Temp/codex-clipboard-c38f151e-afcf-4565-bc19-c23322f01f77.png','dog',1000);
await image('H:/作品集/正式作品集/专属字/字体暖星@2x.png','warm-lettering');
await image('H:/作品集/正式作品集/专属字/字体资源 1@2x.png','brand-lettering');
const pages=(await fs.readdir(path.join(root,'作品集图片'))).filter(f=>f.endsWith('.png')).sort();
for(let i=0;i<pages.length;i++) await image(path.join(root,'作品集图片',pages[i]),'page-'+String(i+1).padStart(2,'0'));
const thumbs=await Promise.all(pages.map(async(f,i)=>({input:await sharp(path.join(root,'作品集图片',f)).resize(280,160,{fit:'contain',background:'#ddd'}).extend({bottom:28,background:'#fff'}).composite([{input:Buffer.from(`<svg width="280" height="28"><text x="10" y="20" font-size="20">${i+1}</text></svg>`),top:160,left:0}]).png().toBuffer(),left:(i%5)*280,top:Math.floor(i/5)*188})));
await sharp({create:{width:1400,height:Math.ceil(pages.length/5)*188,channels:3,background:'#eee'}}).composite(thumbs).png().toFile(path.resolve('../portfolio-contact-sheet.png'));
const interiors=(await fs.readdir(path.join(root,'室内设计'))).filter(f=>/\.(png|jpg)$/i.test(f)).sort();
const interior=[];
for(let i=0;i<interiors.length;i++){await image(path.join(root,'室内设计',interiors[i]),'room-'+i);interior.push({source:interiors[i],src:'/dossier/room-'+i+'.webp'});}
await sharp({create:{width:1200,height:Math.ceil(interiors.length/3)*270,channels:3,background:'#eee'}}).composite(await Promise.all(interiors.map(async(f,i)=>({input:await sharp(path.join(root,'室内设计',f)).resize(400,240,{fit:'contain',background:'#ddd'}).extend({bottom:30,background:'#fff'}).composite([{input:Buffer.from(`<svg width="400" height="30"><text x="8" y="23" font-size="22">${i}</text></svg>`),top:240,left:0}]).png().toBuffer(),left:(i%3)*400,top:Math.floor(i/3)*270})))).png().toFile(path.resolve('../interior-contact-sheet.png'));
const stage=[];
for(const [i,dir] of ['丝路逐梦','梨园绘','乡村振兴','白蛇传'].entries()) {const files=(await fs.readdir(path.join(root,'舞台布景',dir))).filter(f=>f.endsWith('.png')).sort();const gallery=[];for(let j=0;j<files.length;j++){const name=`stage-${i}-${j}`;await image(path.join(root,'舞台布景',dir,files[j]),name);gallery.push('/dossier/'+name+'.webp');}stage.push({source:dir,title:['丝绸逐梦','梨园汇','乡村振兴','白蛇传'][i],gallery});}
const videos=[];
for(const [i,file] of (await fs.readdir(path.join(root,'AI视频类'))).filter(f=>f.endsWith('.mp4')).sort().entries()){await fs.copyFile(path.join(root,'AI视频类',file),path.join(out,'video-'+i+'.mp4'));videos.push({title:file.replace('.mp4',''),src:'/dossier/video-'+i+'.mp4'});}
const honors=[];
for(const [i,file] of (await fs.readdir(path.join(root,'荣誉证书'))).filter(f=>/\.(jpg|png)$/i.test(f)).sort().entries()){await image(path.join(root,'荣誉证书',file),'honor-'+i,1800);honors.push('/dossier/honor-'+i+'.webp');}
await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify({interior,stage,videos,honors},null,2));
console.log('Prepared',pages.length,'pages,',videos.length,'videos,',interior.length,'room views,',honors.length,'certificates');
