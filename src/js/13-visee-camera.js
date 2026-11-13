/* ================= ÉTAPE 6 : VISÉE DOUCE & CAMÉRA LIBRE ================= */
const AIMO={mode:'camera',tap:true,follow:true,sens:1,legacy:false};
try{const a=JSON.parse(localStorage.getItem('aldermoor-aim')||'null');if(a){Object.assign(AIMO,a);AIMO.legacy=false;}}catch(e){}
function aimSave(){try{const o=Object.assign({},AIMO);delete o.legacy;localStorage.setItem('aldermoor-aim',JSON.stringify(o));}catch(e){}}
let CAMZ=1;try{const z=+localStorage.getItem('aldermoor-zoom');if(z)CAMZ=clamp(z,0.5,1.8);}catch(e){}
const AIM={lock:null,lockZone:null,pt:null,ptT:0,soft:null,t:0,side:0,nudge:null,rc:0};
const MK={};
function runeTex(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.translate(64,64);g.strokeStyle='#fff';g.lineCap='round';
 g.lineWidth=4;g.beginPath();g.arc(0,0,57,0,TAU);g.stroke();g.lineWidth=1.6;g.beginPath();g.arc(0,0,45,0,TAU);g.stroke();
 for(let i=0;i<12;i++){g.save();g.rotate(i/12*TAU);g.translate(0,-51);g.lineWidth=2;g.beginPath();const k=i%4;if(k===0){g.moveTo(-3,-3);g.lineTo(3,3);g.moveTo(3,-3);g.lineTo(-3,3);}else if(k===1){g.moveTo(0,-4);g.lineTo(0,4);g.moveTo(-3,-1);g.lineTo(3,-1);}else if(k===2){g.arc(0,0,2.8,0,TAU);}else{g.moveTo(-3,3);g.lineTo(0,-4);g.lineTo(3,3);}g.stroke();g.restore();}
 g.lineWidth=3;for(let i=0;i<4;i++){g.save();g.rotate(i/4*TAU+Math.PI/4);g.beginPath();g.arc(0,0,31,-0.32,0.32);g.stroke();g.restore();}
 return new THREE.CanvasTexture(c);}
function makeMarkers(){const tex=runeTex();const mk=(col,op)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:tex,color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));m.renderOrder=6;m.visible=false;m.frustumCulled=false;scene.add(m);return m;};
 MK.soft=mk(0xf3cf7a,0.4);MK.lock=mk(0xffd27a,0.95);MK.pt=mk(0x9ad8ff,0.9);
 const ch=document.createElement('canvas');ch.width=ch.height=64;const g=ch.getContext('2d');g.fillStyle='#ffe6a8';g.shadowColor='#ffb030';g.shadowBlur=12;g.beginPath();g.moveTo(32,52);g.lineTo(14,20);g.lineTo(32,29);g.lineTo(50,20);g.closePath();g.fill();
 MK.chev=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(ch),transparent:true,depthTest:false,depthWrite:false,fog:false}));MK.chev.scale.set(0.6,0.6,1);MK.chev.renderOrder=9;MK.chev.visible=false;MK.chev.frustumCulled=false;scene.add(MK.chev);
 MK.beam=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,2.6,8,1,true),basic(0x9ad8ff,{transparent:true,opacity:0.45,blending:THREE.AdditiveBlending,depthWrite:false}));MK.beam.visible=false;MK.beam.frustumCulled=false;scene.add(MK.beam);}
