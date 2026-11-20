/* ================= CONSTRUIRE, DÉTRUIRE, RÉPARER =================
   - Construo (sort) : palette de constructions posées sur le point marqué / le viseur libre / devant soi, alignées
     sur une grille de 1,5 m et sur la caméra : mur de bois, mur de pierre, palissade, porte (le joueur passe, pas
     les créatures), tour de guet (on peut se tenir dessus), plateforme (même en l'air, en balai), mur de cristal
     (sans ressource : 40 mana).
   - Ressources : bois (couper un arbre de la vallée, une fois par jour), pierre (carrières des Ruines d'Ysmer et du
     Plateau des Géants, rochers), ou l'Échoppe (matériaux). Construo et Reparo s'apprennent à l'Échoppe (50 🪙).
   - Destruction progressive : sorts du joueur (le feu brûle le bois, l'eau l'éteint, Démantibulus pulvérise),
     créatures qui assiègent (bloquées, elles frappent), boules de feu d'Ignivor, tirs ennemis. Fissures, puis ruine.
     SEUL ce que le joueur construit peut casser : château, maisons et décors sont incassables.
   - Reparo (sort) : +35 % par lancer sur la construction visée ; relève une ruine. Enchantement d'incassabilité
     (1 essence + 1 cristal) depuis la construction elle-même. S.builds garde tout. */
const BLD_T={
 bois:{n:'Mur de bois',w:3,h:2.6,d:0.4,hp:60,cost:{bois:4},wood:true,col:0x7a5232},
 pierre:{n:'Mur de pierre',w:3,h:2.8,d:0.6,hp:160,cost:{pierre:4},col:0x8f8a80},
 palissade:{n:'Palissade',w:3,h:2.3,d:0.35,hp:45,cost:{bois:3},wood:true,col:0x6a4a2a},
 porte:{n:'Porte',w:3,h:2.8,d:0.5,hp:80,cost:{bois:3,pierre:1},wood:true,gate:true,col:0x5a3a1e},
 tour:{n:'Tour de guet',w:2.6,h:4.6,d:2.6,hp:240,cost:{pierre:6,bois:4},col:0x8a857a},
 plateforme:{n:'Plateforme',w:3,h:0.3,d:3,hp:50,cost:{bois:4},wood:true,air:true,col:0x8a6238},
 cristal:{n:'Mur de cristal',w:3,h:2.6,d:0.4,hp:90,mana:40,col:0x9fd8ff}};
