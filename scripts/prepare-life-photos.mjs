import sharp from 'sharp';
const ids=['716ad5d7-8dbe-4b06-a51d-40a3a93a7b5d','6f306ffe-2165-447d-8b1f-795b083d9535','9c38e252-201a-46cf-910e-9d5a8530907b','91d7cd53-acb8-4bdd-a028-38295085422a','cb40054c-021d-4e53-a89c-7da9065c2f6e','5450e743-5d48-460f-884a-a086922aa5c9'];
for(let i=0;i<ids.length;i++)await sharp(`C:/Users/29051/AppData/Local/Temp/codex-clipboard-${ids[i]}.jpg`).rotate().resize({width:1600,height:2000,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toFile(`public/dossier/life-${i}.webp`);