const gy0=(x,z)=>S.zone==='monde'?gh(x,z):0;
function tgPos(c){const k=c.kind,r=c.ref;
 if(k==='crea'){const g0=gy0(r.x,r.z);return {x:r.x,y:g0+(r.data.y||1.2),z:r.z,gy:g0,top:g0+(r.data.duel?2.55:(r.data.y||1.2)+0.85),rad:r.data.duel?0.95:0.85};}
 if(k==='event'){const g0=gy0(r.x,r.z);return {x:r.x,y:g0+1.2,z:r.z,gy:g0,top:g0+2.9,rad:1.4};}
 if(k==='chest'){const g0=gy0(r.x,r.z);return {x:r.x,y:g0+0.5,z:r.z,gy:g0,top:g0+1.5,rad:0.95};}
 if(k==='prop')return {x:r.x,y:r.y,z:r.z,gy:gy0(r.x,r.z),top:r.y+r.h+0.45,rad:r.r+0.3};
 if(k==='braz'||k==='seal'||k==='guard'){const g0=gy0(r.x,r.z);return {x:r.x,y:g0+(k==='guard'?1.5:1.25),z:r.z,gy:g0,top:g0+(k==='seal'?3.7:k==='guard'?2.7:2.3),rad:0.95};}
 return {x:r.x,y:r.y,z:r.z,gy:r.y,top:r.y+2.6,rad:0.9};}
function tgAlive(c){const k=c.kind,r=c.ref;if(k==='crea'||k==='event'||k==='chest')return ENT.includes(r)&&!(k==='chest'&&r.data.open);if(k==='prop')return r.dead<=0;if(k==='braz')return !r.lit;if(k==='seal')return !!(S.puz&&!S.puz.seals.open&&!S.puz.seals.on[r.i]);if(k==='guard')return !!(S.puz&&S.puz.ruines&&!S.puz.ruines.open&&!S.puz.ruines.on[r.i]);return true;}
function tgCands(el,all){const out=[];
 for(const e of ENT){if(e.kind==='creature')out.push({kind:'crea',ref:e,pri:e.data.duel?0.4:0.6});
  else if(e.kind==='event'&&(all||!e.data.need||e.data.need===el))out.push({kind:'event',ref:e,pri:0.85});
  else if(e.kind==='chest'&&!e.data.open&&e.data.lock&&(all||(LOCKS[e.data.lock]&&LOCKS[e.data.lock].el===el)))out.push({kind:'chest',ref:e,pri:0.85});}
 if(all||el==='arcane')for(const p of PROPS)if(p.dead<=0)out.push({kind:'prop',ref:p,pri:1.15});
 if(S.zone==='monde'&&S.puz){if(!S.puz.braz.solved&&(all||el==='feu'))BRAZ.forEach(b=>{if(!b.lit)out.push({kind:'braz',ref:b,pri:0.9});});
  if(!S.puz.seals.open)PILLARS.forEach((p,i)=>{if(!S.puz.seals.on[i]&&(all||S.puz.seals.els[i]===el))out.push({kind:'seal',ref:p,pri:0.9});});
  const RU=S.puz.ruines;if(RU&&!RU.open)GUARD.forEach((g,i)=>{if(!RU.on[i]&&(all||RU.els[i]===el))out.push({kind:'guard',ref:g,pri:0.9});});}
 return out;}
function autoTarget(el,dx,dz,creaOnly){let best=null,bs=1e9;for(const c of tgCands(el,false)){if(creaOnly&&c.kind!=='crea')continue;const p=tgPos(c);const vx=p.x-player.x,vz=p.z-player.z,d=Math.hypot(vx,vz);
  if(d<0.6||d>(c.kind==='crea'?18:15))continue;const cs=(vx*dx+vz*dz)/d;if(cs<0.55)continue;if(Math.abs(p.y-(player.y+1.4))>9)continue;const sc=d*(1+2.2*(1-cs))*c.pri;if(sc<bs){bs=sc;best=Object.assign(p,{ref:c.ref,kind:c.kind});}}return best;}
function legacyTarget(el,dx,dz){let best=null,bd=18;ENT.forEach(e=>{if(e.kind!=='creature')return;const vx=e.x-player.x,vz=e.z-player.z,d=Math.hypot(vx,vz);if(d<bd&&(vx*dx+vz*dz)/d>0.5){bd=d;best=e;}});
 if(best)return {x:best.x,z:best.z,y:0,legacy:1};if(el==='arcane'){let bd2=14,bp=null;PROPS.forEach(p=>{if(p.dead>0)return;const vx=p.x-player.x,vz=p.z-player.z,d=Math.hypot(vx,vz);if(d<bd2&&(vx*dx+vz*dz)/d>0.6){bd2=d;bp=p;}});if(bp)return {x:bp.x,z:bp.z,y:0,legacy:1};}return null;}
