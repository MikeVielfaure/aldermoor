// Prépare les ressources du jeu à partir des packs bruts (assets/brut, non versionnés) vers src/assets (versionné).
// Usage : node tools/assets.mjs [persos|creatures|monstres|chimeres|objets|sons|tout]
// Objectif téléphone : fichiers .glb compacts, textures 256 px, sons .mp3 courts. Le jeu marche aussi sans eux.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {prune,dedup,textureCompress,weld,mergeDocuments,unpartition,resample} from '@gltf-transform/functions';
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

/* ---------- personnages (Quaternius, RPG Character Pack : style peint, textures) ----------
   Les maillages sans animation (un fichier par modèle), et UN fichier d'animations partagé (celles du
   sorcier) : les six personnages ont le même squelette de 32 os. Textures réduites à 512 px (WebP).
   (Ancien choix, abandonné : Ultimate Animated Character Pack, jugé moins beau.) */
const PERSOS={sorcier:'Wizard',clerc:'Cleric',moine:'Monk',rodeuse:'Ranger',voleur:'Rogue',guerrier:'Warrior'};
const ANIMS=['Idle','Walk','Run','Spell1','Spell2','Staff_Attack','PickUp','RecieveHit','Death','Roll','Idle_Attacking','Punch'];
async function persos(){const src=path.join(BRUT,'quaternius-rpg-characters'),dst=path.join(SORTIE,'persos');
 fs.rmSync(dst,{recursive:true,force:true});fs.mkdirSync(dst,{recursive:true});
 for(const [nom,f] of Object.entries(PERSOS)){const doc=await io.read(path.join(src,f+'.gltf'));
  doc.getRoot().listAnimations().forEach(sansAnim);orphelins(doc);
  await doc.transform(prune(),dedup(),textureCompress({encoder:sharp,targetFormat:'webp',resize:[512,512],quality:82}));
  const out=path.join(dst,nom+'.glb');await io.write(out,doc);console.log('perso',nom,'←',f,ko(out));}
 // animations : celles du sorcier, sans les maillages
 const doc=await io.read(path.join(src,'Wizard.gltf'));const R=doc.getRoot();
 R.listAnimations().forEach(a=>{const n=a.getName().replace(/^.*\|/,'');if(!ANIMS.includes(n))sansAnim(a);else a.setName(n);});
 R.listNodes().forEach(n=>{if(n.getMesh())n.setMesh(null);if(n.getSkin())n.setSkin(null);});R.listMeshes().forEach(m=>m.dispose());R.listSkins().forEach(s=>s.dispose());orphelins(doc);
 await doc.transform(prune({keepLeaves:true}));const out=path.join(dst,'animations.glb');await io.write(out,doc);console.log('animations',R.listAnimations().map(a=>a.getName()).join(','),ko(out));}

/* ---------- créatures (Quaternius, Cute Monsters) : texture réduite à 256 px ---------- */
const CREAS={fantome:'Ghost',champignon:'Mushroom',yeti:'Yeti',demon:'Demon',chauvesouris:'Bat',cyclope:'Cyclops',crabe:'Crab',alien:'Alien',arbre:'Tree',crane:'Skull',dragon:'YellowDragon',abeille:'Bee',
 cerf:'Deer',pingouin:'Penguin',cochon:'Pig',poule:'Chicken',diablotin:'GreenDemon',poulpe:'Cthulhu',panda:'Panda',cactus:'Cactus'};
async function creatures(){const src=path.join(BRUT,'quaternius-cute-monsters'),dst=path.join(SORTIE,'creatures');fs.mkdirSync(dst,{recursive:true});
 for(const [nom,f] of Object.entries(CREAS)){const doc=await io.read(path.join(src,f+'.gltf'));
  doc.getRoot().listAnimations().forEach(a=>a.setName(a.getName().replace(/^.*\|/,'')));
  await doc.transform(prune(),dedup(),textureCompress({encoder:sharp,targetFormat:'png',resize:[256,256]}));
  const out=path.join(dst,nom+'.glb');await io.write(out,doc);console.log('créature',nom,'←',f,ko(out));}}

/* ---------- monstres (Quaternius, Ultimate Monsters, CC0, .glb de Poly Pizza) : couleurs par matériau, sans texture ----------
   On ne garde que les animations dont le jeu se sert, renommées comme celles des Cute Monsters :
   Idle, Walk, Bite_InPlace (coup), HitRecieve, Death, Flying (les volants n'ont que ça). Matériaux mats. */