const CONSTRUO_SP={name:'Construo',inc:'Construo',el:'nature',form:'util',special:'construo',legend:true,cost:5,cd:0.4,id:'construo',desc:'Bâtis murs, palissades, portes, tours et plateformes là où tu vises, avec du bois, de la pierre… ou du mana.'};
const REPARO_SP={name:'Reparo',inc:'Reparo',el:'lumiere',form:'util',special:'reparo',legend:true,cost:18,cd:1,id:'reparo',desc:'Répare par étapes la construction visée, et relève même une ruine.'};
INGR.bois=INGR.bois||{n:'Bois',c:0x8a5a2a,where:[],look:'herb'};INGR.pierre=INGR.pierre||{n:'Pierre',c:0x9a948a,where:[],look:'herb'};
const BLD=[];let BLDN=0,BLDQ=null;const BLDV=new THREE.Vector3();
const bldMax=t=>BLD_T[t].hp;
// ---------- maillages ----------
function bldMesh(P){const T=BLD_T[P.t],g=new THREE.Group(),M=c=>mat(c,{flatShading:true,roughness:0.9}),box=(w,h,d,x,y,z,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
 if(P.t==='bois'){for(let i=0;i<6;i++)box(0.48,T.h,T.d,-1.25+i*0.5,T.h/2,0,i%2?0x7a5232:0x6e4a2c);box(T.w,0.16,T.d+0.1,0,T.h*0.3,0.02,0x5a3a1e);box(T.w,0.16,T.d+0.1,0,T.h*0.75,0.02,0x5a3a1e);}
 else if(P.t==='pierre'){for(let r=0;r<4;r++)for(let i=0;i<3;i++)box(0.98,0.68,T.d,-1+i+(r%2?0.25:-0.1)*0,0.34+r*0.7,0,[0x8f8a80,0x9a958a,0x85807a][(i+r)%3]);for(let i=0;i<3;i++)box(0.6,0.4,T.d+0.05,-1+i,T.h+0.1,0,0x8a857a);}
 else if(P.t==='palissade'){for(let i=0;i<7;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.2,T.h,6),M(0x6a4a2a));c.position.set(-1.3+i*0.43,T.h/2,0);c.castShadow=true;g.add(c);const tip=new THREE.Mesh(new THREE.ConeGeometry(0.17,0.4,6),M(0x5a3a1e));tip.position.set(-1.3+i*0.43,T.h+0.2,0);g.add(tip);}box(T.w,0.12,0.12,0,T.h*0.6,0.2,0x4a3018);}
 else if(P.t==='porte'){box(0.35,T.h,T.d,-1.35,T.h/2,0,0x8f8a80);box(0.35,T.h,T.d,1.35,T.h/2,0,0x8f8a80);box(T.w,0.35,T.d,0,T.h-0.17,0,0x8f8a80);const dr=box(2.3,T.h-0.4,0.15,0,(T.h-0.4)/2,0,0x5a3a1e);P.door=dr;box(0.12,0.12,0.2,0.8,1.2,0.1,0xd8b24a);}
 else if(P.t==='tour'){box(T.w,T.h-0.6,T.d,0,(T.h-0.6)/2,0,0x8a857a);box(T.w+0.5,0.25,T.d+0.5,0,T.h-0.48,0,0x6a4a2a);for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])box(0.15,1.1,0.15,a*1.4,T.h+0.2,b*1.4,0x5a3a1e);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(2.3,1.2,4),M(0x8a3a30));roof.position.y=T.h+1.3;roof.rotation.y=Math.PI/4;roof.castShadow=true;g.add(roof);}
 else if(P.t==='plateforme'){for(let i=0;i<6;i++)box(0.48,T.h,T.d,-1.25+i*0.5,T.h/2,0,i%2?0x8a6238:0x7a5432);}
 else if(P.t==='cristal'){const m=new THREE.Mesh(new THREE.BoxGeometry(T.w,T.h,T.d),new THREE.MeshStandardMaterial({color:0x9fd8ff,emissive:0x3a8ad8,emissiveIntensity:0.6,transparent:true,opacity:0.6,roughness:0.1,metalness:0.3}));m.position.y=T.h/2;g.add(m);const gl=glow(0x9fd8ff,3,0.5);gl.position.y=T.h/2;g.add(gl);}
 g.position.set(P.x,P.y,P.z);g.rotation.y=P.rot;scene.add(g);P.o=g;
 if(P.inc){const r=glow(0xffd24a,1,0.9);r.position.y=Math.max(T.h,0.6)+0.4;g.add(r);P.rune=r;}}
function bldCol(P){const T=BLD_T[P.t],q=Math.abs(Math.sin(P.rot))>0.5,hw=(q?T.d:T.w)/2,hd=(q?T.w:T.d)/2;const c={x:P.x,z:P.z,hw,hd,h:P.y+T.h,bld:P};if(T.air)c.bot=P.y-0.3;if(T.gate)c.gate=true;COLS.push(c);P.col=c;}
function bldMake(P){bldMesh(P);bldCol(P);bldLook(P);}
function bldUnmake(P){if(P.o)scene.remove(P.o);P.o=null;if(P.col){const i=COLS.indexOf(P.col);if(i>=0)COLS.splice(i,1);P.col=null;}if(P.rubble){scene.remove(P.rubble);P.rubble=null;}}
function bldLook(P){if(!P.o)return;const k=P.hp/bldMax(P.t);P.o.rotation.z=k<0.33?0.07:k<0.66?0.03:0;P.o.scale.y=k<0.33?0.85:1;P.o.traverse(o=>{if(o.isMesh&&o.material&&o.material.color&&!o.material.transparent){if(!o.userData.c0)o.userData.c0=o.material.color.getHex();if(!o.userData.own){o.material=o.material.clone();o.userData.own=1;}o.material.color.setHex(o.userData.c0).multiplyScalar(0.55+0.45*k);}});}
function bldSave(){S.builds=BLD.map(P=>({t:P.t,x:P.x,y:P.y,z:P.z,rot:P.rot,hp:Math.round(P.hp),inc:!!P.inc,ruin:!!P.ruin,rt:P.rt||0}));save();}
// ---------- poser ----------
function bldTarget(){const air=FLY.on;let x,z,y;const P=utilPt(25);const [dx,dz]=fwd();
 if(P&&!air){x=P.x;z=P.z;}else{x=player.x+dx*(air?2.5:3.5);z=player.z+dz*(air?2.5:3.5);}
 y=air?player.y-0.35:gh(x,z);return {x,z,y,air,rot:Math.round(camYaw/(Math.PI/2))*(Math.PI/2)};}