function castTarget(el,dx,dz,util){if(AIMO.legacy)return util?null:legacyTarget(el,dx,dz);
 if(AIM.lock){if(tgAlive(AIM.lock)&&AIM.lockZone===S.zone){const p=tgPos(AIM.lock);if(Math.hypot(p.x-player.x,p.z-player.z)<32)return Object.assign(p,{ref:AIM.lock.ref,kind:AIM.lock.kind});}else AIM.lock=null;}
 if(AIM.pt){const p=AIM.pt,d=Math.hypot(p.x-player.x,p.z-player.z);if(d<32&&d>0.8)return {x:p.x,y:p.y+0.15,z:p.z,gy:p.y,kind:'pt'};}
 return util?null:autoTarget(el,dx,dz,false);}
function utilPt(max){const p=AIM.pt;if(!p)return null;return Math.hypot(p.x-player.x,p.z-player.z)<=max?p:null;}
function utilDist(max){const p=AIM.pt;if(!p)return max;const d=Math.hypot(p.x-player.x,p.z-player.z);return d<=max*1.4?d:max;}
function lockedProp(){return AIM.lock&&AIM.lock.kind==='prop'&&AIM.lock.ref.dead<=0?AIM.lock.ref:null;}
/* tir : trajectoire vers la cible (hauteur comprise) + légère correction en vol */
function aimShot(T,D,ox,oy,oz,dx,dz){let vx=dx*D.spd,vy=D.vy,vz=dz*D.spd,life=D.life;if(!T||T.legacy)return {vx,vy,vz,life,ht:null};
 const tx=T.x-ox,ty=T.y-oy,tz=T.z-oz,hd=Math.hypot(tx,tz)||0.01;
 if(D.grav>0){const t=hd/D.spd;vy=clamp((ty+0.5*D.grav*t*t)/t,-6,16);life=Math.max(life,t+0.35);}else{const L=Math.hypot(hd,ty)||0.01;vx=tx/L*D.spd;vy=ty/L*D.spd;vz=tz/L*D.spd;life=Math.max(life,L/D.spd+0.25);}
 return {vx,vy,vz,life,ht:T.kind&&T.kind!=='pt'?{kind:T.kind,ref:T.ref}:null,tp:T.kind==='pt'?{x:T.x,z:T.z}:null};}
function homeProj(p,dt){const c=p.ht;if(!tgAlive(c)){p.ht=null;return;}const T=tgPos(c),o=p.o.position;const dx=T.x-o.x,dy=T.y-o.y,dz=T.z-o.z,d=Math.hypot(dx,dy,dz);if(d<0.9){p.ht=null;return;}
 const turn=(c.kind==='crea'&&c.ref.data.duel?0.9:4.2)*dt;
 if(p.grav>0){const sp=Math.hypot(p.vx,p.vz);const a0=Math.atan2(p.vx,p.vz),a1=Math.atan2(dx,dz);let da=Math.atan2(Math.sin(a1-a0),Math.cos(a1-a0));da=clamp(da,-turn,turn);p.vx=Math.sin(a0+da)*sp;p.vz=Math.cos(a0+da)*sp;return;}
 const sp=Math.hypot(p.vx,p.vy,p.vz)||1;const cx=p.vx/sp,cy=p.vy/sp,cz=p.vz/sp,wx=dx/d,wy=dy/d,wz=dz/d;const dot=clamp(cx*wx+cy*wy+cz*wz,-1,1),ang=Math.acos(dot);
 if(ang<1e-4)return;const k=Math.min(1,turn/ang);let nx=cx+(wx-cx)*k,ny=cy+(wy-cy)*k,nz=cz+(wz-cz)*k;const nl=Math.hypot(nx,ny,nz)||1;p.vx=nx/nl*sp;p.vy=ny/nl*sp;p.vz=nz/nl*sp;
 if(p.el==='glace')p.o.lookAt(o.x+p.vx,o.y+p.vy,o.z+p.vz);}
