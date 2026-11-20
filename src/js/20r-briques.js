/* ================= BRIQUES : construire pièce par pièce, avec de la vraie physique =================
   Dans la palette de Construo (section « Briques ») : brique de pierre, brique de bois, poutre, dalle, brique de
   cristal (elle flotte là où on la pose). Elles se posent sur une grille de 0,9 m, s'EMPILENT (sur le sol ou sur
   d'autres briques) et TOMBENT si on retire ce qui les porte.
   Les sorts ont de la force dessus : le vent (bourrasque, zone) les projette, l'Arcane les fait léviter, les
   explosions les dispersent, le feu brûle le bois, la Glace les fige, l'eau éteint. Elles s'abîment (couleur plus
   sombre) puis CASSENT (coups, sorts, chute trop haute, créatures qui frappent). Reparo les remet en état.
   Rendu : un InstancedMesh par type (peu d'appels de dessin). Collision : une entrée COLS par brique (on marche dessus). S.bricks. */
const BRK_T={
 pierre:{n:'Brique de pierre',w:0.9,h:0.9,d:0.9,hp:40,mass:2,cost:{pierre:1},col:0x948f84},
 bois:{n:'Brique de bois',w:0.9,h:0.9,d:0.9,hp:25,mass:1,cost:{bois:1},wood:true,col:0x8a6238},
 poutre:{n:'Poutre de bois',w:2.7,h:0.3,d:0.3,hp:30,mass:1.2,cost:{bois:2},wood:true,col:0x6e4a2c},
 dalle:{n:'Dalle de pierre',w:1.8,h:0.3,d:1.8,hp:50,mass:2.5,cost:{pierre:2},col:0x8a857a},
 cristal:{n:'Brique de cristal',w:0.9,h:0.9,d:0.9,hp:30,mass:0.6,mana:12,float:true,col:0x9fd8ff}};
const BRK=[];let BRKN=0,BRKSAVE=0;const BRKI={};const BRM=new THREE.Matrix4(),BRQ=new THREE.Quaternion(),BRP=new THREE.Vector3(),BRS=new THREE.Vector3(1,1,1),BRC=new THREE.Color(),BRUP=new THREE.Vector3(0,1,0);
function brkInst(t){if(BRKI[t])return BRKI[t];const T=BRK_T[t],geo=new THREE.BoxGeometry(T.w,T.h,T.d);geo.translate(0,T.h/2,0);
 const m=t==='cristal'?new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x2a6aa8,emissiveIntensity:0.7,transparent:true,opacity:0.7,roughness:0.15}):mat(0xffffff,{flatShading:true,roughness:0.9});
 const I=new THREE.InstancedMesh(geo,m,1024);I.count=0;I.castShadow=t!=='cristal';I.receiveShadow=true;I.frustumCulled=false;scene.add(I);BRKI[t]=I;return I;}
function brkSync(){const by={};for(const b of BRK)(by[b.t]=by[b.t]||[]).push(b);
 for(const t in BRK_T){const L=by[t]||[];if(!L.length&&!BRKI[t])continue;const I=brkInst(t);I.count=Math.min(1024,L.length);
  L.slice(0,1024).forEach((b,i)=>{BRQ.setFromAxisAngle(BRUP,b.rot);BRP.set(b.x,b.y,b.z);if(b.lev>0||b.tilt){const e=new THREE.Euler(b.tilt||0,b.rot,b.tilt?b.tilt*0.6:0);BRQ.setFromEuler(e);}BRM.compose(BRP,BRQ,BRS);I.setMatrixAt(i,BRM);
   const k=b.hp/BRK_T[t].hp;BRC.setHex(BRK_T[t].col).multiplyScalar(0.45+0.55*k);if(b.frozen>0)BRC.lerp(new THREE.Color(0xcff4ff),0.6);if(b.burn>0)BRC.lerp(new THREE.Color(0xff7a2e),0.35);if(b.inc)BRC.lerp(new THREE.Color(0xffd24a),0.3);I.setColorAt(i,BRC);});
  I.instanceMatrix.needsUpdate=true;if(I.instanceColor)I.instanceColor.needsUpdate=true;}}