function bldCanPay(T){if(T.mana)return mana>=T.mana;return Object.entries(T.cost).every(([k,n])=>(S.inv[k]||0)>=n);}
const costTxt2=T=>T.mana?T.mana+' mana':Object.entries(T.cost).map(([k,n])=>n+' '+INGR[k].n.toLowerCase()).join(' + ');
function castConstruo(sp){if(S.zone!=='monde'){say('On ne construit pas à l’intérieur.','sys');return;}BLDQ=bldTarget();
 const items=[];if(S.bldLast&&BLD_T[S.bldLast]){const T=BLD_T[S.bldLast];items.push({t:'⟳ Encore : '+T.n,s:costTxt2(T),off:!bldCanPay(T),fn:()=>bldPlace(S.bldLast)});}
 for(const [k,T] of Object.entries(BLD_T)){if(T.air&&!BLDQ.air&&false)continue;items.push({t:T.n+(T.air?' (en vol : à ta hauteur)':''),s:costTxt2(T)+' · solidité '+T.hp,off:!bldCanPay(T),fn:()=>bldPlace(k)});}
 openPick('🧱 Construo','Bois : '+(S.inv.bois||0)+' · Pierre : '+(S.inv.pierre||0)+'. La construction se pose là où tu vises, sur une grille, face à la caméra.',items);}
function bldPlace(t){const T=BLD_T[t],Q=BLDQ;$('#pick').classList.add('hidden');if(!Q||!bldCanPay(T))return;if(BLD.filter(P=>!P.ruin).length>=160){say('Tu as déjà beaucoup construit (160 pièces) : démolis-en d’abord.','sys');return;}
 let x=Q.x,z=Q.z,y=Q.y;if(!Q.air||!T.air){x=Math.round(x/1.5)*1.5;z=Math.round(z/1.5)*1.5;y=T.air&&Q.air?Q.y:gh(x,z);}
 const inL=x>1500;if(x>4000?!terIn(x,z):inL?Math.hypot(x-2000,z)>160:Math.hypot(x,z)>88){say('Trop près du bord du monde.','sys');return;}
 if(!T.air&&inLake({x,z})&&!onIce({x,z})){say('Impossible de bâtir sur l’eau (gèle-la d’abord !).','sys');return;}
 if(Math.hypot(x-player.x,z-player.z)<Math.max(T.w,T.d)/2+0.5&&!(T.air&&Q.air)){const [dx,dz]=fwd();x+=dx*2;z+=dz*2;y=gh(x,z);}
 /* pas à travers une maison, un rocher, un arbre ou le château (les constructions du joueur peuvent se toucher) */
 if(!(T.air&&Q.air)&&COLS.some(c=>!c.bld&&!c.lake&&!c.off&&c.bot===undefined&&(c.r!==undefined?Math.hypot(x-c.x,z-c.z)<c.r+0.7:Math.abs(x-c.x)<c.hw+0.7&&Math.abs(z-c.z)<c.hd+0.7))){say('🧱 Pas de place ici : il y a déjà quelque chose.','sys');return;}
 if(T.mana)mana-=T.mana;else for(const k in T.cost)S.inv[k]-=T.cost[k];
 const P={id:++BLDN,t,x,y,z,rot:Q.rot,hp:T.hp};BLD.push(P);bldMake(P);S.bldLast=t;
 for(let i=0;i<30;i++)PN.emit(x+rnd(-1.5,1.5),y+rnd(0,T.h),z+rnd(-1.5,1.5),0,rnd(.3,1),0,T.col,0.4,0.6,rnd(.5,1),0,0.6,0.8);sfx('impact','nature',x,z);
 if(!S.seenBld){S.seenBld=1;say('🧱 Construit ! Les créatures ne passent pas, mais elles peuvent l’abîmer. <b>Reparo</b> répare, et approche-toi de ta construction pour l’enchanter (incassable) ou la démolir.','gm');}bldSave();}