function camNudge(yaw){if(AIMO.mode!=='camera'||(AIM.lock&&AIMO.follow))return;const d=Math.atan2(Math.sin(yaw-camYaw),Math.cos(yaw-camYaw));if(Math.abs(d)>0.3)AIM.nudge={yaw:camYaw+d*0.6,t:0.6};}
{const _cs3=castSpell;castSpell=function(sp){if(DUEL)DUEL.lastForm=sp.form;const now=performance.now()/1000;const ok=!((CD[sp.id]||0)>now||player.cd>0||mana<spellCost(sp));let usedPt=false;
 if(ok&&sp.form!=='zone'){let yaw=(AIMO.mode==='camera'||AIMO.mode==='libre')&&!AIMO.legacy?camYaw:player.ry;const T=castTarget(sp.el,Math.sin(yaw),Math.cos(yaw),sp.form==='util');if(T){yaw=Math.atan2(T.x-player.x,T.z-player.z);usedPt=T.kind==='pt';camNudge(yaw);}player.ry=yaw;}
 const r=_cs3.apply(this,arguments);if(ok&&usedPt)AIM.pt=null;return r;};}
/* ---------- toucher l'écran : viser, parler, recentrer ; pincer : zoom ---------- */
const TAP={id:null,x:0,y:0,t:0,last:0,lx:0,ly:0,ms:450,dbl:420},PINCH={on:false,id:null,x:0,y:0,d0:1,z0:1};
const RC=new THREE.Raycaster(),NDC=new THREE.Vector2(),PV=new THREE.Vector3();
function groundPick(x,y){NDC.set(x/window.innerWidth*2-1,-(y/window.innerHeight)*2+1);RC.setFromCamera(NDC,camera);const o=RC.ray.origin,d=RC.ray.direction;
 const hAt=(px,pz)=>{let h=gy0(px,pz);if(S.zone==='monde'&&inLake({x:px,z:pz}))h=Math.max(h,0.06);return h;};
 for(let t=0.6;t<72;t+=0.4){const px=o.x+d.x*t,py=o.y+d.y*t,pz=o.z+d.z*t;if(py<=hAt(px,pz)){let a=t-0.4,b=t;for(let k=0;k<7;k++){const m=(a+b)/2;if(o.y+d.y*m<=hAt(o.x+d.x*m,o.z+d.z*m))b=m;else a=m;}
   const hx=o.x+d.x*b,hz=o.z+d.z*b;return {x:hx,y:hAt(hx,hz),z:hz};}}return null;}
function scr(x,y,z){PV.set(x,y,z).project(camera);if(PV.z>1||PV.z<-1)return null;return [(PV.x+1)/2*window.innerWidth,(1-PV.y)/2*window.innerHeight];}
function recenter(){AIM.rc=0.7;AIM.nudge={yaw:player.ry,t:0.7};sfx('click');}
function onTap(x,y){if(!started||anyModal())return;const now=performance.now();
 if(now-TAP.last<TAP.dbl&&Math.hypot(x-TAP.lx,y-TAP.ly)<50){TAP.last=0;recenter();return;}TAP.last=now;TAP.lx=x;TAP.ly=y;if(!AIMO.tap)return;
 let best=null,bd=1e9;
 for(const n of npcs){if(n.sleep||n.inDuel||!n.obj.visible)continue;const dw=Math.hypot(n.x-player.x,n.z-player.z);if(dw>5)continue;const s=scr(n.x,gy0(n.x,n.z)+1.1,n.z);if(!s)continue;const dp=Math.hypot(s[0]-x,s[1]-y);if(dp<60&&dp<bd){bd=dp;best={npc:n};}}
 const H=window.innerHeight;for(const c of tgCands(S.lastEl||'arcane',true)){const p=tgPos(c);const dw=Math.hypot(p.x-player.x,p.z-player.z);if(dw>32)continue;const s=scr(p.x,p.y,p.z);if(!s)continue;
  const dc=camera.position.distanceTo(PV.set(p.x,p.y,p.z));const rp=clamp(p.rad*H/(dc+0.5)*0.9,30,95);const dp=Math.hypot(s[0]-x,s[1]-y);if(dp<rp&&dp*c.pri<bd){bd=dp*c.pri;best=c;}}
 if(best&&best.npc){focus={t:'npc',n:best.npc};interact();return;}
 if(best){if(AIM.lock&&AIM.lock.ref===best.ref){AIM.lock=null;sfx('click');return;}AIM.lock={kind:best.kind,ref:best.ref};AIM.lockZone=S.zone;AIM.pt=null;sfx('lock');
  if(!S.seenLock){S.seenLock=1;say('🎯 <b>Cible verrouillée</b> : tes sorts filent vers elle et la caméra la garde en vue. Touche-la à nouveau pour la libérer. Touche le sol pour viser un point, touche deux fois pour recentrer la caméra.','sys');}return;}
 const g=groundPick(x,y);if(g&&Math.hypot(g.x-player.x,g.z-player.z)<30){AIM.pt=g;AIM.ptT=8;AIM.lock=null;sfx('lock');if(!S.seenPt){S.seenPt=1;say('📍 <b>Point visé</b> : ton prochain sort part vers ce point (le pas d’ombre t’y téléporte, le champignon y pousse…).','sys');}}
 else{AIM.lock=null;AIM.pt=null;}}