function brkCol(b){const T=BRK_T[b.t],q=Math.abs(Math.sin(b.rot))>0.5;b.hw=(q?T.d:T.w)/2;b.hd=(q?T.w:T.d)/2;if(!b.col){b.col={brk:b};COLS.push(b.col);}Object.assign(b.col,{x:b.x,z:b.z,hw:b.hw,hd:b.hd,h:b.y+T.h,bot:b.y});}
// le dessus le plus haut sous une emprise (sol ou briques)
function brkFloor(x,z,hw,hd,yMax,self){let f=gh(x,z);for(const o of BRK){if(o===self)continue;if(Math.abs(o.x-x)<(o.hw+hw)*0.85&&Math.abs(o.z-z)<(o.hd+hd)*0.85){const top=o.y+BRK_T[o.t].h;if(top<=yMax+0.12&&top>f)f=top;}}return f;}
function brkWake(x,z,y,r){for(const o of BRK)if(Math.hypot(o.x-x,o.z-z)<(r||2.2)&&o.y>=y-0.1){o.awake=true;if(o.fixed&&o.y>y+0.3)o.fixed=false;}} /* ce qui était porté s’effondre */
// ---------- poser ----------
function brkPlace(t){const T=BRK_T[t],Q=BLDQ;$('#pick').classList.add('hidden');if(!Q)return;if(T.mana?mana<T.mana:!Object.entries(T.cost).every(([k,n])=>(S.inv[k]||0)>=n)){say('Il te manque des matériaux.','sys');return;}
 if(BRK.filter(b=>!b.st).length>=240){say('Trop de briques (240) : casses-en d’abord.','sys');return;}
 const rot=Q.rot,q=Math.abs(Math.sin(rot))>0.5,hw=(q?T.d:T.w)/2,hd=(q?T.w:T.d)/2;let x=Math.round(Q.x/0.9)*0.9,z=Math.round(Q.z/0.9)*0.9;
 let y=T.float&&Q.air?Q.y:brkFloor(x,z,hw,hd,1e9,null);if(!T.float&&!Q.air){const top=brkFloor(x,z,hw,hd,1e9,null);y=top;}
 if(COLS.some(c=>!c.bld&&!c.brk&&!c.lake&&!c.off&&c.bot===undefined&&(c.r!==undefined?Math.hypot(x-c.x,z-c.z)<c.r+hw*0.6:Math.abs(x-c.x)<c.hw+hw*0.6&&Math.abs(z-c.z)<c.hd+hd*0.6)&&(c.h===undefined||c.h>y+0.2))){say('🧱 Pas de place ici.','sys');return;}
 if(Math.abs(x-player.x)<hw+0.35&&Math.abs(z-player.z)<hd+0.35&&Math.abs(y-player.y)<1.8){const [dx,dz]=fwd();x=Math.round((x+dx*1.2)/0.9)*0.9;z=Math.round((z+dz*1.2)/0.9)*0.9;y=T.float&&Q.air?Q.y:brkFloor(x,z,hw,hd,1e9,null);}
 if(T.mana)mana-=T.mana;else for(const k in T.cost)S.inv[k]-=T.cost[k];
 const b={id:++BRKN,t,x,y,z,rot,hp:T.hp,vx:0,vy:0,vz:0,lev:0,awake:false};BRK.push(b);brkCol(b);S.bldLast='b:'+t;brkSync();
 for(let i=0;i<10;i++)PN.emit(x+rnd(-.5,.5),y+rnd(0,T.h),z+rnd(-.5,.5),0,rnd(.3,1),0,T.col,0.3,0.4,0.5,0,0.6,0.8);sfx('pick');BRKSAVE=1;}