// ---------- abîmer, détruire ----------
const BLD_EL={feu:1,glace:0.5,eau:0.3,vent:0.7,nature:0.6,lumiere:1,ombre:1.2,arcane:1.5};
function bldDamage(P,n,el){if(!P||P.ruin||P.inc||n<=0)return;const T=BLD_T[P.t];let k=BLD_EL[el]||1;if(el==='feu'&&T.wood){k=2.5;P.burn=Math.max(P.burn||0,4);}if(P.t==='cristal'){if(el==='ombre')k=2;if(el==='lumiere')k=0.5;}
 P.hp-=n*k;burst(P.x,P.y+Math.min(T.h,2)*0.6,P.z,T.col,8,3);if(P.hp<=0)bldBreak(P);else bldLook(P);}
function bldBreak(P){const T=BLD_T[P.t];debris(P.x,P.y+T.h/2,P.z,T.col,14);SHAKE=Math.max(SHAKE,0.3);sfx('impact','arcane',P.x,P.z);bldUnmake(P);P.ruin=true;P.rt=gameMin();P.hp=0;P.burn=0;
 const g=new THREE.Group();g.position.set(P.x,gh(P.x,P.z),P.z);for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.DodecahedronGeometry(rnd(0.2,0.4),0),mat(T.col,{flatShading:true}));m.position.set(rnd(-1.2,1.2),0.15,rnd(-0.6,0.6));g.add(m);}scene.add(g);P.rubble=g;
 floatAt(P.x,P.z,T.n+' en ruine','#ffb070');bldSave();}