const MONS={orc:'Orc',ninja:'Ninja-xGYmeDpfTu',masque:'Tribal',spectre:'Ghost','spectre-crane':'Ghost Skull','demon-bleu':'Blue Demon','grand-demon':'Demon-LnfIziKv4o',
 'roi-champignon':'Mushroom King',champichon:'Mushnub','champichon-ancien':'Mushnub Evolved',grenouille:'Frog',blob:'Green Blob','blob-epineux':'Green Spiky Blob',cactoro:'Cactoro-IGn9lhdama',
 'grand-yeti':'Yeti-ceRHrn8HHE',armabee:'Armabee',alpaking:'Alpaking',hywirl:'Hywirl',glub:'Glub',birb:'Birb',dragonnet:'Dragon','dragonnet-ancien':'Dragon Evolved',
 lapin:'Bunny',chat:'Cat',pigeon:'Pigeon',farceur:'Wizard'};
const MONS_ANIM=[['Idle',['Idle']],['Walk',['Walk']],['Bite_InPlace',['Bite_Front','Punch','Headbutt']],['HitRecieve',['HitRecieve','HitReact']],['Death',['Death']],['Flying',['Flying_Idle']]];
/* animaux réalistes (Quaternius, Ultimate Animated Animal Pack, CC0) : la magie (corne, ailes, flammes…) est ajoutée par le jeu (20zd).
   Le fichier de Poly Pizza contient chaque animation deux fois : on n'en garde qu'une. Pégase : le galop sert d'animation de vol. */
const CHIM={licorne:'White Horse',pegase:'White Horse','cerf-etoiles':'Stag','loup-spectral':'Wolf','renard-feu':'Fox','taureau-lave':'Bull'};
const CHIM_ANIM=nom=>[['Idle',['Idle']],['Walk',['Walk']],['Bite_InPlace',['Attack_Headbutt','Attack']],['HitRecieve',['Idle_HitReact_Left']],['Death',['Death']]].concat(nom==='pegase'?[['Flying',['Gallop']]]:[]);
async function prepModeles(dossier,table,anims,quoi){const src=path.join(BRUT,dossier,'glb'),dst=path.join(SORTIE,'creatures');fs.mkdirSync(dst,{recursive:true});let tot=0;
 for(const [nom,f] of Object.entries(table)){const doc=await io.read(path.join(src,f+'.glb')),R=doc.getRoot(),A={};
  R.listAnimations().forEach(a=>{const n=a.getName().replace(/^.*\|/,'');if(!A[n])A[n]=a;});const keep=new Set();
  for(const [to,from] of (typeof anims==='function'?anims(nom):anims)){const k=from.find(n=>A[n]&&!keep.has(A[n]));if(k){A[k].setName(to);keep.add(A[k]);}}
  R.listAnimations().forEach(a=>{if(!keep.has(a))sansAnim(a);});orphelins(doc);
  for(const m of R.listMaterials()){m.setMetallicFactor(0);m.setRoughnessFactor(0.8);}
  await doc.transform(resample(),prune(),dedup());const out=path.join(dst,nom+'.glb');await io.write(out,doc);tot+=fs.statSync(out).size;
  console.log(quoi,nom,'←',f,ko(out),'|',R.listAnimations().map(a=>a.getName()).join(','));}
 console.log(quoi+' : total',Math.round(tot/1024),'Ko');}
const monstres=()=>prepModeles('quaternius-ultimate-monsters',MONS,MONS_ANIM,'monstre');
const chimeres=()=>prepModeles('quaternius-animated-animals',CHIM,CHIM_ANIM,'chimère');

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
if(quoi==='monstres'||quoi==='creatures'||quoi==='tout')await monstres();
if(quoi==='chimeres'||quoi==='creatures'||quoi==='tout')await chimeres();
if(quoi==='objets'||quoi==='tout')await objets();
if(quoi==='sons'||quoi==='tout'){const m=await import('./sons.mjs');await m.sons(mp3,BRUT,SORTIE);}
let total=0;const walk=d=>{for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())walk(p);else total+=fs.statSync(p).size;}};walk(SORTIE);
console.log('total src/assets :',(total/1048576).toFixed(1),'Mo');