// la palette de Construo gagne une section « Briques »
{const _c=castConstruo;castConstruo=function(sp){_c.apply(this,arguments);if(S.zone!=='monde')return;const L=$('#pick-l');if(!L)return;
  const h=document.createElement('div');h.className='sec';h.textContent='Briques (s’empilent, tombent, cassent)';L.appendChild(h);
  const last=S.bldLast&&S.bldLast.startsWith('b:')?S.bldLast.slice(2):null;
  for(const [k,T] of Object.entries(BRK_T)){const ok=T.mana?mana>=T.mana:Object.entries(T.cost).every(([kk,n])=>(S.inv[kk]||0)>=n);const b=document.createElement('button');b.className='pk'+(ok?'':' off');
   b.innerHTML='<span>'+(k===last?'⟳ ':'')+T.n+'</span><small>'+(T.mana?T.mana+' mana':Object.entries(T.cost).map(([kk,n])=>n+' '+INGR[kk].n.toLowerCase()).join(' + '))+' · solidité '+T.hp+(T.float?' · flotte':'')+'</small>';if(ok)b.onclick=()=>brkPlace(k);
   if(k===last)L.insertBefore(b,L.firstChild);else L.appendChild(b);}};}
// ---------- abîmer, casser ----------
const BRK_EL={feu:0.8,glace:0.4,eau:0.2,vent:0.5,nature:0.6,lumiere:0.9,ombre:1,arcane:1.4};
function brkDamage(b,n,el){if(!b||b.dead||b.inc)return;const T=BRK_T[b.t];let k=el?BRK_EL[el]||1:1;if(el==='feu'&&T.wood){k=2;b.burn=Math.max(b.burn||0,4);}if(b.t==='cristal'&&el==='ombre')k=2;b.hp-=n*k;b.awake=true;
 if(b.hp<=0)brkBreak(b);}
function brkBreak(b){const T=BRK_T[b.t];b.dead=true;debris(b.x,b.y+T.h/2,b.z,T.col,6);const i=COLS.indexOf(b.col);if(i>=0)COLS.splice(i,1);BRK.splice(BRK.indexOf(b),1);brkWake(b.x,b.z,b.y,2.5);BRKSAVE=1;}
function brkForce(x,z,r,el,n){for(const b of BRK.slice()){const d=Math.hypot(b.x-x,b.z-z);if(d>r+0.6)continue;b.fixed=false;const f=1-Math.min(1,d/(r+0.6)),T=BRK_T[b.t],ux=(b.x-x)/(d||1),uz=(b.z-z)/(d||1);b.awake=true;
  if(el==='vent'){b.vx+=ux*14*f/T.mass;b.vz+=uz*14*f/T.mass;b.vy+=4*f/T.mass;}
  else if(el==='arcane'&&n<60){b.lev=4.5;b.ly=b.y+2.2;}
  else if(el==='glace'){b.frozen=5;}
  else if(el==='eau'){b.burn=0;b.vx+=ux*3*f;b.vz+=uz*3*f;}
  else{b.vx+=ux*6*f/T.mass;b.vz+=uz*6*f/T.mass;b.vy+=3*f/T.mass;}
  brkDamage(b,n*f,el);}}
{const _eh=elemHit;elemHit=function(el,x,z,r){const res=_eh.apply(this,arguments);try{if(BRK.length)brkForce(x,z,Math.min(r||2,5),el,14*Math.min(2,pow(el)));}catch(e){}return res;};}
{const _bh=bldHit;bldHit=function(x,z,r,el,n,y){const res=_bh.apply(this,arguments);if(n>=60)brkForce(x,z,r+1.5,el,n*0.5);return res;};}
{const _g=gust;gust=function(dx,dz){const r=_g.apply(this,arguments);const R=10*pow('vent');for(const b of BRK){const vx=b.x-player.x,vz=b.z-player.z,d=Math.hypot(vx,vz);if(d<R&&(vx*dx+vz*dz)/(d||1)>0.6){const T=BRK_T[b.t],f=1-d/R;b.vx+=dx*16*f/T.mass;b.vz+=dz*16*f/T.mass;b.vy+=3*f/T.mass;b.awake=true;b.fixed=false;brkWake(b.x,b.z,b.y);}}return r;};}
// Reparo : répare aussi les briques autour du point visé
{const _r=castReparo;castReparo=function(sp){const P=utilPt(25),[dx,dz]=fwd(),c=P||{x:player.x+dx*4,z:player.z+dz*4};const L=BRK.filter(b=>b.hp<BRK_T[b.t].hp&&Math.hypot(b.x-c.x,b.z-c.z)<4);
  if(L.length){L.forEach(b=>{b.hp=Math.min(BRK_T[b.t].hp,b.hp+BRK_T[b.t].hp*0.4);burst(b.x,b.y+0.5,b.z,0xfff1a0,8,2);});floatAt(c.x,c.z,'Reparo ! '+L.length+' brique'+(L.length>1?'s':''),'#fff1a0');sfx('learn');brkSync();BRKSAVE=1;return;}return _r.apply(this,arguments);};}
