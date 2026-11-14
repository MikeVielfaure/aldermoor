/* ================= DÉCOR AUTOMATIQUE =================
   Plus besoin de placer chaque objet à la main : chaque lieu a un STYLE, chaque style une RECETTE
   (quels objets, combien), et autoDecor() les pose tout seul aux places libres du lieu, tournés vers
   son centre. Un nouveau lieu ajouté dans LOCS sans style reçoit le style « campagne ».
   Les bords de chemins sont garnis de la même façon (fleurs, buissons, pierres), selon l'endroit.
   Pour ajouter un objet : une fonction dXxx(x,z,ry) dans le kit (11b), puis une ligne dans DECOR_KIT. */
// --- nouveaux objets du kit ---
function dColumn(x,z,ry){dkAt(x,z,ry);const S1=0xa49e90,S2=0x8f897d,h=dkr()<0.6?dkrr(1.0,2.6):3.6;
 dBox('stone',S2,1.15,0.34,1.15,0,0.17,0);dCyl('stone',S1,0.34,0.4,0.3,0,0.49,0,12);dCyl('stone',S1,0.34,0.36,h,0,0.64+h/2,0,12);
 if(h>3)dBox('stone',S2,1.0,0.3,1.0,0,0.64+h+0.15,0);else if(dkr()<0.6){dkSub(1.4,0.36,0.3,dkrr(0,TAU),()=>dCyl('stone',S1,0.33,0.36,dkrr(0.9,1.6),0,0,0,12,0,0,Math.PI/2));} // tronçon tombé
 if(dkr()<0.5)dSph('plain',0x5f7a44,0.3,0.32,0.64+h,0.1,0.35,1.2,1,1); // mousse
 addCol({x,z,r:0.6});}
function dFirebowl(x,z){dkAt(x,z,0);dCyl('stone',0x8f897d,0.22,0.32,0.9,0,0.45,0,8);dCyl('stone',0x7d776c,0.55,0.32,0.32,0,1.05,0,10);dSph('win',0xffffff,0.36,0,1.18,0,0.35,1,1,1);
 const p=dkW(0,1.5,0),g=glow(0xff9a40,2.2,0.3);g.position.copy(p);scene.add(g);LAMPS.push({s:g,x:p.x,z:p.z,off:0});addCol({x,z,r:0.5});}
function dScarecrow(x,z,ry){dkAt(x,z,ry);dCyl('wood',0x6a4a2a,0.05,0.06,2.2,0,1.1,0,6);dBox('wood',0x6a4a2a,1.5,0.08,0.08,0,1.6,0);
 dBox('plain',dkp([0x8a3a2a,0x3a5a8a,0x5a7a3a]),0.62,0.7,0.3,0,1.45,0);dSph('plain',0xd8c08a,0.24,0,2.12,0,1.1,1,1,1);dCyl('plain',0x3a2a1a,0.02,0.36,0.32,0,2.42,0,9);dCyl('plain',0x3a2a1a,0.42,0.42,0.03,0,2.28,0,12);
 [-1,1].forEach(s=>dCyl('wood',0xc8a85a,0.02,0.07,0.22,s*0.78,1.55,0,5,0,0,s*1.2));addCol({x,z,r:0.3});}
function dCrates(x,z,ry){dkAt(x,z,ry);const c=()=>dkp([0x9a7444,0x8a6438,0xa47c4a]),box=(px,py,pz,s,r)=>{dBox('wood',c(),s,s,s,px,py+s/2,pz,r);dBox('wood',0x5a3c20,s+0.02,0.08,s+0.02,px,py+s*0.12,pz,r);dBox('wood',0x5a3c20,s+0.02,0.08,s+0.02,px,py+s*0.88,pz,r);};
 box(0,0,0,0.85,0.1);box(0.95,0,0.1,0.75,-0.2);if(dkr()<0.6)box(0.4,0.85,0.05,0.65,0.4);addCol({x,z,r:1.0,h:gh(x,z)+1.5});}
