// Prépare les ressources du jeu à partir des packs bruts (assets/brut, non versionnés) vers src/assets (versionné).
// Usage : node tools/assets.mjs [persos|creatures|objets|sons|tout]
// Objectif téléphone : fichiers .glb compacts, textures 256 px, sons .mp3 courts. Le jeu marche aussi sans eux.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {prune,dedup,textureCompress,weld,mergeDocuments,unpartition} from '@gltf-transform/functions';
import sharp from 'sharp';
import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';import {execFileSync} from 'child_process';
import {createRequire} from 'module';
const require=createRequire(import.meta.url);
const ICI=path.dirname(fileURLToPath(import.meta.url)),RACINE=path.join(ICI,'..'),BRUT=path.join(RACINE,'assets','brut'),SORTIE=path.join(RACINE,'src','assets');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
const ko=f=>Math.round(fs.statSync(f).size/1024)+' Ko';
// les données d'une animation supprimée restent parfois attachées au document : on les retire
const sansAnim=a=>{a.listSamplers().forEach(s=>s.dispose());a.listChannels().forEach(c=>c.dispose());a.dispose();};
const orphelins=doc=>doc.getRoot().listAccessors().forEach(a=>{if(a.listParents().every(p=>p.propertyType==='Root'))a.dispose();});
const quoi=process.argv[2]||'tout';
fs.mkdirSync(SORTIE,{recursive:true});

/* ---------- personnages (Quaternius, Ultimate Animated Character Pack) ----------
   Les maillages sans animation (un fichier par modèle), et UN fichier d'animations partagé :
   tous ces personnages ont le même squelette de 23 os. */
const PERSOS={sorcier:'Wizard',sorciere:'Witch',elfe:'Elf',forestier:'Worker_Male',aubergiste:'Chef_Male',meunier:'OldClassy_Male'};
const ANIMS=['Idle','Walk','Run','Jump','Shoot_OneHanded','PickUp','RecieveHit','Death','Victory','Defeat','Punch'];
async function persos(){const src=path.join(BRUT,'quaternius-animated-characters'),dst=path.join(SORTIE,'persos');fs.mkdirSync(dst,{recursive:true});
 for(const [nom,f] of Object.entries(PERSOS)){const doc=await io.read(path.join(src,f+'.gltf'));
  doc.getRoot().listAnimations().forEach(sansAnim);orphelins(doc);await doc.transform(prune(),dedup());
  const out=path.join(dst,nom+'.glb');await io.write(out,doc);console.log('perso',nom,'←',f,ko(out));}
 // animations : celles du sorcier, sans les maillages
 const doc=await io.read(path.join(src,'Wizard.gltf'));const R=doc.getRoot();
 R.listAnimations().forEach(a=>{const n=a.getName().replace(/^.*\|/,'');if(!ANIMS.includes(n))sansAnim(a);else a.setName(n);});
 R.listNodes().forEach(n=>{if(n.getMesh())n.setMesh(null);if(n.getSkin())n.setSkin(null);});R.listMeshes().forEach(m=>m.dispose());R.listSkins().forEach(s=>s.dispose());orphelins(doc);
 await doc.transform(prune({keepLeaves:true}));const out=path.join(dst,'animations.glb');await io.write(out,doc);console.log('animations',R.listAnimations().map(a=>a.getName()).join(','),ko(out));}

/* ---------- créatures (Quaternius, Cute Monsters) : texture réduite à 256 px ---------- */
const CREAS={fantome:'Ghost',champignon:'Mushroom',yeti:'Yeti',demon:'Demon',chauvesouris:'Bat',cyclope:'Cyclops',crabe:'Crab',alien:'Alien',arbre:'Tree',crane:'Skull',dragon:'YellowDragon',abeille:'Bee'};
async function creatures(){const src=path.join(BRUT,'quaternius-cute-monsters'),dst=path.join(SORTIE,'creatures');fs.mkdirSync(dst,{recursive:true});
 for(const [nom,f] of Object.entries(CREAS)){const doc=await io.read(path.join(src,f+'.gltf'));
  doc.getRoot().listAnimations().forEach(a=>a.setName(a.getName().replace(/^.*\|/,'')));
  await doc.transform(prune(),dedup(),textureCompress({encoder:sharp,targetFormat:'png',resize:[256,256]}));
  const out=path.join(dst,nom+'.glb');await io.write(out,doc);console.log('créature',nom,'←',f,ko(out));}}