function bldAt(x,z,r,y){return BLD.filter(P=>!P.ruin&&P.col&&Math.abs(x-P.x)<P.col.hw+r&&Math.abs(z-P.z)<P.col.hd+r&&(y===undefined||(y>P.y-0.5&&y<P.col.h+0.5)));}
function bldHit(x,z,r,el,n,y){bldAt(x,z,r,y).forEach(P=>bldDamage(P,n,el));if(el==='eau')BLD.forEach(P=>{if(P.burn&&Math.hypot(P.x-x,P.z-z)<r+2)P.burn=0;});}
{const _eh=elemHit;elemHit=function(el,x,z,r){const res=_eh.apply(this,arguments);try{bldHit(x,z,Math.min(r||2,4),el,16*Math.min(2,pow(el)));}catch(e){}return res;};}
// ---------- réparer ----------
function castReparo(sp){const P0=utilPt(25),[dx,dz]=fwd();let best=null,bd=1e9;
 for(const P of BLD){if(!P.ruin&&P.hp>=bldMax(P.t))continue;const vx=P.x-player.x,vz=P.z-player.z,d=Math.hypot(vx,vz);if(d>18)continue;
  const sc=P0?Math.hypot(P.x-P0.x,P.z-P0.z):d*(1+3*(1-(vx*dx+vz*dz)/(d||1)));if(P0&&sc>4)continue;if(!P0&&(vx*dx+vz*dz)/(d||1)<0.4&&d>3)continue;if(sc<bd){bd=sc;best=P;}}
 if(!best){say('🔧 Rien à réparer par ici (vise une construction abîmée ou une ruine).','sys');return;}
 const T=BLD_T[best.t],tp=new THREE.Vector3();player.H.p.tip.getWorldPosition(tp);
 for(let i=0;i<=30;i++){const f=i/30;PA.emit(tp.x+(best.x-tp.x)*f,tp.y+(best.y+1-tp.y)*f,tp.z+(best.z-tp.z)*f,0,0,0,0xfff1a0,0.3,0.05,0.5,0,0);}
 if(best.ruin){best.ruin=false;best.hp=bldMax(best.t)*0.35;if(best.rubble){scene.remove(best.rubble);best.rubble=null;}bldMake(best);floatAt(best.x,best.z,'Reparo ! La ruine se relève','#fff1a0');}
 else{best.hp=Math.min(bldMax(best.t),best.hp+bldMax(best.t)*0.35);bldLook(best);floatAt(best.x,best.z,'Reparo ! '+Math.round(best.hp/bldMax(best.t)*100)+' %','#fff1a0');}
 for(let i=0;i<30;i++){const a=Math.random()*TAU;PA.emit(best.x+Math.cos(a)*1.5,best.y+rnd(0,T.h),best.z+Math.sin(a)*1.5,-Math.cos(a)*1.5,0.5,-Math.sin(a)*1.5,0xfff1a0,0.3,0.05,0.8,0,0.5);}sfx('learn');bldSave();}
{const _u=doUtil;doUtil=function(sp){if(sp&&sp.special==='construo')return castConstruo(sp);if(sp&&sp.special==='reparo')return castReparo(sp);return _u.apply(this,arguments);};}
// ---------- autour d'une construction : enchanter, démolir ----------
const BNEAR={x:1e9,z:1e9,P:null};
station({get x(){return BNEAR.x;},get z(){return BNEAR.z;},reach:2.8,hint:()=>{const P=BNEAR.P;if(!P)return null;const T=BLD_T[P.t];return P.ruin?'🧱 Ruine : '+T.n+' (Reparo la relève)':'🧱 '+T.n+' '+Math.round(P.hp)+'/'+T.hp+(P.inc?' ✨':'');},act:()=>bldMenu(BNEAR.P)});
function bldMenu(P){if(!P)return;const T=BLD_T[P.t],it=[];
 if(P.ruin)it.push({t:'Déblayer la ruine',s:'Récupère un peu de matériau',fn:()=>{bldUnmake(P);BLD.splice(BLD.indexOf(P),1);if(!T.mana)for(const k in T.cost)addItem(k,Math.floor(T.cost[k]/3));$('#pick').classList.add('hidden');bldSave();}});
 else{if(!P.inc)it.push({t:'✨ Enchanter d’incassabilité',s:'1 essence + 1 cristal : plus rien ne pourra la briser (comme le château)',off:(S.inv.essence||0)<1||(S.inv.cristal||0)<1,fn:()=>{S.inv.essence--;S.inv.cristal--;P.inc=true;P.burn=0;P.hp=bldMax(P.t);bldUnmake(P);bldMake(P);$('#pick').classList.add('hidden');sfx('learn');floatAt(P.x,P.z,'Incassable !','#ffd24a');bldSave();}});
  it.push({t:'⛏ Démolir',s:T.mana?'Le cristal se dissipe':'Récupère la moitié des matériaux',fn:()=>{bldUnmake(P);BLD.splice(BLD.indexOf(P),1);if(!T.mana)for(const k in T.cost)addItem(k,Math.floor(T.cost[k]/2));debris(P.x,P.y+1,P.z,T.col,8);$('#pick').classList.add('hidden');bldSave();}});}
 openPick('🧱 '+T.n,P.ruin?'Une ruine. Reparo peut la relever.':'Solidité : '+Math.round(P.hp)+' / '+T.hp+(P.inc?' · ✨ incassable':''),it);}
