import sharp from 'sharp';
const atlas='C:/Users/29051/.codex/generated_images/01a09d6a-8219-7e21-9cff-82cbb962be65/exec-450a0103-e874-492b-96d3-d0f9f0b25d9d.png';
for(const [i,name] of ['cover','back','paper'].entries()) await sharp(atlas).extract({left:i*724,top:0,width:724,height:724}).webp({quality:92}).toFile(`public/dossier/book-${name}.webp`);
