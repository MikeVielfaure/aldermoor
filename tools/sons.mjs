// Sons du jeu : choisis dans assets/brut (CC0), convertis en .mp3 courts dans src/assets/sons et src/assets/musique.
// Appelé par : node tools/assets.mjs sons   (écrit aussi sons.json, la liste lue par le jeu)
import fs from 'fs';import path from 'path';
// groupe → [[pack, fichier, options]…] ; plusieurs fichiers = variantes tirées au hasard
const S={
 click:[['kenney-interface-sounds','click_001'],['kenney-interface-sounds','click_002']],
 step_herbe:[0,1,2,3,4].map(i=>['kenney-impact-sounds','footstep_grass_00'+i]),
 step_pierre:[0,1,2,3,4].map(i=>['kenney-impact-sounds','footstep_concrete_00'+i]),
 step_bois:[0,1,2,3,4].map(i=>['kenney-impact-sounds','footstep_wood_00'+i]),
 step_neige:[0,1,2].map(i=>['kenney-impact-sounds','footstep_snow_00'+i]),
 jump:[['kenney-rpg-audio','cloth1'],['kenney-rpg-audio','cloth3']],
 land:[0,1,2].map(i=>['kenney-impact-sounds','impactSoft_medium_00'+i]),
 cast_feu:[1,2,3].map(i=>['oga-80-cc0-rpg-sfx','spell_fire_0'+i,{duree:1.4}]),
 impact_feu:[5,6,7].map(i=>['oga-80-cc0-rpg-sfx','spell_fire_0'+i,{duree:1.6}]),
 cast_glace:[['oga-freeze-spell-0','freeze',{duree:1.3}]],
 impact_glace:[0,1,2].map(i=>['kenney-impact-sounds','impactGlass_light_00'+i]),
 cast_nature:[['oga-earth-element-magic-spell','Earth_Element_Magic_Spell_3',{duree:1.6}]],
 impact_nature:[0,1].map(i=>['kenney-impact-sounds','impactWood_medium_00'+i]),
 cast_lumiere:[1,3,5].map(i=>['oga-cure-magic','Cure'+i,{duree:1.6}]),
 cast_ombre:[['oga-teleport-spell','teleport',{duree:1.3}]],
 cast_arcane:[1,2,3].map(i=>['oga-magic-spell-sfx','magical_'+i,{duree:1.2}]),
 cast_vent:[['oga-wind-whoosh-loop','*',{duree:0.9}]],
 learn:[['oga-magic-spell-sfx','magical_6',{duree:2.2}]],
 newq:[['kenney-rpg-audio','bookOpen']],
 pick:[1,2,3].map(i=>['oga-80-cc0-rpg-sfx','item_gem_0'+i]),
 chest:[['oga-80-cc0-rpg-sfx','lock_01'],['oga-80-cc0-rpg-sfx','lock_02']],
 brew:[['kenney-rpg-audio','metalPot1'],['kenney-rpg-audio','metalPot2']],
 hitC:[['oga-80-cc0-rpg-sfx','creature_hurt_01'],['oga-80-cc0-rpg-sfx','creature_hurt_02'],['oga-80-cc0-rpg-sfx','creature_slime_01'],['oga-80-cc0-rpg-sfx','creature_slime_02']],
 hurt:[0,1].map(i=>['kenney-impact-sounds','impactPunch_medium_00'+i]),
 gong:[['kenney-impact-sounds','impactBell_heavy_000']],
 shield:[['kenney-impact-sounds','impactMetal_light_000']],
 door:[['kenney-rpg-audio','doorOpen_1'],['kenney-rpg-audio','doorOpen_2']],
 book:[1,2,3].map(i=>['kenney-rpg-audio','bookFlip'+i]),
 coins:[['kenney-rpg-audio','handleCoins'],['kenney-rpg-audio','handleCoins2']]
};
// boucles : musiques (une par ambiance du jeu) et ambiances
const M={
 jour:['oga-2-whimsical-rpg-themes','RPG_Overworld',{}],village:['oga-2-whimsical-rpg-themes','RPG_town',{}],
 nuit:['oga-fantasy-rising-moon','Rising_Moon',{duree:95,fondu:4}],auberge:['oga-a-small-fire-will-do-calming-loop','mp3',{}],
 salle:['oga-artifact-room','Artifact',{}],duel:['oga-battle-theme-b-for-rpg','battleThemeB',{}],grotte:['oga-loopable-dungeon-ambience','dungeon_ambient_1',{}],
 titre:['oga-calm-and-simple-title-music','Menu_Song',{}]};
const A={oiseaux:['oga-park-ambiences','park_ambience_birds',{debut:30,duree:40,fondu:2}],grillons:['oga-crickets-ambient-noise-loopable','crickets-oneloop',{}],
 feu:['oga-fireplace-sound-loop','fire',{}],riviere:['oga-park-ambiences','park_ambience_river',{debut:20,duree:30,fondu:2}],vent:['oga-park-ambiences','park_ambience_wind',{debut:10,duree:30,fondu:2}]};
function trouve(dir,nom){const ext=['.ogg','.wav','.mp3','.flac'];const res=[];const walk=d=>{for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())walk(p);else if(ext.includes(path.extname(f).toLowerCase())&&(nom==='*'||path.basename(f,path.extname(f))===nom))res.push(p);}};walk(dir);
 res.sort((a,b)=>(a.endsWith('.ogg')||a.endsWith('.wav')?0:1)-(b.endsWith('.ogg')||b.endsWith('.wav')?0:1));if(!res.length)throw new Error('introuvable : '+dir+' / '+nom);return res[0];}
export async function sons(mp3,BRUT,SORTIE){const dS=path.join(SORTIE,'sons'),dM=path.join(SORTIE,'musique');fs.mkdirSync(dS,{recursive:true});fs.mkdirSync(dM,{recursive:true});
 const liste={sons:{},musique:{},ambiance:{}};let tot=0;
 for(const [g,arr] of Object.entries(S)){liste.sons[g]=[];arr.forEach(([pack,nom,o],i)=>{const out=path.join(dS,g+(arr.length>1?'_'+(i+1):'')+'.mp3');
  mp3(trouve(path.join(BRUT,pack),nom),out,Object.assign({kbps:48,norm:false},o||{},o&&o.duree?{fondu:Math.min(0.15,o.duree/6)}:{}));liste.sons[g].push(path.basename(out));tot+=fs.statSync(out).size;});}
 for(const [k,[pack,nom,o]] of Object.entries(M)){const out=path.join(dM,k+'.mp3');mp3(trouve(path.join(BRUT,pack),nom),out,Object.assign({kbps:56,mono:true},o));liste.musique[k]=path.basename(out);tot+=fs.statSync(out).size;}
 for(const [k,[pack,nom,o]] of Object.entries(A)){const out=path.join(dM,'amb_'+k+'.mp3');mp3(trouve(path.join(BRUT,pack),nom),out,Object.assign({kbps:40,mono:true},o));liste.ambiance[k]=path.basename(out);tot+=fs.statSync(out).size;}
 fs.writeFileSync(path.join(dS,'sons.json'),JSON.stringify(liste));console.log('sons :',Object.keys(liste.sons).length,'groupes, musiques :',Object.keys(liste.musique).length,', ambiances :',Object.keys(liste.ambiance).length,'—',(tot/1048576).toFixed(1),'Mo');}