function dBarrels(x,z,ry){dkAt(x,z,ry);[[0,0],[0.82,0.15],[0.35,-0.72]].slice(0,2+(dkr()<0.5?1:0)).forEach(([px,pz])=>{dCyl('wood',0x8a5e34,0.36,0.33,0.95,px,0.48,pz,12);[0.18,0.78].forEach(y=>dCyl('plain',0x3a3a3e,0.375,0.375,0.06,px,y,pz,12));dCyl('wood',0x6a4626,0.32,0.32,0.02,px,0.96,pz,12);});addCol({x,z,r:1.0,h:gh(x,z)+1.0});}
function dBeehive(x,z){dkAt(x,z,dkrr(0,TAU));dBox('wood',0x5a3c20,0.7,0.5,0.7,0,0.25,0);for(let i=0;i<4;i++)dCyl('wood',0xc8a050,0.34-i*0.06,0.36-i*0.06,0.18,0,0.59+i*0.17,0,12);dSph('wood',0xc8a050,0.14,0,1.27,0,0.6);dBox('plain',0x2a1a0a,0.12,0.08,0.05,0,0.6,0.34);addCol({x,z,r:0.45});}
function dLanternPost(x,z){dkAt(x,z,0);dBox('stone',0x8f897d,0.5,0.3,0.5,0,0.15,0);dBox('stone',0x9a948a,0.3,1.5,0.3,0,1.05,0);dBox('stone',0x8f897d,0.46,0.12,0.46,0,1.86,0);
 dBox('win',0xffffff,0.3,0.36,0.3,0,2.1,0);dCyl('plain',0x2a2a30,0.02,0.32,0.22,0,2.39,0,4,Math.PI/4);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>dBox('plain',0x2a2a30,0.04,0.38,0.04,a*0.16,2.1,b*0.16));
 const p=dkW(0,2.1,0),g=glow(0xffc870,2.2,0.25);g.position.copy(p);scene.add(g);LAMPS.push({s:g,x:p.x,z:p.z,off:0});addCol({x,z,r:0.35});}
function dFlowers(x,z){dkAt(x,z,0,undefined,0);const pal=dkp([[0xffd24a,0xfff2a0],[0xe0507a,0xff9ab8],[0xb070e0,0xd8b0ff],[0xf4f4f4,0xffe0f0],[0xff8040,0xffc070]]),n=6+Math.floor(dkr()*5);
 for(let i=0;i<n;i++){const a=dkr()*TAU,r=Math.sqrt(dkr())*0.55,px=Math.cos(a)*r,pz=Math.sin(a)*r,h=dkrr(0.25,0.5);dCyl('plain',0x4f8a3a,0.012,0.016,h,px,h/2,pz,4);dSph('plain',dkp(pal),dkrr(0.06,0.1),px,h,pz,0.7,1,1,0);}
 dSph('plain',0x4a8a3a,0.22,0,0.06,0,0.35,1.4,1,0);}
function dBush(x,z){dkAt(x,z,dkrr(0,TAU));const c=dkp([0x3f7a34,0x4a8a3a,0x36702e]),s=dkrr(0.5,0.9);dSph('plain',c,s,0,s*0.6,0,0.75,1.1,1,1);dSph('plain',c,s*0.7,s*0.7,s*0.45,0.2,0.75,1,1,1);dSph('plain',c,s*0.65,-s*0.6,s*0.4,-0.15,0.75,1,1,1);
 if(dkr()<0.4)for(let i=0;i<6;i++){const a=dkr()*TAU;dSph('plain',dkp([0xd0303a,0x6040c0,0xffffff]),0.06,Math.cos(a)*s*0.9,s*dkrr(0.5,0.9),Math.sin(a)*s*0.9,1,1,1,0);}
 if(s>0.75)addCol({x,z,r:s*0.8,h:gh(x,z)+s*1.1});}
// --- catalogue : nom → pose de l'objet (x,z,orientation). Rayon = place occupée au sol ---
const DECOR_KIT={
 hay:{r:1.1,put:(x,z,ry)=>dHay(x,z,ry,1+Math.floor(dkr()*3))}, cart:{r:1.4,put:(x,z,ry)=>dCart(x,z,ry,dkr()<0.5?'hay':'sacs')},
 crates:{r:1.2,put:dCrates}, barrels:{r:1.1,put:dBarrels}, scarecrow:{r:0.8,put:dScarecrow}, woodpile:{r:0.9,put:(x,z,ry)=>{dkAt(x,z,ry);dWoodpile();addCol({x,z,r:0.6,h:gh(x,z)+0.7});}},
 beehive:{r:0.6,put:dBeehive}, flowers:{r:0.7,col:false,put:dFlowers}, bush:{r:0.9,col:false,put:dBush},
 reeds:{r:0.5,col:false,put:dReeds}, log:{r:1.5,put:dLog}, stump:{r:0.8,put:dStump}, mushrooms:{r:0.6,col:false,put:dMushrooms},
 boulders:{r:1.0,put:(x,z)=>dBoulders(x,z,false)}, bigboulders:{r:1.6,put:(x,z)=>dBoulders(x,z,true)},
 column:{r:0.9,put:dColumn}, firebowl:{r:0.6,put:dFirebowl}, lanternpost:{r:0.5,put:dLanternPost},
 bench:{r:1.0,put:dBench}, planter:{r:0.8,put:dPlanter}, board:{r:1.1,put:dBoard}, statue:{r:1.0,put:dStatue}};
