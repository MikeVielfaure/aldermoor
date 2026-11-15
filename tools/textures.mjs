// Textures réalistes (photos CC0 de Poly Haven) pour remplacer les textures peintes du jeu (TX, 11-textures).
// node tools/textures.mjs  →  src/assets/tex/<nom>.jpg (512 px, niveaux de gris, luminosité moyenne
// réglée sur celle de la texture peinte : les couleurs du jeu, données par les matériaux et les sommets, restent).
import fs from 'fs';import path from 'path';import sharp from 'sharp';
const OUT=path.resolve('src/assets/tex');fs.mkdirSync(OUT,{recursive:true});const BRUT=path.resolve('assets/brut/polyhaven');fs.mkdirSync(BRUT,{recursive:true});
// nom dans le jeu : [texture Poly Haven, luminosité moyenne visée (0-1), contraste]
const LISTE={grass:['leafy_grass',0.80,2.0],rock:['rock_face',0.76,1.7],stone:['castle_brick_01',0.52,1.4],wood:['wood_planks',0.72,1.5],
 bark:['bark_brown_02',0.46,1.5],roof:['roof_slates_02',0.36,1.4],plaster:['plastered_wall',0.90,1.2]};
const UA={'User-Agent':'aldermoor-game-assets'};
for(const [nom,[id,cible,k]] of Object.entries(LISTE)){
 const brut=path.join(BRUT,id+'_diff_1k.jpg');
 if(!fs.existsSync(brut)){const f=await (await fetch('https://api.polyhaven.com/files/'+id,{headers:UA})).json();const url=f.Diffuse['1k'].jpg.url;
  const b=Buffer.from(await (await fetch(url,{headers:UA})).arrayBuffer());fs.writeFileSync(brut,b);console.log('téléchargé',id);}
 const {data,info}=await sharp(brut).resize(512,512).greyscale().raw().toBuffer({resolveWithObject:true});
 let m=0;for(const v of data)m+=v;m/=data.length*255;
 const o=Buffer.alloc(data.length);for(let i=0;i<data.length;i++){const v=cible+(data[i]/255-m)*k;o[i]=Math.max(0,Math.min(255,Math.round(v*255)));}
 await sharp(o,{raw:{width:info.width,height:info.height,channels:1}}).jpeg({quality:82}).toFile(path.join(OUT,nom+'.jpg'));
 console.log(nom,'←',id,'moyenne',m.toFixed(2),'→',cible,(fs.statSync(path.join(OUT,nom+'.jpg')).size/1024).toFixed(0)+' Ko');}