// ---------- récolter : bois et pierre ----------
const GATHER={x:1e9,z:1e9,what:null,ref:null};
station({get x(){return GATHER.x;},get z(){return GATHER.z;},reach:2.4,hint:()=>GATHER.what==='bois'?'🪓 Couper du bois (+2)':GATHER.what==='pierre'?'⛏ Extraire de la pierre (+2)':null,act:()=>{const R=GATHER.ref;if(!R)return;
 if(GATHER.what==='bois'){R.cut=S.day;addItem('bois',2);for(let i=0;i<14;i++)PN.emit(R.x+rnd(-.4,.4),gh(R.x,R.z)+rnd(0.5,1.5),R.z+rnd(-.4,.4),rnd(-2,2),rnd(1,3),rnd(-2,2),0x8a5a2a,0.25,0.5,0.7,5,0.6,0.9);sfx('impact','nature',R.x,R.z);say('🪵 +2 bois ('+S.inv.bois+').','sys');}
 else{R.mined=gameMin();addItem('pierre',2);debris(R.x,gh(R.x,R.z)+0.8,R.z,0x9a948a,6);sfx('impact','arcane',R.x,R.z);say('🪨 +2 pierre ('+S.inv.pierre+').','sys');}save();}});
const QUARRIES=[];
function buildQuarries(){[['ruines',4,3],['landes_plateau',6,-4]].forEach(([id,ox,oz])=>{const L=LOCBY[id];if(!L)return;let p={x:L.spot.x+ox,z:L.spot.z+oz};if(!isFree(p,1.5))p=freePoint(L,6);const y=gh(p.x,p.z);
  const g=new THREE.Group();g.position.set(p.x,y,p.z);for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.DodecahedronGeometry(rnd(0.35,0.6),0),mat([0x9a948a,0x8a847a,0xa8a296][i%3],{flatShading:true}));m.position.set(rnd(-0.9,0.9),0.3+(i>4?0.5:0),rnd(-0.9,0.9));m.castShadow=true;g.add(m);}
  const pk=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,1.2,6),mat(0x5a3a1e));pk.position.set(0.6,0.9,0.3);pk.rotation.z=0.6;g.add(pk);scene.add(g);QUARRIES.push({x:p.x,z:p.z});addCol({x:p.x,z:p.z,r:0.9,h:y+0.8});});}
{const _b=buildLandes;buildLandes=function(){const r=_b.apply(this,arguments);try{buildQuarries();}catch(e){console.error(e);}return r;};}
// ---------- tick : siège des créatures, feu, recherche des points d'action ----------
function bldTick(dt){if(!started||S.zone!=='monde')return;
 BNEAR.P=null;BNEAR.x=BNEAR.z=1e9;let bd=3.2;for(const P of BLD){const d=Math.hypot(P.x-player.x,P.z-player.z)-Math.max(BLD_T[P.t].w,BLD_T[P.t].d)/2;if(d<bd&&Math.abs(player.y-(P.ruin?gh(P.x,P.z):P.y))<3){bd=d;BNEAR.P=P;}}
 if(BNEAR.P){const P=BNEAR.P;const a=Math.atan2(player.x-P.x,player.z-P.z);BNEAR.x=P.x+Math.sin(a)*0.5;BNEAR.z=P.z+Math.cos(a)*0.5;}
 GATHER.what=null;GATHER.ref=null;GATHER.x=GATHER.z=1e9;
 {let b2=2.6;for(const t of TREES){if(t.st!=='ok'||t.cut===S.day)continue;const d=Math.hypot(t.x-player.x,t.z-player.z);if(d<b2){b2=d;GATHER.what='bois';GATHER.ref=t;}}
  const mins=gameMin();for(const q of QUARRIES.concat(PROPS.filter(p=>p.type==='rock'&&p.dead<=0))){if(q.mined&&mins-q.mined<120)continue;const d=Math.hypot(q.x-player.x,q.z-player.z);if(d<b2+0.6){b2=d;GATHER.what='pierre';GATHER.ref=q;}}
  if(GATHER.ref){GATHER.x=GATHER.ref.x;GATHER.z=GATHER.ref.z;}}
 if(!BLD.length)return;
 for(const P of BLD){if(P.ruin){if(P.rt&&gameMin()-P.rt>360){bldUnmake(P);P.gone=true;}continue;}
  if(P.burn>0){P.burn-=dt;if(Math.random()<dt*12)fireAt(P.x+rnd(-1.2,1.2),P.y+rnd(0.3,BLD_T[P.t].h),P.z+rnd(-0.3,0.3),0.6,1);P.hp-=6*dt;if(P.hp<=0){bldBreak(P);continue;}}
  if(P.t==='porte'&&P.door){const near=Math.hypot(player.x-P.x,player.z-P.z)<2.2;P.door.rotation.y+=((near?1.4:0)-P.door.rotation.y)*Math.min(1,dt*6);}}
 for(let i=BLD.length-1;i>=0;i--)if(BLD[i].gone)BLD.splice(i,1);
 // créatures hostiles : bloquées par les constructions, elles les attaquent
 for(const e of ENT){if(e.kind!=='creature'||e.data.calme||e.data.pet||e.data.charmed||e.data.dragon||e.data.duel)continue;const ey=gh(e.x,e.z);
  for(const P of BLD){const c=P.col;if(!c||P.ruin||(c.bot!==undefined&&ey+1.5<c.bot))continue;const r=(e.data.rad||0.6)*0.8,dx=e.x-c.x,dz=e.z-c.z,px=c.hw+r-Math.abs(dx),pz=c.hd+r-Math.abs(dz);
   if(px>0&&pz>0&&ey<c.h){if(px<pz)e.x+=(dx>=0?1:-1)*px;else e.z+=(dz>=0?1:-1)*pz;if(!P.inc){P.sT=(P.sT||0)-dt;if(P.sT<=0){P.sT=1;bldDamage(P,5,e.data.look);}}}}}
 // boules de feu d'Ignivor
 for(let i=BOSS.fb.length-1;i>=0;i--){const f=BOSS.fb[i];if(f.dl>0)continue;const P=bldAt(f.x,f.z,0.3,f.y)[0];if(P){bldDamage(P,30,'feu');burst(f.x,f.y,f.z,0xff7a2e,14,4);scene.remove(f.o);BOSS.fb.splice(i,1);}}}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{bldTick(dt);}catch(e){console.error(e);}return r;};}