canvas.addEventListener('pointerdown',e=>{if(!started)return;if(drag.id===null){TAP.id=e.pointerId;TAP.x=e.clientX;TAP.y=e.clientY;TAP.t=performance.now();}
 else if(!PINCH.on&&e.pointerId!==drag.id){PINCH.on=true;PINCH.id=e.pointerId;PINCH.x=e.clientX;PINCH.y=e.clientY;PINCH.d0=Math.hypot(e.clientX-drag.x,e.clientY-drag.y)||1;PINCH.z0=CAMZ;TAP.id=null;}});
window.addEventListener('pointermove',e=>{if(e.pointerId===TAP.id&&Math.hypot(e.clientX-TAP.x,e.clientY-TAP.y)>10)TAP.id=null;
 if(PINCH.on){if(e.pointerId===PINCH.id){PINCH.x=e.clientX;PINCH.y=e.clientY;}const ox=e.pointerId===drag.id?e.clientX:drag.x,oy=e.pointerId===drag.id?e.clientY:drag.y;const d=Math.hypot(PINCH.x-ox,PINCH.y-oy)||1;CAMZ=clamp(PINCH.z0*PINCH.d0/d,0.5,1.8);}});
function tapUp(e){if(PINCH.on&&(e.pointerId===PINCH.id||e.pointerId===drag.id)){PINCH.on=false;PINCH.id=null;try{localStorage.setItem('aldermoor-zoom',CAMZ.toFixed(2));}catch(er){}}
 if(e.pointerId===TAP.id){TAP.id=null;if(performance.now()-TAP.t<TAP.ms&&e.type==='pointerup')onTap(e.clientX,e.clientY);}}
window.addEventListener('pointerup',tapUp);window.addEventListener('pointercancel',tapUp);
canvas.addEventListener('wheel',e=>{e.preventDefault();CAMZ=clamp(CAMZ*Math.exp(e.deltaY*0.0012),0.5,1.8);try{localStorage.setItem('aldermoor-zoom',CAMZ.toFixed(2));}catch(er){}},{passive:false});
window.addEventListener('keydown',e=>{if(!started||anyModal()||e.target.tagName==='INPUT')return;
 if(e.code==='Tab'){e.preventDefault();const yaw=camYaw,fx=Math.sin(yaw),fz=Math.cos(yaw);const L=tgCands(S.lastEl||'arcane',true).map(c=>{const p=tgPos(c),vx=p.x-player.x,vz=p.z-player.z,d=Math.hypot(vx,vz);return {c,d,a:Math.atan2(vx*fz-vz*fx,vx*fx+vz*fz)};}).filter(o=>o.d<24&&Math.abs(o.a)<1.2).sort((a,b)=>a.a-b.a);
  if(!L.length){AIM.lock=null;return;}let i=AIM.lock?L.findIndex(o=>o.c.ref===AIM.lock.ref):-1;const n=L[(i+1)%L.length].c;AIM.lock={kind:n.kind,ref:n.ref};AIM.lockZone=S.zone;AIM.pt=null;sfx('lock');}
 if(e.code==='KeyC')recenter();});