/* ---------- objets (Quaternius, Fantasy Props MegaKit) : TOUS dans un seul fichier objets.glb ----------
   Les 4 grandes textures « trim » sont partagées par tous les objets : un seul fichier = téléchargées une fois.
   Cartes de relief et ORM retirées (inutiles sur téléphone), couleur réduite à 512 px en WebP. */
const OBJETS=['Cauldron','Potion_1','Potion_2','Potion_4','SmallBottles_1','Bottle_1','Bookcase_2','BookGroup_Medium_1','BookGroup_Medium_2','BookGroup_Small_1','Book_Stack_1','Book_Stack_2','BookStand','Book_5','Scroll_1','Scroll_2',
 'Candle_1','CandleStick','CandleStick_Triple','Chandelier','Lantern_Wall','Chest_Wood','Barrel','Barrel_Apples','Crate_Wooden','Table_Large','Chair_1','Stool','Shelf_Small_Bottles','Shelf_Simple',
 'Cabinet','Dummy','WeaponStand','Anvil','Mug','Chalice'];
async function objets(){const src=path.join(BRUT,'quaternius-fantasy-props','Exports','glTF'),dst=path.join(SORTIE,'objets');fs.mkdirSync(dst,{recursive:true});
 const doc=await io.read(path.join(src,OBJETS[0]+'.gltf'));const scene=doc.getRoot().listScenes()[0];
 const nommer=(sc,nom)=>{const g=doc.createNode(nom);sc.listChildren().forEach(n=>{sc.removeChild(n);g.addChild(n);});scene.addChild(g);};
 nommer(scene,OBJETS[0]);
 for(const nom of OBJETS.slice(1)){const d=await io.read(path.join(src,nom+'.gltf'));const map=mergeDocuments(doc,d);const sc=map.get(d.getRoot().listScenes()[0]);nommer(sc,nom);sc.dispose();}
 for(const m of doc.getRoot().listMaterials()){m.setNormalTexture(null);m.setOcclusionTexture(null);m.setMetallicRoughnessTexture(null);m.setMetallicFactor(0);m.setRoughnessFactor(0.85);}
 await doc.transform(unpartition(),dedup(),prune(),textureCompress({encoder:sharp,targetFormat:'webp',resize:[512,512],quality:80}));
 const out=path.join(dst,'objets.glb');await io.write(out,doc);
 const tex=doc.getRoot().listTextures().map(t=>t.getName()||t.getURI()).join(', ');console.log('objets',OBJETS.length,'→',ko(out),'| textures :',tex);}

/* ---------- sons : .mp3 mono, coupés, volume normalisé ---------- */
const FFMPEG=()=>require('ffmpeg-static');
function mp3(src,out,{debut=0,duree=null,kbps=64,mono=true,fondu=0,norm=true}={}){const a=['-y','-loglevel','error','-ss',String(debut),'-i',src];if(duree)a.push('-t',String(duree));
 const f=norm?['loudnorm=I=-18:TP=-2']:['anull'];if(fondu&&duree){f.push('afade=t=in:d='+fondu,'afade=t=out:st='+(duree-fondu)+':d='+fondu);}
 a.push('-af',f.join(','));if(mono)a.push('-ac','1');a.push('-b:a',kbps+'k',out);execFileSync(FFMPEG(),a);return out;}
export {mp3};

if(quoi==='persos'||quoi==='tout')await persos();
if(quoi==='creatures'||quoi==='tout')await creatures();
if(quoi==='objets'||quoi==='tout')await objets();
if(quoi==='sons'||quoi==='tout'){const m=await import('./sons.mjs');await m.sons(mp3,BRUT,SORTIE);}
let total=0;const walk=d=>{for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())walk(p);else total+=fs.statSync(p).size;}};walk(SORTIE);
console.log('total src/assets :',(total/1048576).toFixed(1),'Mo');
