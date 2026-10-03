import sharp from 'sharp';
await sharp('C:/Users/29051/.codex/generated_images/01a08b3c-7921-7e33-ac66-771b78666f70/exec-ef06b306-f9dc-4b84-a298-3ab53e3de93f.png').resize({width:900,height:900,fit:'inside',withoutEnlargement:true}).webp({quality:92,alphaQuality:100}).toFile('public/dossier/medal-cutout.webp');