// ---------- physique ----------
/* collision avec le décor et les constructions (pas les autres briques : gérées à part), en tenant compte de la hauteur */
function brkWorld(b,T){const top=b.y+T.h;for(const c of COLS){if(c.brk||c.lake||c.off)continue;if(c.h!==undefined&&b.y>=c.h-0.05)continue;if(c.bot!==undefined&&top<=c.bot+0.05)continue;
  if(c.r!==undefined){const dx=b.x-c.x,dz=b.z-c.z,d=Math.hypot(dx,dz),m=c.r+Math.min(b.hw,b.hd);if(d<m){const k=m/(d||1);b.x=c.x+dx*k;b.z=c.z+dz*k;b.vx*=-0.3;b.vz*=-0.3;}}
  else{const dx=b.x-c.x,dz=b.z-c.z,px=c.hw+b.hw-Math.abs(dx),pz=c.hd+b.hd-Math.abs(dz);if(px>0&&pz>0){if(px<pz){b.x+=(dx>=0?1:-1)*px;b.vx*=-0.3;}else{b.z+=(dz>=0?1:-1)*pz;b.vz*=-0.3;}}}}}
function brkTick(dt){if(!started||!BRK.length||S.zone!=='monde')return;let moved=false;
 for(const b of BRK.slice().sort((a,c)=>a.y-c.y)){/* du bas vers le haut : celles du dessous se posent d’abord */const T=BRK_T[b.t];if(b.burn>0){b.burn-=dt;if(Math.random()<dt*8)fireAt(b.x,b.y+T.h,b.z,0.4,1);brkDamage(b,5*dt,null);if(b.dead)continue;}
  if(b.frozen>0){b.frozen-=dt;continue;}if(!b.awake&&!(b.lev>0))continue;if(b.fixed){b.awake=false;continue;} /* brique de structure : tient en place tant qu’on ne la touche pas */
  if(b.lev>0){b.lev-=dt;b.vy+=((b.ly-b.y)*8-b.vy*3)*dt;b.vx*=1-2*dt;b.vz*=1-2*dt;b.tilt=Math.sin(performance.now()/300+b.id)*0.15;if(Math.random()<0.3)PA.emit(b.x,b.y,b.z,0,-0.4,0,ELEM.arcane.c,0.25,0.05,0.6,0,0);if(b.lev<=0)b.tilt=0;}
  else if(!T.float)b.vy-=22*dt;else{b.vy*=1-4*dt;}
  const ox=b.x,oz=b.z,oy=b.y;b.x+=b.vx*dt;b.z+=b.vz*dt;b.y+=b.vy*dt;
  // monde : on ne traverse pas les murs du décor
  brkWorld(b,T);
  // autres briques : on se pose dessus, ou on se pousse de côté
  for(const q of BRK){if(q===b)continue;const QT=BRK_T[q.t],ix=(b.hw+q.hw)-Math.abs(b.x-q.x),iz=(b.hd+q.hd)-Math.abs(b.z-q.z);if(ix<=0.02||iz<=0.02)continue;const iy=Math.min(b.y+T.h,q.y+QT.h)-Math.max(b.y,q.y);if(iy<=0.02)continue;
   if(b.y>q.y+QT.h*0.5){b.y=q.y+QT.h;if(b.vy<0)b.vy=0;}else if(ix<iz){const s=b.x>=q.x?1:-1;b.x+=s*ix*0.5;q.x-=s*ix*0.5;q.awake=true;b.vx*=0.3;}else{const s=b.z>=q.z?1:-1;b.z+=s*iz*0.5;q.z-=s*iz*0.5;q.awake=true;b.vz*=0.3;}}
  const fl=T.float?-1e9:brkFloor(b.x,b.z,b.hw,b.hd,Math.max(oy,b.y),b); /* appui cherché sous la position d’AVANT le mouvement (pas de traversée en tombant vite) */
  if(b.y<=fl){if(b.vy<-9){brkDamage(b,(-b.vy-9)*6,null);if(b.dead)continue;burst(b.x,fl,b.z,0x998866,6,2);}b.y=fl;b.vy=0;const fr=Math.max(0,1-8*dt);b.vx*=fr;b.vz*=fr;}
  if(T.float&&b.lev<=0){const fr=Math.max(0,1-3*dt);b.vx*=fr;b.vz*=fr;}
  if(Math.abs(b.x-ox)+Math.abs(b.z-oz)+Math.abs(b.y-oy)>0.002)brkWake(b.x,b.z,b.y+0.1,1.6); /* ce qu’elle porte doit suivre */
  if(b.lev<=0&&Math.hypot(b.vx,b.vy,b.vz)<0.05&&(T.float||b.y<=fl+0.001))b.awake=false;
  // un bloc lancé à pleine vitesse blesse les créatures
  if(Math.hypot(b.vx,b.vz)>6)for(const e of ENT){if(e.kind==='creature'&&!e.data.calme&&!e.data.pet&&Math.hypot(e.x-b.x,e.z-b.z)<b.hw+0.8&&!(e.data.bkT>0)){e.data.bkT=0.6;hurtCreature(e,'arcane',b.x,b.z);}}
  brkCol(b);moved=true;}
 for(const e of ENT){if(e.data&&e.data.bkT>0)e.data.bkT-=dt;}
 // créatures : bloquées par les briques, elles les frappent
 for(const e of ENT){if(e.kind!=='creature'||e.data.calme||e.data.pet||e.data.charmed||e.data.dragon||e.data.duel)continue;const ey=gh(e.x,e.z);
  for(const b of BRK){const T=BRK_T[b.t];if(ey+1.4<b.y||ey>b.y+T.h)continue;const r=(e.data.rad||0.6)*0.7,dx=e.x-b.x,dz=e.z-b.z,px=b.hw+r-Math.abs(dx),pz=b.hd+r-Math.abs(dz);
   if(px>0&&pz>0){if(px<pz)e.x+=(dx>=0?1:-1)*px;else e.z+=(dz>=0?1:-1)*pz;b.sT=(b.sT||0)-dt;if(b.sT<=0){b.sT=1;brkDamage(b,4,e.data.look);}}}}
 brkSync();if(BRKSAVE>0)BRKSAVE+=dt*(moved?0:1);if(BRKSAVE>3){BRKSAVE=0;S.bricks=BRK.filter(b=>!b.st).map(b=>({t:b.t,x:+b.x.toFixed(2),y:+b.y.toFixed(2),z:+b.z.toFixed(2),rot:b.rot,hp:Math.round(b.hp),inc:!!b.inc}));save();}}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{brkTick(dt);}catch(e){console.error(e);}return r;};}
{const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);try{BRK.splice(0).forEach(b=>{const i=COLS.indexOf(b.col);if(i>=0)COLS.splice(i,1);});(S.bricks||[]).forEach(s=>{if(!BRK_T[s.t])return;const b=Object.assign({id:++BRKN,vx:0,vy:0,vz:0,lev:0,awake:false},s);BRK.push(b);brkCol(b);});brkSync();}catch(e){console.error(e);}return r;};}