// --- styles : recettes [objet, combien, options] ---
const DECOR_STYLES={
 ferme:[['hay',3],['cart',1],['crates',2],['barrels',2],['scarecrow',1],['woodpile',1],['beehive',2],['flowers',4],['bush',2]],
 marais:[['reeds',16,{pool:true}],['log',2],['mushrooms',8],['boulders',2],['lanternpost',2],['bush',4],['flowers',2]],
 ruines:[['column',8],['bigboulders',2],['boulders',3],['firebowl',2],['mushrooms',4],['bush',3]],
 sacre:[['flowers',6],['mushrooms',4],['boulders',2],['bush',2]],
 montagne:[['bigboulders',4],['boulders',4],['stump',2],['bush',3],['flowers',2]],
 savant:[['bench',2],['crates',1],['planter',2],['lanternpost',2],['flowers',3],['bush',2]],
 foret:[['log',4],['stump',4],['mushrooms',10],['boulders',3],['bush',5],['flowers',2]],
 campagne:[['bench',1],['flowers',4],['boulders',2],['bush',3]]};
// style de chaque lieu ; null = lieu habillé à la main (11b). Lieu absent de la liste → « campagne »
const LOC_STYLE={moulin:'ferme',marais:'marais',ruines:'ruines',cercle:'sacre',hauteurs:'montagne',observatoire:'savant',biblio:'savant',foret:'foret',serre:'campagne',
 cour:null,chateau:null,village:null,lac:null,arene:null,bosquet:null};
const DPLACED=[]; // objets sans collision déjà posés (pour ne pas les empiler)
function dkRoom(x,z,r){for(const p of DPLACED)if(Math.hypot(x-p.x,z-p.z)<r+p.r+0.4)return false;return true;}
// pose « n » objets « kind » autour du lieu L (entre 35 % et 110 % de son rayon), sur des places libres
function autoPlace(L,kind,n,o){const K=DECOR_KIT[kind];if(!K)return 0;o=o||{};let k=0;
 for(let t=0;t<n*30&&k<n;t++){let x,z;
  if(o.pool&&typeof POOLS!=='undefined'){const P=dkp(POOLS),a=dkr()*TAU,r=P.r+dkrr(0.2,0.9);x=P.x+Math.cos(a)*r;z=P.z+Math.sin(a)*r;if(!dkRoom(x,z,K.r*0.5))continue;}
  else{const a=dkr()*TAU,r=L.r*dkrr(o.r0||0.35,o.r1||1.1);x=L.x+Math.cos(a)*r;z=L.z+Math.sin(a)*r;
   if(!dkFree(x,z,K.r,0.9)||!dkRoom(x,z,K.r)||slopeAt(x,z)>1.0)continue;}
  const ry=Math.atan2(L.x-x,L.z-z)+dkrrange(); // tourné vers le centre du lieu, à peu près
  K.put(x,z,ry);if(K.col===false||o.pool)DPLACED.push({x,z,r:K.r});k++;}
 return k;}
const dkrrange=()=>dkrr(-0.35,0.35);
function autoDecor(){const out={};
 for(const L of LOCS){const st=L.id in LOC_STYLE?LOC_STYLE[L.id]:'campagne';if(!st)continue;
  out[L.id]=(DECOR_STYLES[st]||[]).map(([kind,n,o])=>kind+':'+autoPlace(L,kind,Math.max(1,Math.round(n*(HQ?1:0.7))),o)+'/'+n).join(' ');}
 return out;}
// bords de chemins : un peu de vie tous les 4 à 5 m, jamais sur un lieu (ils ont leur recette)
function decorPathsides(){let n=0;const F=HQ?1:0.6;
 for(const [x1,z1,x2,z2] of ALLP){const L=Math.hypot(x2-x1,z2-z1),ux=(x2-x1)/L,uz=(z2-z1)/L;
  for(let t=3;t<L-3;t+=dkrr(3.8,5.2))for(const s of [-1,1]){if(dkr()>0.42*F)continue;const off=dkrr(3.2,4.4),x=x1+ux*t-uz*off*s,z=z1+uz*t+ux*off*s;
   if(!dkWild(x,z)||Math.hypot(x,z-2)<15)continue;const kind=dkr()<0.5?'flowers':dkr()<0.6?'bush':dkr()<0.6?'boulders':'stump',K=DECOR_KIT[kind];
   if(!dkFree(x,z,K.r,1.4)||!dkRoom(x,z,K.r)||slopeAt(x,z)>1.0)continue;K.put(x,z,dkr()*TAU);if(K.col===false)DPLACED.push({x,z,r:K.r});n++;}}
 return n;}