/* ---------- marqueurs & caméra qui suit la cible ---------- */
function placeMk(m,p,size,rot,op){if(!p){m.visible=false;return;}m.visible=true;m.position.set(p.x,p.gy+0.08,p.z);m.scale.set(size,1,size);m.rotation.y=rot;if(op!=null)m.material.opacity=op;}
function aimTick(dt){if(!MK.soft)makeMarkers();const t=performance.now()/1000;
 if(AIM.lock&&(!tgAlive(AIM.lock)||AIM.lockZone!==S.zone)){AIM.lock=null;}
 if(AIM.lock){const p=tgPos(AIM.lock);if(Math.hypot(p.x-player.x,p.z-player.z)>34)AIM.lock=null;}
 if(AIM.pt){AIM.ptT-=dt;if(AIM.ptT<=0||Math.hypot(AIM.pt.x-player.x,AIM.pt.z-player.z)>34)AIM.pt=null;}
 AIM.t-=dt;if(AIM.t<=0){AIM.t=0.12;const yaw=AIMO.mode==='camera'?camYaw:player.ry;const s=(!AIM.lock&&!AIM.pt&&!AIMO.legacy)?autoTarget(S.lastEl||'arcane',Math.sin(yaw),Math.cos(yaw),true):null;AIM.soft=s?{kind:s.kind,ref:s.ref}:null;}
 const lp=AIM.lock?tgPos(AIM.lock):null,sp=AIM.soft&&tgAlive(AIM.soft)?tgPos(AIM.soft):null;
 placeMk(MK.lock,lp,lp?lp.rad*2.6*(1+0.06*Math.sin(t*5)):1,t*1.1,0.95);placeMk(MK.soft,lp?null:sp,sp?sp.rad*2.4:1,-t*0.6,0.35+0.1*Math.sin(t*3));
 const pp=AIM.pt?{x:AIM.pt.x,gy:AIM.pt.y,z:AIM.pt.z}:null;placeMk(MK.pt,pp,1.7*(1+0.08*Math.sin(t*6)),t*1.4,Math.min(0.9,AIM.ptT*0.5));MK.beam.visible=!!pp;if(pp){MK.beam.position.set(pp.x,pp.gy+1.3,pp.z);MK.beam.material.opacity=0.35*Math.min(1,AIM.ptT*0.5);}
 const cp=lp||(sp?sp:null);MK.chev.visible=!!cp;if(cp){MK.chev.position.set(cp.x,cp.top+0.15*Math.sin(t*4),cp.z);MK.chev.material.opacity=lp?1:0.5;const k=lp?0.6:0.45;MK.chev.scale.set(k,k,1);}
 const follow=AIM.lock&&AIMO.follow&&S.zone==='monde';AIM.side+=((follow||(libre()&&!TALK&&S.zone==='monde')?1:0)-AIM.side)*Math.min(1,dt*3);
 const free=drag.id===null&&!anyModal();
 if(follow&&free){const want=Math.atan2(lp.x-player.x,lp.z-player.z);const d=Math.atan2(Math.sin(want-camYaw),Math.cos(want-camYaw));if(Math.abs(d)>0.28)camYaw+=(d-Math.sign(d)*0.28)*Math.min(1,dt*3.2);}
 else if(AIM.nudge&&free){AIM.nudge.t-=dt;const d=Math.atan2(Math.sin(AIM.nudge.yaw-camYaw),Math.cos(AIM.nudge.yaw-camYaw));camYaw+=d*Math.min(1,dt*5);if(AIM.nudge.t<=0||Math.abs(d)<0.02)AIM.nudge=null;}
 if(AIM.rc>0){AIM.rc-=dt;camPitch+=(0.38-camPitch)*Math.min(1,dt*6);CAMZ+=(1-CAMZ)*Math.min(1,dt*6);}}
SFX.lock=()=>{tone({f:mf(86),dur:0.18,v:0.07,type:'triangle'});tone({t:AU.ctx.currentTime+0.06,f:mf(93),dur:0.3,v:0.06,type:'triangle',rev:0.3});};