// ---------- mise en place au chargement ----------
{const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);try{BLD.splice(0).forEach(bldUnmake);(S.builds||[]).forEach(b=>{if(!BLD_T[b.t])return;const P=Object.assign({id:++BLDN},b);BLD.push(P);if(P.ruin){P.ruin=false;bldMake(P);bldUnmake(P);P.ruin=true;}else bldMake(P);});}catch(e){console.error(e);}return r;};}
// ---------- apprendre Construo et Reparo, acheter des matériaux : l'Échoppe ----------
{const _s=shopRoot;shopRoot=function(){_s.apply(this,arguments);const L=$('#pick-l'),add=(t,s,off,fn)=>{const b=document.createElement('button');b.className='pk'+(off?' off':'');b.innerHTML='<span>'+t+'</span><small>'+s+'</small>';if(!off)b.onclick=fn;L.appendChild(b);};
  add('🧱 Matériaux','Bois 4 🪙 · Pierre 5 🪙 (par lot de 5)',false,()=>{openPick('🧱 Matériaux','🪙 '+(S.or||0)+' pièces d’or',[{t:'5 bois',s:'20 🪙',off:(S.or||0)<20,fn:()=>{S.or-=20;addItem('bois',5);sfx('pick');save();shopRoot();}},{t:'5 pierres',s:'25 🪙',off:(S.or||0)<25,fn:()=>{S.or-=25;addItem('pierre',5);sfx('pick');save();shopRoot();}},{t:'← Retour',fn:()=>shopRoot()}]);});
  if(!S.spells.some(s=>s.special==='construo'))add('📜 Apprendre Construo et Reparo','Bâtir et réparer · 50 🪙'+(lvl()<3?' (dès le niveau 3)':''),(S.or||0)<50||lvl()<3,()=>{S.or-=50;learnSpell(Object.assign({},CONSTRUO_SP));learnSpell(Object.assign({},REPARO_SP));$('#pick').classList.add('hidden');banner('Construo · Reparo','Bâtis, protège, répare');save();});};}
{const _wc=worldCtx;worldCtx=function(){const r=_wc.apply(this,arguments);try{if(r&&typeof r==='object')r.constructions=BLD.filter(P=>!P.ruin).length+' constructions du joueur (murs, portes, tours…), seules choses destructibles du monde ; sorts Construo / Reparo ; incassabilité par enchantement.';}catch(e){}return r;};}
